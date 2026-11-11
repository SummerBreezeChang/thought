import { format, formatShort } from "@/server/money/money";
import { PAYPAL_US_2026 } from "@/server/quotes/fee-schedule";
import { grossUpFor, quoteContribution, usdListingAlternative } from "@/server/quotes/quote";
import { liveRateProvider } from "@/server/quotes/rates";
import { suggestGoalAmounts } from "@/server/rules/amounts";
import type { Member } from "@/server/demo/family";
import { giftStatus } from "@/server/store/goals";
import { reasonLabel, t } from "./i18n";

export const rates = liveRateProvider();

export interface ReceiptRow {
  label: string;
  value: string;
  /** Lines inside the "PayPal fees" group. */
  fee?: boolean;
}

export interface AmountOption {
  amountMinor: number;
  label: string;
  display: string;
  familyReceives: string;
  feesTotal: string;
  rows: ReceiptRow[];
  whyLocal?: string;
}

/**
 * The amounts a member may choose for a gift, each with its full cost receipt.
 * Computed on the server; the browser only sends back which one was picked.
 */
export async function amountOptions(member: Member, giftId: string, childAge: number): Promise<AmountOption[]> {
  const status = await giftStatus(giftId);
  if (!status || status.progress.funded) return [];
  const c = t(member.culture);
  const locale = member.culture;
  const midRate = await rates.getMidRate(member.currency);
  const finish = grossUpFor(status.progress.remainingUsd, { midRate, schedule: PAYPAL_US_2026 });

  return suggestGoalAmounts(member.culture, finish, childAge).map((s) => {
    const q = quoteContribution({ gross: s.amount, midRate, schedule: PAYPAL_US_2026 });
    const line = (k: string) => q.lines.find((l) => l.key === k);
    const show = (k: string) => {
      const l = line(k);
      return l ? format({ minor: Math.abs(l.amount.minor), currency: l.amount.currency }, locale) : "";
    };
    const pct = (r?: number) => (r ? ` ${(r * 100).toFixed(2).replace(/\.?0+$/, "")}%` : "");
    const rows: ReceiptRow[] = [
      { label: c.processing + pct(line("paypal_processing")?.rate), value: `−${show("paypal_processing")}`, fee: true },
      { label: c.international + pct(line("paypal_international")?.rate), value: `−${show("paypal_international")}`, fee: true },
      { label: c.fixed, value: `−${show("paypal_fixed")}`, fee: true },
    ];
    if (line("paypal_conversion")) {
      rows.push({ label: c.conversion + pct(line("paypal_conversion")?.rate), value: `−${show("paypal_conversion")}` });
    }
    rows.push({ label: c.ourFee, value: formatShort({ minor: 0, currency: "USD" }, locale) });
    const alt = usdListingAlternative(q, PAYPAL_US_2026);
    return {
      amountMinor: s.amount.minor,
      label: reasonLabel(c, s.reasonKey),
      display: formatShort(s.amount, locale),
      familyReceives: `≈ ${format(q.familyReceivesUsd, locale)}`,
      feesTotal: `−${format(q.paypalFeesLocal, locale)}`,
      rows,
      whyLocal: member.currency === "USD" ? undefined : c.whyLocal(member.currency === "TWD" ? "NT$" : member.currency === "JPY" ? "¥" : "€", format(alt.extraForBuyer, locale)),
    };
  });
}
