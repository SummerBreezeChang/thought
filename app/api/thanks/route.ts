import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, store } from "@/server/store/store";
import { translateForGrandparent } from "@/server/agent/translate";
import { getMember } from "@/lib/family";

const MAX_BYTES = 40 * 1024 * 1024;

export async function POST(req: Request) {
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

  let captionTranslated: string | undefined;
  try {
    const giver = getMember(c.memberId);
    captionTranslated = await translateForGrandparent(caption, giver?.culture ?? "en-US", giver?.title);
  } catch (e) {
    console.error("Translation failed; keeping the original caption", e);
  }

  await store.addThankYou({ id, contributionId, videoFile: file, mimeType, caption, captionTranslated, createdAt: new Date().toISOString() });
  return Response.json({ id });
}
