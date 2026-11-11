import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_RATES, liveRateProvider } from "./rates.ts";

const body = { result: "success", time_last_update_unix: 1_800_000_000, rates: { TWD: 32.9444, JPY: 158.5553, EUR: 0.8939 } };

test("live rates convert per-USD quotes and cache them", async () => {
  let calls = 0;
  const p = liveRateProvider({
    fetchImpl: async () => { calls++; return { ok: true, json: async () => body }; },
  });
  const twd = await p.getMidRate("TWD");
  assert.equal(twd.usdPerUnit, 1 / 32.9444);
  assert.match(twd.source, /market/);
  await p.getMidRate("JPY");
  assert.equal(calls, 1);
});

test("falls back to demo rates when the source fails", async () => {
  const p = liveRateProvider({ fetchImpl: async () => { throw new Error("offline"); } });
  const jpy = await p.getMidRate("JPY");
  assert.equal(jpy.usdPerUnit, DEMO_RATES.JPY);
  assert.match(jpy.source, /demo/);
});

test("refetches after the cache expires", async () => {
  let calls = 0;
  let clock = 0;
  const p = liveRateProvider({
    now: () => clock,
    ttlMs: 1000,
    fetchImpl: async () => { calls++; return { ok: true, json: async () => body }; },
  });
  await p.getMidRate("TWD");
  clock = 2000;
  await p.getMidRate("TWD");
  assert.equal(calls, 2);
});
