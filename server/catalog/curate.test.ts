import { test } from "node:test";
import assert from "node:assert/strict";
import { BAY_AREA_CATALOG } from "./bay-area.ts";
import { curate, stageForAge } from "./curate.ts";

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

test("Stage by age", () => {
  assert.equal(stageForAge(-3), "expecting");
  assert.equal(stageForAge(4), "baby");
  assert.equal(stageForAge(30), "toddler");
  assert.equal(stageForAge(72), "kid");
  assert.equal(stageForAge(120), "big_kid");
});

test("A new baby in SF gets help for the parents, not memberships", () => {
  const r = ids(curate(BAY_AREA_CATALOG, { ageMonths: 2, area: "SF" }));
  assert.ok(r.includes("dinner-delivered"));
  assert.ok(r.includes("registry-item"));
  assert.ok(!r.includes("exploratorium"));
});

test("A 6-year-old in the East Bay sees East Bay places, not SF-only ones", () => {
  const r = ids(curate(BAY_AREA_CATALOG, { ageMonths: 72, area: "East Bay" }));
  assert.ok(r.includes("lawrence-hall-of-science"));
  assert.ok(r.includes("swim-lessons"));
  assert.ok(!r.includes("exploratorium"));
});

test("Budget and 'we already have this' filter the list", () => {
  const r = ids(curate(BAY_AREA_CATALOG, { ageMonths: 72, area: "SF", maxUsdCents: 20000, exclude: ["sf-zoo"] }));
  assert.ok(!r.includes("sf-zoo"));
  assert.ok(!r.includes("summer-camp-week"));
});

test("Every item has all four languages", () => {
  for (const i of BAY_AREA_CATALOG) {
    for (const lang of ["en", "zh-TW", "ja-JP", "fr-FR"] as const) {
      assert.ok(i.title[lang] && i.why[lang], `${i.id} ${lang}`);
    }
  }
});
