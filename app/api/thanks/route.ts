import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, store } from "@/server/store/store";
import { translateForGrandparent } from "@/server/agent/translate";
import { getMember } from "@/lib/family";

const MAX_BYTES = 40 * 1024 * 1024;

async function translated(caption: string, memberId: string) {
  try {
    const giver = getMember(memberId);
    return await translateForGrandparent(caption, giver?.culture ?? "en-US", giver?.title);
  } catch (e) {
    console.error("Translation failed; keeping the original caption", e);
    return undefined;
  }
}

export async function POST(req: Request) {
  // Hosted: the browser already uploaded the video to Blob and sends its pathname.
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json()) as { contribution?: string; caption?: string; pathname?: string; mimeType?: string };
    const c = await store.contribution(String(body.contribution ?? ""));
    const pathname = String(body.pathname ?? "");
    if (!c || !pathname.startsWith("thanks/")) return Response.json({ error: "bad_request" }, { status: 400 });
    const caption = String(body.caption ?? "").slice(0, 300);
    const mimeType = body.mimeType?.startsWith("video/mp4") ? "video/mp4" : "video/webm";
    const id = `t-${randomUUID()}`;
    const captionTranslated = await translated(caption, c.memberId);
    await store.addThankYou({ id, contributionId: c.id, videoFile: "", blobPathname: pathname, mimeType, caption, captionTranslated, createdAt: new Date().toISOString() });
    return Response.json({ id });
  }

  // Local: the video comes in the form and is saved to .data/videos.
  const form = await req.formData();
  const contributionId = String(form.get("contribution") ?? "");
  const caption = String(form.get("caption") ?? "").slice(0, 300);
  const video = form.get("video");
  const c = await store.contribution(contributionId);
  if (!c || !(video instanceof Blob) || video.size === 0) return Response.json({ error: "bad_request" }, { status: 400 });
  if (video.size > MAX_BYTES) return Response.json({ error: "too_large" }, { status: 413 });

  const mimeType = video.type.startsWith("video/mp4") ? "video/mp4" : "video/webm";
  const id = `t-${randomUUID()}`;
  const file = `${id}.${mimeType === "video/mp4" ? "mp4" : "webm"}`;
  await mkdir(path.join(DATA_DIR, "videos"), { recursive: true });
  await writeFile(path.join(DATA_DIR, "videos", file), Buffer.from(await video.arrayBuffer()));

  const captionTranslated = await translated(caption, c.memberId);
  await store.addThankYou({ id, contributionId, videoFile: file, mimeType, caption, captionTranslated, createdAt: new Date().toISOString() });
  return Response.json({ id });
}
