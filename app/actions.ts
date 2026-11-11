"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { createPayPalClient, PayPalError } from "@/server/paypal/client";
import { PAYPAL_US_2026 } from "@/server/quotes/fee-schedule";
import { quoteContribution } from "@/server/quotes/quote";
import { store } from "@/server/store/store";
import { amountOptions, rates } from "@/lib/offer";
import { familyOf, getMember } from "@/lib/family";
import { langFor } from "@/lib/i18n";

export async function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return createPayPalClient({ clientId, clientSecret });
}

async function origin(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Starts a PayPal payment. The browser sends only who, which gift and which
 * suggested amount; the server recomputes the options and rejects anything else.
 */
export async function startPayment(formData: FormData) {
  const memberId = String(formData.get("member") ?? "");
  const giftId = String(formData.get("gift") ?? "");
  const amount = Number(formData.get("amount"));
  const message = String(formData.get("message") ?? "").slice(0, 500);
  const back = `/give/${encodeURIComponent(memberId)}/gift/${encodeURIComponent(giftId)}`;

  const member = getMember(memberId);
  const item = BAY_AREA_CATALOG.find((i) => i.id === giftId);
  if (!member || member.status !== "approved" || member.role === "parent" || !item) redirect("/");

  const { ageYears } = familyOf(member);
  const options = await amountOptions(member, giftId, ageYears);
  if (!options.some((o) => o.amountMinor === amount)) redirect(`${back}?error=amount`);

  const paypal = await paypalClient();
  if (!paypal) redirect(`${back}?error=not_connected`);

  const id = `c-${randomUUID()}`;
  const gross = { minor: amount, currency: member.currency };
  const midRate = await rates.getMidRate(member.currency);
  const q = quoteContribution({ gross, midRate, schedule: PAYPAL_US_2026 });
  const lang = langFor(member.culture);
  const base = await origin();

  let approveUrl: string | undefined;
  try {
    const order = await paypal.createOrder({
      contributionId: id,
      amount: gross,
      description: `${item.title[lang]} · ${item.title.en}`,
      locale: member.culture,
      returnUrl: `${base}/api/paypal/return?c=${id}`,
      cancelUrl: `${base}${back}?error=cancelled`,
    });
    approveUrl = order.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
    await store.addContribution({
      id,
      memberId,
      giftId,
      amountMinor: amount,
      currency: member.currency,
      message,
      status: "created",
      orderId: order.id,
      estimateUsdCents: q.familyReceivesUsd.minor,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof PayPalError) console.error("PayPal create order failed", e.issue, e.debugId);
    else console.error(e);
    redirect(`${back}?error=paypal`);
  }
  if (!approveUrl) redirect(`${back}?error=paypal`);
  redirect(approveUrl);
}

/** The grandparent pressed play on a thank-you: it's no longer "New". */
export async function markThankYouWatched(id: string) {
  await store.markWatched(id);
}

export async function resetDemo() {
  await store.reset();
  redirect("/");
}
