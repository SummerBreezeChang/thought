import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAmount, classicAmount, niceUp, suggestGoalAmounts } from "./amounts.ts";

const twd = (minor: number) => ({ minor, currency: "TWD" as const });
const jpy = (minor: number) => ({ minor, currency: "JPY" as const });

test("zh-TW flags 4 and offers lucky neighbours", () => {
  const r = checkAmount("zh-TW", twd(1400));
  assert.equal(r.ok, false);
  assert.equal(r.noteKey, "rules.zhTW.avoid4");
  assert.deepEqual(r.alternatives.map((m) => m.minor), [1000, 1600]);
});

test("zh-TW accepts NT$1,600 and NT$8,800 (lucky 8 noted)", () => {
  assert.equal(checkAmount("zh-TW", twd(1600)).ok, true);
  assert.equal(checkAmount("zh-TW", twd(8800)).noteKey, "rules.zhTW.lucky8");
});

test("ja-JP avoids amounts starting with 4 or 9", () => {
  assert.equal(checkAmount("ja-JP", jpy(9000)).noteKey, "rules.jaJP.avoid4or9");
  assert.equal(niceUp("ja-JP", jpy(8898)).minor, 10000);
  assert.equal(niceUp("ja-JP", jpy(3500)).minor, 5000);
  assert.equal(checkAmount("ja-JP", jpy(3000)).ok, true);
});

test("fr-FR rounds to €5 under €50 and €10 above", () => {
  assert.equal(niceUp("fr-FR", { minor: 2310, currency: "EUR" }).minor, 2500);
  assert.equal(niceUp("fr-FR", { minor: 5120, currency: "EUR" }).minor, 6000);
});

test("Goal suggestions are sorted, unique and all follow the custom", () => {
  const s = suggestGoalAmounts("ja-JP", jpy(8898), 6);
  assert.deepEqual(s.map((x) => x.amount.minor), [3000, 8000, 10000]);
  for (const x of s) assert.equal(checkAmount("ja-JP", x.amount).ok, true);
});

test("Classic amount only in the culture's own currency", () => {
  assert.equal(classicAmount("zh-TW", 6, "TWD")?.minor, 1200);
  assert.equal(classicAmount("zh-TW", 6, "JPY"), null);
});

test("Grandma Chang's options for the $100 movie include NT$3,000", () => {
  const s = suggestGoalAmounts("zh-TW", twd(3487), 6);
  assert.deepEqual(s.map((x) => x.amount.minor), [1200, 3000, 3600]);
});
