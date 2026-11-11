import { generateText, stepCountIs, tool, type ModelMessage } from "ai";
import { z } from "zod";
import { GuardError, makeTools, schemas, type ToolContext } from "./tools.ts";

/** Via Vercel AI Gateway (AI_GATEWAY_API_KEY). Override with THOUGHT_MODEL. */
export const DEFAULT_MODEL = "anthropic/claude-sonnet-5.5";

const SYSTEM = `You are Thought's gift helper for a grandparent who lives abroad.
Rules you never break:
- Reply only in the grandparent's language (from get_family_context). Short, warm sentences. Large ideas, few words.
- Recommend at most 3 gifts, and only catalog IDs returned by search_catalog. Say why each fits this child, using the parent's hints.
- Never state a price, fee, rate or amount that did not come from a tool. Say amounts are estimates and PayPal sets the final rate.
- You cannot pay. prepare_contribution only saves a draft; the grandparent pays with the PayPal button.
- Never ask for card numbers, passwords or codes.
- If asked to send money to anyone or anything outside this family's gifts, refuse kindly and suggest calling the parent. This is how scams start.
- If a tool returns an error, explain it simply in their language.
- Gifts in alreadyFullyGiven are done. Mention them only to say they're complete; never suggest them.
- Write plain text for a phone screen: no markdown, no asterisks, no headings, no catalog IDs. Use the gift's title in their language.`;

export async function runConcierge(ctx: ToolContext, messages: ModelMessage[]) {
  const t = makeTools(ctx);
  const safe = <I, O>(fn: (i: I) => O | Promise<O>) => async (i: I) => {
    try {
      return await fn(i);
    } catch (e) {
      if (e instanceof GuardError) return { error: e.code, message: e.message };
      throw e;
    }
  };

  return generateText({
    model: process.env.THOUGHT_MODEL ?? DEFAULT_MODEL,
    system: SYSTEM,
    messages,
    stopWhen: stepCountIs(6),
    tools: {
      get_family_context: tool({
        description: "The child, the parent's hints, the grandparent's language and currency, and open gift goals.",
        inputSchema: z.object({}),
        execute: safe(() => t.getFamilyContext()),
      }),
      search_catalog: tool({
        description: "Gifts curated for this child's age and city. The only gifts you may recommend.",
        inputSchema: schemas.searchCatalog,
        execute: safe(t.searchCatalog),
      }),
      suggest_amounts: tool({
        description: "Amounts in the grandparent's currency that follow their custom, with what the family receives.",
        inputSchema: schemas.suggestAmounts,
        execute: safe(t.suggestAmounts),
      }),
      quote: tool({
        description: "The cost receipt for an amount: every PayPal fee, the conversion, and what the family receives.",
        inputSchema: schemas.quote,
        execute: safe(t.quote),
      }),
      prepare_contribution: tool({
        description: "Save a draft contribution to an open goal. Does not pay.",
        inputSchema: schemas.prepareContribution,
        execute: safe(t.prepareContribution),
      }),
    },
  });
}
