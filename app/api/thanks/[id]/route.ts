import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, store } from "@/server/store/store";

/** Serves a thank-you video, with byte ranges so Safari can play it. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = (await store.thankYous()).find((x) => x.id === id);
  if (!t) return new Response("Not found", { status: 404 });
  const buf = await readFile(path.join(DATA_DIR, "videos", path.basename(t.videoFile)));
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), buf.length - 1) : buf.length - 1;
    return new Response(new Uint8Array(buf.subarray(start, end + 1)), {
      status: 206,
      headers: {
        "Content-Type": t.mimeType,
        "Content-Range": `bytes ${start}-${end}/${buf.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
      },
    });
  }
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": t.mimeType, "Accept-Ranges": "bytes", "Content-Length": String(buf.length) },
  });
}
