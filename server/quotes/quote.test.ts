import { test } from "node:test";
import assert from "node:assert/strict";
import { PAYPAL_US_2026 } from "./fee-schedule.ts";
import { grossUpFor, quoteContribution, usdListingAlternative } from "./quote.ts";
import { goalProgress } from "./goal.ts";
import type { MidRate } from "./rates.ts";

const twd: MidRate = { currency: "TWD", usdPerUnit: 1 / 32, source: "test", asOf: "2026-11-05T00:00:00Z" };
const jpy: MidRate = { currency: "JPY", usdPerUnit: 1 / 150, source: "test", asOf: "2026-11-05T00:00:00Z" };
const usd: MidRate = { currency: "USD", usdPerUnit: 1, source: "test", asOf: "2026-11-05T00:00:00Z" };
const schedule = PAYPAL_US_2026;

const line = (q: ReturnType<typeof quoteContribution>, key: string) =>
  q.lines.find((l) => l.key === key)?.amount.minor;

test("NT$3,000 matches the worked example in the tech spec", () => {
  const q = quoteContribution({ gross: { minor: 3000, currency: "TWD" }, midRate: twd, schedule });
  assert.equal(line(q, "paypal_processing"), -105);
  assert.equal(line(q, "paypal_international"), -45);
  assert.equal(line(q, "paypal_fixed"), -14);
  assert.equal(line(q, "paypal_conversion"), -266);
  assert.equal(line(q, "platform_fee"), 0);
  assert.equal(q.familyReceivesUsd.minor, 8597);
  assert.equal(Math.round(q.totalCostShare * 1000) / 10, 8.3);
});

test("Thought fee line is always present, even at $0", () => {
  const q = quoteContribution({ gross: { minor: 1600, currency: "TWD" }, midRate: twd, schedule });
  assert.ok(q.lines.some((l) => l.key === "platform_fee"));
});

test("Receipt lines add up: gross minus fees, converted, equals what the family receives", () => {
  const q = quoteContribution({ gross: { minor: 5000, currency: "JPY" }, midRate: jpy, schedule });
  const localNet = q.gross.minor + q.paypalFeesLocal.minor * -1;
  const beforeSpread = Math.round((localNet / 150) * 100);
  assert.equal(beforeSpread - q.conversionCostUsd.minor, q.familyReceivesUsd.minor);
});

test("USD payments have no conversion line", () => {
  const q = quoteContribution({ gross: { minor: 5000, currency: "USD" }, midRate: usd, schedule, internationalBuyer: false });
  assert.equal(line(q, "paypal_conversion"), undefined);
  assert.equal(line(q, "paypal_international"), undefined);
  assert.equal(q.familyReceivesUsd.minor, 5000 - 175 - 49);
});

test("Rejects zero and mismatched currencies", () => {
  assert.throws(() => quoteContribution({ gross: { minor: 0, currency: "TWD" }, midRate: twd, schedule }));
  assert.throws(() => quoteContribution({ gross: { minor: 1000, currency: "JPY" }, midRate: twd, schedule }));
});

test("Gross-up delivers at least the target, and one unit less does not", () => {
  for (const [rate, target] of [[twd, 10000], [jpy, 5435], [usd, 2500]] as const) {
    const gross = grossUpFor({ minor: target, currency: "USD" }, { midRate: rate, schedule });
    const q = quoteContribution({ gross, midRate: rate, schedule });
    assert.ok(q.familyReceivesUsd.minor >= target, `${rate.currency} reaches target`);
    const under = quoteContribution({ gross: { minor: gross.minor - 1, currency: gross.currency }, midRate: rate, schedule });
    assert.ok(under.familyReceivesUsd.minor < target, `${rate.currency} is the smallest amount`);
  }
});

test("Listing in USD would cost the grandparent 4% more", () => {
  const q = quoteContribution({ gross: { minor: 3000, currency: "TWD" }, midRate: twd, schedule });
  const alt = usdListingAlternative(q, schedule);
  assert.equal(alt.extraForBuyer.minor, 120);
});

test("Hero story: NT$3,000 + ¥3,000 fund the $100 movie goal", () => {
  const target = { minor: 10000, currency: "USD" as const };
  const chen = quoteContribution({ gross: { minor: 3000, currency: "TWD" }, midRate: twd, schedule });
  const afterChen = goalProgress(target, [{ memberId: "chen", receivedUsd: chen.familyReceivesUsd, isActual: false }]);
  assert.equal(Math.round(afterChen.share * 100), 86);
  assert.equal(afterChen.funded, false);

  const kenji = quoteContribution({ gross: { minor: 3000, currency: "JPY" }, midRate: jpy, schedule });
  assert.equal(kenji.familyReceivesUsd.minor, 1811);
  const done = goalProgress(target, [
    { memberId: "chen", receivedUsd: chen.familyReceivesUsd, isActual: true },
    { memberId: "kenji", receivedUsd: kenji.familyReceivesUsd, isActual: false },
  ]);
  assert.equal(done.funded, true);
  assert.equal(done.receivedUsd.minor, 10408);
});

test("Grossing up the remainder also funds the goal", () => {
  const target = { minor: 10000, currency: "USD" as const };
  const chen = quoteContribution({ gross: { minor: 3000, currency: "TWD" }, midRate: twd, schedule });
  const half = goalProgress(target, [{ memberId: "chen", receivedUsd: chen.familyReceivesUsd, isActual: false }]);
  const kenji = quoteContribution({ gross: grossUpFor(half.remainingUsd, { midRate: jpy, schedule }), midRate: jpy, schedule });
  assert.equal(goalProgress(target, [
    { memberId: "chen", receivedUsd: chen.familyReceivesUsd, isActual: true },
    { memberId: "kenji", receivedUsd: kenji.familyReceivesUsd, isActual: false },
  ]).funded, true);
});
