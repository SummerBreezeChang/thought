import { generateText } from "ai";
import { DEFAULT_MODEL } from "./concierge.ts";

export const aiConfigured = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

/** Translate a child's words for a grandparent. Returns undefined when AI isn't set up. */
export async function translateForGrandparent(text: string, to: string, calledBy?: string): Promise<string | undefined> {
  if (!text.trim() || !aiConfigured() || to.startsWith("en")) return undefined;
  const { text: out } = await generateText({
    model: process.env.THOUGHT_MODEL ?? DEFAULT_MODEL,
    system: `Translate what a young child said to their grandparent into ${to}. Keep it warm and simple, like a child talking.${calledBy ? ` The child calls this grandparent "${calledBy}": use exactly that word for them.` : ""} Use the punctuation native to ${to} (full-width in Chinese and Japanese). Reply with the translation only.`,
    prompt: text,
  });
  const trimmed = out.trim();
  // Models often slip half-width punctuation into Chinese and Japanese.
  if (to.startsWith("zh") || to.startsWith("ja")) {
    return trimmed.replace(/!/g, "！").replace(/\?/g, "？").replace(/,/g, to.startsWith("zh") ? "，" : "、").replace(/:/g, "：");
  }
  return trimmed;
}
