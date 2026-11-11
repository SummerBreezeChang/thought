import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { store } from "@/server/store/store";

/**
 * Issues a short-lived token so Mei's browser can upload her video straight to
 * Vercel Blob. Videos skip our function, so the 4.5 MB request limit doesn't apply.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const c = await store.contribution(String(clientPayload ?? ""));
        if (!c || !pathname.startsWith("thanks/")) throw new Error("Unknown gift");
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 40 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
