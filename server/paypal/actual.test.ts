import { test } from "node:test";
import assert from "node:assert/strict";
import { actualFromCapture } from "./actual.ts";

test("Reads PayPal's fee, net and USD amount from a TWD capture", () => {
  const a = actualFromCapture({
    id: "CAP1",
    status: "COMPLETED",
    amount: { currency_code: "TWD", value: "1600" },
    seller_receivable_breakdown: {
      gross_amount: { currency_code: "TWD", value: "1600" },
      paypal_fee: { currency_code: "TWD", value: "94" },
      net_amount: { currency_code: "TWD", value: "1506" },
      receivable_amount: { currency_code: "USD", value: "45.71" },
      exchange_rate: { source_currency: "TWD", target_currency: "USD", value: "0.030352" },
    },
  });
  assert.deepEqual(a.gross, { minor: 1600, currency: "TWD" });
  assert.deepEqual(a.paypalFee, { minor: 94, currency: "TWD" });
  assert.deepEqual(a.receivedUsd, { minor: 4571, currency: "USD" });
  assert.equal(a.exchangeRate, 0.030352);
});

test("A pending capture keeps its reason and has no USD amount", () => {
  const a = actualFromCapture({
    id: "CAP2",
    status: "PENDING",
    status_details: { reason: "RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION" },
    amount: { currency_code: "JPY", value: "3000" },
  });
  assert.equal(a.pendingReason, "RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION");
  assert.equal(a.receivedUsd, undefined);
});
