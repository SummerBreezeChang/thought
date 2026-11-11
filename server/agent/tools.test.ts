import { test } from "node:test";
import assert from "node:assert/strict";
import { makeTools, GuardError } from "./tools.ts";
import { fixedRateProvider } from "../quotes/rates.ts";

const rates = fixedRateProvider(undefined, "test", "2026-11-05T00:00:00Z");
const chen = makeTools({ memberId: "m-chen", rates });

test("Catalog comes back in Grandma Chen's language, curated for a 6-year-old in SF", () => {
  const items = chen.searchCatalog({});
  assert.ok(items.some((i) => i.title === "週六看電影"));
  assert.ok(!items.some((i) => i.id === "lawrence-hall-of-science"), "East Bay only");
});

test("Suggested amounts follow Taiwanese custom and the largest finishes the goal", async () => {
  const s = await chen.suggestAmounts({ goalId: "goal-movies" });
  for (const x of s) assert.ok(!String(x.amount).includes("4"), `${x.amount} has no 4`);
  assert.ok(s[s.length - 1]!.familyReceivesUsdCents >= 10000);
});

test("Refuses $0.01-style amounts", async () => {
  await assert.rejects(chen.prepareContribution({ goalId: "goal-movies", amount: 1 }), (e: GuardError) => e.code === "too_small");
});

test("Refuses goals outside the family", async () => {
  await assert.rejects(chen.prepareContribution({ goalId: "goal-someone-else", amount: 1600 }), (e: GuardError) => e.code === "wrong_family");
});

test("An invited (not approved) member can't give", () => {
  const claire = makeTools({ memberId: "m-claire", rates });
  assert.throws(() => claire.getFamilyContext(), (e: GuardError) => e.code === "not_approved");
});

test("A valid draft is a draft, not a payment", async () => {
  const d = await chen.prepareContribution({ goalId: "goal-movies", amount: 3000, message: "給Mei" });
  assert.match(d.draftId, /^draft-/);
  assert.equal(d.currency, "TWD");
});
