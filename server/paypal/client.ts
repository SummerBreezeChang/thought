import { toPayPalValue, type Money } from "../money/money.ts";

/**
 * A small PayPal REST client using fetch, with no SDK, so the same file runs
 * in Node, in Lovable Cloud edge functions (Deno) and in Next.js.
 */

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  /** Sandbox by default. */
  baseUrl?: string;
}

export const SANDBOX_URL = "https://api-m.sandbox.paypal.com";

export class PayPalError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** First `details[].issue`, e.g. INSTRUMENT_DECLINED. Branch on this. */
    readonly issue: string | undefined,
    /** Log this; PayPal support asks for it. */
    readonly debugId: string | undefined,
  ) {
    super(message);
    this.name = "PayPalError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  /** Idempotency key: our contribution ID, so a retry never double-charges. */
  requestId?: string;
  /** Sandbox negative testing, e.g. { mock_application_codes: "INSTRUMENT_DECLINED" }. */
  mockResponse?: Record<string, string>;
}

export interface CreateOrderInput {
  /** Our contribution ID. Used as invoice_id, custom_id and PayPal-Request-Id. */
  contributionId: string;
  amount: Money;
  /** Shown in PayPal: "Saturday at the movies for Mei". */
  description: string;
  /** PayPal UI locale, e.g. "zh-TW", "ja-JP", "fr-FR". */
  locale: string;
  returnUrl: string;
  cancelUrl: string;
}

export function createPayPalClient(config: PayPalConfig) {
  const baseUrl = config.baseUrl ?? SANDBOX_URL;
  let token: { value: string; expiresAt: number } | null = null;

  async function accessToken(): Promise<string> {
    if (token && token.expiresAt > Date.now() + 60_000) return token.value;
    const basic = btoa(`${config.clientId}:${config.clientSecret}`);
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) throw await toError(res);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
    return token.value;
  }

  async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    if (opts.requestId) headers["PayPal-Request-Id"] = opts.requestId;
    if (opts.mockResponse) headers["PayPal-Mock-Response"] = JSON.stringify(opts.mockResponse);
    const res = await fetch(`${baseUrl}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    if (!res.ok) throw await toError(res);
    return (await res.json()) as T;
  }

  return {
    accessToken,

    /** Orders v2, listed in the grandparent's own currency. */
    createOrder(input: CreateOrderInput, mockResponse?: Record<string, string>) {
      const value = toPayPalValue(input.amount);
      return request<PayPalOrder>("/v2/checkout/orders", {
        method: "POST",
        requestId: `create-${input.contributionId}`,
        mockResponse,
        body: {
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: input.contributionId,
              invoice_id: input.contributionId,
              custom_id: input.contributionId,
              description: input.description.slice(0, 127),
              amount: { currency_code: input.amount.currency, value },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: "Thought",
                locale: input.locale,
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
                return_url: input.returnUrl,
                cancel_url: input.cancelUrl,
              },
            },
          },
        },
      });
    },

    captureOrder(orderId: string, contributionId: string, mockResponse?: Record<string, string>) {
      return request<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: "POST",
        requestId: `capture-${contributionId}`,
        mockResponse,
        body: {},
      });
    },

    getOrder(orderId: string) {
      return request<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
    },

    refundCapture(captureId: string, contributionId: string) {
      return request<{ id: string; status: string }>(`/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
        method: "POST",
        requestId: `refund-${contributionId}`,
        body: {},
      });
    },

    /** Ask PayPal whether a webhook really came from PayPal. Write the ledger only on SUCCESS. */
    async verifyWebhook(headers: Headers, rawBody: string, webhookId: string): Promise<boolean> {
      const h = (k: string) => headers.get(k) ?? "";
      const res = await request<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
        method: "POST",
        body: {
          auth_algo: h("paypal-auth-algo"),
          cert_url: h("paypal-cert-url"),
          transmission_id: h("paypal-transmission-id"),
          transmission_sig: h("paypal-transmission-sig"),
          transmission_time: h("paypal-transmission-time"),
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody) as unknown,
        },
      });
      return res.verification_status === "SUCCESS";
    },
  };
}

export type PayPalClient = ReturnType<typeof createPayPalClient>;

async function toError(res: Response): Promise<PayPalError> {
  const debugId = res.headers.get("paypal-debug-id") ?? undefined;
  let body: { message?: string; error_description?: string; details?: { issue?: string; description?: string }[] } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // Non-JSON error body; keep the status.
  }
  const issue = body.details?.[0]?.issue;
  const message = body.details?.[0]?.description ?? body.message ?? body.error_description ?? res.statusText;
  return new PayPalError(`PayPal ${res.status}: ${message}`, res.status, issue, debugId);
}

// Only the fields we read. PayPal returns more.
export interface PayPalAmount {
  currency_code: string;
  value: string;
}

export interface PayPalCapture {
  id: string;
  status: "COMPLETED" | "PENDING" | "DECLINED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "FAILED";
  status_details?: { reason?: string };
  amount: PayPalAmount;
  invoice_id?: string;
  custom_id?: string;
  seller_receivable_breakdown?: {
    gross_amount: PayPalAmount;
    paypal_fee?: PayPalAmount;
    net_amount?: PayPalAmount;
    receivable_amount?: PayPalAmount;
    exchange_rate?: { source_currency: string; target_currency: string; value: string };
  };
}

export interface PayPalOrder {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  links?: { href: string; rel: string; method?: string }[];
  payer?: { email_address?: string; address?: { country_code?: string } };
  purchase_units?: { reference_id?: string; payments?: { captures?: PayPalCapture[] } }[];
}
