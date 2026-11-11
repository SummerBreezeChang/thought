/**
 * Money helpers. All amounts are integers in the currency's minor unit
 * (cents for USD and EUR, whole units for TWD and JPY), so we never do
 * float math on money.
 */

export const CURRENCIES = ["USD", "TWD", "JPY", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Decimal places PayPal accepts. TWD and JPY reject decimals. */
export const DECIMALS: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  TWD: 0,
  JPY: 0,
};

export interface Money {
  /** Integer amount in the minor unit. */
  minor: number;
  currency: Currency;
}

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

function factor(currency: Currency): number {
  return 10 ** DECIMALS[currency];
}

export function money(major: number, currency: Currency): Money {
  return { minor: Math.round(major * factor(currency)), currency };
}

export function toMajor(m: Money): number {
  return m.minor / factor(m.currency);
}

/** The string PayPal expects in `amount.value`: "1600" for TWD, "12.50" for USD. */
export function toPayPalValue(m: Money): string {
  assertInteger(m);
  return toMajor(m).toFixed(DECIMALS[m.currency]);
}

/** Parse PayPal's `value` string back into minor units. */
export function fromPayPalValue(value: string, currency: Currency): Money {
  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    throw new Error(`Not a money value: "${value}"`);
  }
  return money(Number(value), currency);
}

/**
 * Some locales show TWD as a bare "$" (zh-TW), which reads as US dollars.
 * Always say "NT$" so a grandparent never confuses the two.
 */
function fixSymbol(text: string, m: Money): string {
  return m.currency === "TWD" ? text.replace(/(NT\$|\$|TWD\s?)/, "NT$") : text;
}

export function format(m: Money, locale: string): string {
  return fixSymbol(intl(m, locale, false), m);
}

function intl(m: Money, locale: string, short: boolean): string {
  const whole = m.minor % 10 ** DECIMALS[m.currency] === 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: short && whole ? 0 : DECIMALS[m.currency],
    maximumFractionDigits: DECIMALS[m.currency],
  }).format(toMajor(m));
}

/** Like format, but drops ".00" on whole amounts ("US$100", not "US$100.00"). */
export function formatShort(m: Money, locale: string): string {
  return fixSymbol(intl(m, locale, true), m);
}

/** An exchange rate as "NT$33.73": local currency per one US dollar, always 2 decimals. */
export function formatRate(usdPerUnit: number, currency: Currency, locale: string): string {
  const text = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(1 / usdPerUnit);
  return currency === "TWD" ? text.replace(/(NT\$|\$|TWD\s?)/, "NT$") : text;
}

export function assertInteger(m: Money): void {
  if (!Number.isSafeInteger(m.minor)) {
    throw new Error(`Money must be an integer in minor units, got ${m.minor} ${m.currency}`);
  }
}

/** Round a fractional minor amount half-up (away from zero for positives). */
export function roundMinor(fractionalMinor: number): number {
  return Math.sign(fractionalMinor) * Math.round(Math.abs(fractionalMinor) + Number.EPSILON);
}
