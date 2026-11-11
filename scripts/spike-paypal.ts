/**
 * Day-1 spike: can a grandparent pay in TWD or JPY, and does PayPal return
 * the real fee and exchange rate?
 *
 *   npm run spike -- auth
 *   npm run spike -- create TWD 3000      → prints a link; log in with the Taiwan sandbox buyer
 *   npm run spike -- capture <orderId>    → prints estimate vs PayPal's actual
 *   npm run spike -- order <orderId>
 *   npm run spike -- declined             → negative test: INSTRUMENT_DECLINED
 */
import { randomUUID } from "node:crypto";
import { createPayPalClient, PayPalError } from "../server/paypal/client.ts";
import { actualFromCapture, firstCapture } from "../server/paypal/actual.ts";
import { quoteContribution } from "../server/quotes/quote.ts";
import { PAYPAL_US_2026 } from "../server/quotes/fee-schedule.ts";
import { DEMO_RATES, fixedRateProvider } from "../server/quotes/rates.ts";
import { format, isCurrency } from "../server/money/money.ts";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env.local (sandbox app).");
  process.exit(1);
}
const paypal = createPayPalClient({ clientId, clientSecret });
const locales = { TWD: "zh-TW", JPY: "ja-JP", EUR: "fr-FR", USD: "en-US" } as const;

async function main() {
  const [cmd, a, b] = process.argv.slice(2);

  if (cmd === "auth") {
    await paypal.accessToken();
    console.log("Sandbox credentials work.");
    return;
  }

  if (cmd === "create") {
    const currency = a ?? "TWD";
    if (!isCurrency(currency)) throw new Error(`Unknown currency ${currency}`);
    const amount = { minor: Number(b ?? 3000) * (currency === "TWD" || currency === "JPY" ? 1 : 100), currency };
    const id = `spike-${randomUUID()}`;
    const order = await paypal.createOrder({
      contributionId: id,
      amount,
      description: "Saturday at the movies for Mei",
      locale: locales[currency],
      returnUrl: "https://example.com/thought/return",
      cancelUrl: "https://example.com/thought/cancel",
    });
    const rate = await fixedRateProvider().getMidRate(currency);
    const q = quoteContribution({ gross: amount, midRate: rate, schedule: PAYPAL_US_2026 });
    console.log(`Order ${order.id} (${order.status}) for ${format(amount, "en-US")}`);
    console.log(`Estimate: family receives about ${format(q.familyReceivesUsd, "en-US")} (${(q.totalCostShare * 100).toFixed(1)}% total cost, ${rate.source})`);
    const approve = order.links?.find((l) => l.rel === "payer-action" || l.rel === "approve");
    console.log(`Approve as the sandbox buyer: ${approve?.href}`);
    console.log(`Then: npm run spike -- capture ${order.id}`);
    return;
  }

  if (cmd === "capture" && a) {
    const order = await paypal.captureOrder(a, a);
    const capture = firstCapture(order);
    if (!capture) throw new Error("No capture in the response.");
    const actual = actualFromCapture(capture);
    console.log("Payer country:", order.payer?.address?.country_code ?? "unknown");
    console.log(JSON.stringify(capture.seller_receivable_breakdown ?? capture, null, 2));
    if (actual.pendingReason) {
      console.log(`PENDING: ${actual.pendingReason}. Turn on auto-convert (receiving preferences) on the sandbox business account.`);
    }
    if (isCurrency(actual.gross.currency)) {
      const rate = { usdPerUnit: DEMO_RATES[actual.gross.currency], currency: actual.gross.currency, source: "demo", asOf: "" };
      const q = quoteContribution({ gross: actual.gross, midRate: rate, schedule: PAYPAL_US_2026 });
      console.log(`Estimated ${format(q.familyReceivesUsd, "en-US")} · Actual ${actual.receivedUsd ? format(actual.receivedUsd, "en-US") : "not in USD yet"}`);
      console.log(`Fee: estimated ${format(q.paypalFeesLocal, "en-US")} · actual ${actual.paypalFee ? format(actual.paypalFee, "en-US") : "?"}`);
    }
    return;
  }

  if (cmd === "order" && a) {
    console.log(JSON.stringify(await paypal.getOrder(a), null, 2));
    return;
  }

  if (cmd === "declined") {
    try {
      await paypal.createOrder(
        { contributionId: `spike-${randomUUID()}`, amount: { minor: 1600, currency: "TWD" }, description: "decline test", locale: "zh-TW", returnUrl: "https://example.com/r", cancelUrl: "https://example.com/c" },
        { mock_application_codes: "INSTRUMENT_DECLINED" },
      );
      console.log("Expected an error, got none.");
    } catch (e) {
      if (e instanceof PayPalError) console.log(`Got ${e.issue} (debug id ${e.debugId}). Good.`);
      else throw e;
    }
    return;
  }

  console.log("Commands: auth | create <TWD|JPY|EUR|USD> <amount> | capture <orderId> | order <orderId> | declined");
}

main().catch((e: unknown) => {
  if (e instanceof PayPalError) console.error(`${e.message} [issue ${e.issue}] [debug id ${e.debugId}]`);
  else console.error(e);
  process.exit(1);
});
