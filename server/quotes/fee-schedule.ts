import type { Currency } from "../money/money.ts";

/**
 * PayPal's published US merchant fees. In the app this lives in the
 * `fee_schedule` table; this default mirrors it so the engine and tests
 * run without a database.
 * Source: https://www.paypal.com/us/business/paypal-business-fees (read Nov 5, 2026)
 */
export interface FeeSchedule {
  version: string;
  sourceUrl: string;
  /** PayPal Checkout percentage, e.g. 0.0349. */
  checkoutRate: number;
  /** Added when the buyer is outside the US, e.g. 0.015. */
  internationalRate: number;
  /** Fixed fee per payment, in the payment currency's minor unit. */
  fixedFeeMinor: Record<Currency, number>;
  /** Spread when our business account converts what it received into USD. */
  conversionSpread: number;
  /** Spread the buyer pays if an order is listed in a currency other than theirs. */
  buyerConversionSpread: number;
  /** Thought's own fee, in USD cents. Always shown, even at zero. */
  platformFeeUsdCents: number;
}

export const PAYPAL_US_2026: FeeSchedule = {
  version: "paypal-us-2026-11-05",
  sourceUrl: "https://www.paypal.com/us/business/paypal-business-fees",
  checkoutRate: 0.0349,
  internationalRate: 0.015,
  fixedFeeMinor: { USD: 49, EUR: 39, TWD: 14, JPY: 49 },
  conversionSpread: 0.03,
  buyerConversionSpread: 0.04,
  platformFeeUsdCents: 0,
};
