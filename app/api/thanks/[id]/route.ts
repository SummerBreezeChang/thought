import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";
import { DATA_DIR, store } from "@/server/store/store";

/** Largest slice we send at once: Vercel functions cap responses at 4.5 MB. */
const MAX_CHUNK = 4 * 1024 * 1024;

async function load(t: { videoFile: string; blobPathname?: string }): Promise<Uint8Array<ArrayBuffer> | null> {
  if (t.blobPathname) {
    const r = await get(t.blobPathname, { access: "private" }).catch(() => null);
    if (!r || r.statusCode !== 200) return null;
    return new Uint8Array(await new Response(r.stream).arrayBuffer());
  }
  return new Uint8Array(await readFile(path.join(DATA_DIR, "videos", path.basename(t.videoFile))));
}

/** Serves a thank-you video, with byte ranges so Safari can play it. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = (await store.thankYous()).find((x) => x.id === id);
  if (!t) return new Response("Not found", { status: 404 });
  const buf = await load(t);
  if (!buf) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range || buf.length > MAX_CHUNK) {
    const start = range?.[1] ? Number(range[1]) : 0;
    const asked = range?.[2] ? Number(range[2]) : buf.length - 1;
    const end = Math.min(asked, buf.length - 1, start + MAX_CHUNK - 1);
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type": t.mimeType,
        "Content-Range": `bytes ${start}-${end}/${buf.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Cache-Control": "private, max-age=3600",
      },
    });
  }
  return new Response(buf, {
    headers: { "Content-Type": t.mimeType, "Accept-Ranges": "bytes", "Content-Length": String(buf.length), "Cache-Control": "private, max-age=3600" },
  });
}
