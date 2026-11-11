import { runConcierge } from "@/server/agent/concierge";
import { aiConfigured } from "@/server/agent/translate";
import { rates } from "@/lib/offer";
import { getMember } from "@/lib/family";
import { store } from "@/server/store/store";
import { giftStatus, isPaid } from "@/server/store/goals";

const NOT_READY: Record<string, string> = {
  "zh-TW": "小幫手還沒準備好，請先從上面的點子挑一個。",
  "ja-JP": "アシスタントはまだ準備中です。上のアイデアから選んでください。",
  "fr-FR": "L'assistant n'est pas encore prêt. Choisissez une idée ci-dessus.",
  "en-US": "The helper isn't ready yet. Pick one of the ideas above.",
};

export async function POST(req: Request) {
  const body = (await req.json()) as { memberId?: string; question?: string };
  const member = getMember(String(body.memberId ?? ""));
  const question = String(body.question ?? "").slice(0, 500);
  if (!member || !question) return Response.json({ error: "bad_request" }, { status: 400 });
  if (!aiConfigured()) return Response.json({ error: NOT_READY[member.culture] });
  try {
    const paidGiftIds = [...new Set((await store.contributions()).filter(isPaid).map((c) => c.giftId))];
    const statuses = await Promise.all(paidGiftIds.map(giftStatus));
    const fundedGiftIds = statuses.filter((s) => s?.progress.funded).map((s) => s!.item.id);
    const r = await runConcierge({ memberId: member.id, rates, fundedGiftIds }, [{ role: "user", content: question }]);
    return Response.json({ text: r.text });
  } catch (e) {
    console.error("Concierge failed", e);
    return Response.json({ error: NOT_READY[member.culture] });
  }
}
