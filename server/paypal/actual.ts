import { fromPayPalValue, isCurrency, type Money } from "../money/money.ts";
import type { PayPalCapture, PayPalOrder } from "./client.ts";

/** The receipt after payment, from PayPal's own numbers. */
export interface ActualReceipt {
  captureId: string;
  status: PayPalCapture["status"];
  /** Why a capture is PENDING, e.g. RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION. */
  pendingReason?: string;
  gross: Money;
  paypalFee?: Money;
  net?: Money;
  /** What lands in USD when PayPal converts. Missing if the business account holds the currency. */
  receivedUsd?: Money;
  exchangeRate?: number;
}

export function firstCapture(order: PayPalOrder): PayPalCapture | undefined {
  return order.purchase_units?.[0]?.payments?.captures?.[0];
}

export function actualFromCapture(capture: PayPalCapture): ActualReceipt {
  const toMoney = (a: { currency_code: string; value: string } | undefined): Money | undefined => {
    if (!a) return undefined;
    if (!isCurrency(a.currency_code)) throw new Error(`Unsupported currency ${a.currency_code}`);
    return fromPayPalValue(a.value, a.currency_code);
  };
  const b = capture.seller_receivable_breakdown;
  const receivable = toMoney(b?.receivable_amount);
  const net = toMoney(b?.net_amount);
  return {
    captureId: capture.id,
    status: capture.status,
    pendingReason: capture.status_details?.reason,
    gross: toMoney(b?.gross_amount ?? capture.amount)!,
    paypalFee: toMoney(b?.paypal_fee),
    net,
    receivedUsd: receivable?.currency === "USD" ? receivable : net?.currency === "USD" ? net : undefined,
    exchangeRate: b?.exchange_rate ? Number(b.exchange_rate.value) : undefined,
  };
}
