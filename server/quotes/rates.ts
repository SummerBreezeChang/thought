import type { Currency } from "../money/money.ts";

export interface MidRate {
  /** US dollars per one major unit of `currency` (e.g. 0.03125 for TWD at 32 TWD/USD). */
  usdPerUnit: number;
  currency: Currency;
  source: string;
  /** ISO time the rate was read. */
  asOf: string;
}

export interface RateProvider {
  getMidRate(currency: Currency): Promise<MidRate>;
}

/**
 * Fixed, clearly labeled demo rates. Used in tests and as the fallback when the
 * live source is unreachable. PayPal always sets the final rate.
 */
export const DEMO_RATES: Record<Currency, number> = {
  USD: 1,
  TWD: 1 / 32,
  JPY: 1 / 150,
  EUR: 1.08,
};

export function fixedRateProvider(
  rates: Record<Currency, number> = DEMO_RATES,
  source = "demo fixed rate",
  asOf = new Date().toISOString(),
): RateProvider {
  return {
    async getMidRate(currency) {
      return { usdPerUnit: rates[currency], currency, source, asOf };
    },
  };
}

/** Free, keyless daily market rates (ExchangeRate-API open access). Covers TWD, JPY and EUR. */
export const OPEN_ER_API = "https://open.er-api.com/v6/latest/USD";

interface OpenErApiResponse {
  result: string;
  time_last_update_unix: number;
  rates: Record<string, number>;
}

type Fetch = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Live market mid rates, cached in memory for `ttlMs`. If the source is down or
 * slow, falls back to `fallback` so a grandparent never hits an error page.
 * PayPal still sets the final rate at capture.
 */
export function liveRateProvider(options: {
  fetchImpl?: Fetch;
  ttlMs?: number;
  timeoutMs?: number;
  fallback?: RateProvider;
  now?: () => number;
} = {}): RateProvider {
  const fetchImpl: Fetch = options.fetchImpl ?? ((url, init) => fetch(url, init));
  const ttlMs = options.ttlMs ?? 60 * 60 * 1000;
  const timeoutMs = options.timeoutMs ?? 2500;
  const fallback = options.fallback ?? fixedRateProvider();
  const now = options.now ?? Date.now;
  let cache: { at: number; perUsd: Record<string, number>; asOf: string } | undefined;

  async function load() {
    if (cache && now() - cache.at < ttlMs) return cache;
    const res = await fetchImpl(OPEN_ER_API, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error("rate source unavailable");
    const body = (await res.json()) as OpenErApiResponse;
    if (body.result !== "success") throw new Error("rate source error");
    cache = { at: now(), perUsd: body.rates, asOf: new Date(body.time_last_update_unix * 1000).toISOString() };
    return cache;
  }

  return {
    async getMidRate(currency) {
      if (currency === "USD") return { usdPerUnit: 1, currency, source: "USD", asOf: new Date(now()).toISOString() };
      try {
        const { perUsd, asOf } = await load();
        const perUsdValue = perUsd[currency];
        if (perUsdValue === undefined || !(perUsdValue > 0)) throw new Error(`no rate for ${currency}`);
        return { usdPerUnit: 1 / perUsdValue, currency, source: "open.er-api.com market rate", asOf };
      } catch {
        return fallback.getMidRate(currency);
      }
    },
  };
}
