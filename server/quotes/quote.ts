import { DECIMALS, roundMinor, type Currency, type Money } from "../money/money.ts";
import type { FeeSchedule } from "./fee-schedule.ts";
import type { MidRate } from "./rates.ts";

/**
 * The cost receipt engine. Given what a grandparent pays, it estimates every
 * fee and what the family receives in USD. Pure function: no I/O.
 *
 *   processing = gross × (checkout + international) + fixed fee   (payment currency)
 *   net_local  = gross − processing
 *   usd        = net_local × mid_rate × (1 − conversion spread)
 */

export type ReceiptLineKey =
  | "you_pay"
  | "paypal_processing"
  | "paypal_international"
  | "paypal_fixed"
  | "paypal_conversion"
  | "platform_fee"
  | "family_receives";

export interface ReceiptLine {
  key: ReceiptLineKey;
  /** Negative for costs. */
  amount: Money;
  /** The rate behind the line, for labels like "3.49%". */
  rate?: number;
}

export interface Quote {
  gross: Money;
  lines: ReceiptLine[];
  /** Total PayPal fees in the payment currency (processing + international + fixed). */
  paypalFeesLocal: Money;
  /** Conversion spread cost, in USD cents. Zero when paying in USD. */
  conversionCostUsd: Money;
  familyReceivesUsd: Money;
  /** Share of the gift's value lost to all costs, e.g. 0.083. */
  totalCostShare: number;
  midRate: MidRate;
  feeScheduleVersion: string;
  /** Always true before capture: PayPal sets the final rate. */
  isEstimate: true;
}

export interface QuoteInput {
  gross: Money;
  midRate: MidRate;
  schedule: FeeSchedule;
  /** Grandparents abroad are international buyers. Default true. */
  internationalBuyer?: boolean;
}

export function quoteContribution(input: QuoteInput): Quote {
  const { gross, midRate, schedule } = input;
  const international = input.internationalBuyer ?? true;
  const currency = gross.currency;

  if (gross.minor <= 0) throw new Error("A contribution must be more than zero.");
  if (midRate.currency !== currency) {
    throw new Error(`Rate is for ${midRate.currency}, payment is in ${currency}.`);
  }

  const processing = roundMinor(gross.minor * schedule.checkoutRate);
  const internationalFee = international ? roundMinor(gross.minor * schedule.internationalRate) : 0;
  const fixed = schedule.fixedFeeMinor[currency];
  const feesLocal = processing + internationalFee + fixed;
  const netLocal = gross.minor - feesLocal;

  const usdBeforeSpreadCents = minorToUsdCents(netLocal, currency, midRate.usdPerUnit);
  const converts = currency !== "USD";
  const spreadCents = converts ? usdBeforeSpreadCents * schedule.conversionSpread : 0;
  const familyCents = roundMinor(usdBeforeSpreadCents - spreadCents) - schedule.platformFeeUsdCents;
  const conversionCents = converts ? roundMinor(usdBeforeSpreadCents) - roundMinor(usdBeforeSpreadCents - spreadCents) : 0;

  const grossUsdCents = minorToUsdCents(gross.minor, currency, midRate.usdPerUnit);
  // `|| 0` turns -0 into 0 so a "$0" line never renders as "-$0".
  const local = (minor: number): Money => ({ minor: minor || 0, currency });
  const usd = (minor: number): Money => ({ minor: minor || 0, currency: "USD" });

  const lines: ReceiptLine[] = [
    { key: "you_pay", amount: gross },
    { key: "paypal_processing", amount: local(-processing), rate: schedule.checkoutRate },
  ];
  if (international) {
    lines.push({ key: "paypal_international", amount: local(-internationalFee), rate: schedule.internationalRate });
  }
  lines.push({ key: "paypal_fixed", amount: local(-fixed) });
  if (converts) {
    lines.push({ key: "paypal_conversion", amount: usd(-conversionCents), rate: schedule.conversionSpread });
  }
  lines.push({ key: "platform_fee", amount: usd(-schedule.platformFeeUsdCents) });
  lines.push({ key: "family_receives", amount: usd(familyCents) });

  return {
    gross,
    lines,
    paypalFeesLocal: local(feesLocal),
    conversionCostUsd: usd(conversionCents),
    familyReceivesUsd: usd(familyCents),
    totalCostShare: 1 - familyCents / grossUsdCents,
    midRate,
    feeScheduleVersion: schedule.version,
    isEstimate: true,
  };
}

/**
 * The smallest payment (in the payment currency) that delivers at least
 * `targetUsd` to the family. Used by the "my family receives the full gift" toggle.
 */
export function grossUpFor(targetUsd: Money, input: Omit<QuoteInput, "gross">): Money {
  if (targetUsd.currency !== "USD") throw new Error("Target must be in USD.");
  const { midRate, schedule } = input;
  const currency = midRate.currency;
  const international = input.internationalBuyer ?? true;
  const pct = schedule.checkoutRate + (international ? schedule.internationalRate : 0);
  const spread = currency === "USD" ? 0 : schedule.conversionSpread;

  const targetCents = targetUsd.minor + schedule.platformFeeUsdCents;
  const netLocalMinor = usdCentsToMinor(targetCents / (1 - spread), currency, midRate.usdPerUnit);
  let minor = Math.ceil((netLocalMinor + schedule.fixedFeeMinor[currency]) / (1 - pct));

  // The formula is an estimate; rounding can land a unit or two off either way.
  // Walk down while one less still clears the target, then up until it does.
  const reaches = (m: number) =>
    quoteContribution({ ...input, gross: { minor: m, currency } }).familyReceivesUsd.minor >= targetUsd.minor;
  for (let i = 0; i < 1000 && minor > 1 && reaches(minor - 1); i++) minor -= 1;
  for (let i = 0; i < 1000 && !reaches(minor); i++) minor += 1;
  if (!reaches(minor)) throw new Error("Could not gross up the amount.");
  return { minor, currency };
}

/**
 * What the grandparent would pay if the order were listed in USD instead,
 * and PayPal converted on their side. We show this as "why you pay in NT$".
 */
export function usdListingAlternative(
  quote: Quote,
  schedule: FeeSchedule,
): { buyerPays: Money; extraForBuyer: Money } {
  const currency = quote.gross.currency;
  const extra = roundMinor(quote.gross.minor * schedule.buyerConversionSpread);
  return {
    buyerPays: { minor: quote.gross.minor + extra, currency },
    extraForBuyer: { minor: extra, currency },
  };
}

function minorToUsdCents(minor: number, currency: Currency, usdPerUnit: number): number {
  const major = minor / 10 ** DECIMALS[currency];
  return major * usdPerUnit * 100;
}

function usdCentsToMinor(cents: number, currency: Currency, usdPerUnit: number): number {
  const major = cents / 100 / usdPerUnit;
  return major * 10 ** DECIMALS[currency];
}
