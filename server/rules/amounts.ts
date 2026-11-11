import type { Currency, Money } from "../money/money.ts";

/**
 * Culture rules for amounts. Deterministic code: the AI may explain a note,
 * never change a number. Notes are i18n keys.
 */
export type Culture = "zh-TW" | "ja-JP" | "fr-FR" | "en-US";

export interface AmountCheck {
  ok: boolean;
  noteKey?: string;
  /** Nearby amounts that follow the custom, smallest first. */
  alternatives: Money[];
}

const hasDigit = (n: number, d: string) => String(n).includes(d);
const leadingDigit = (n: number) => String(n)[0];

/** Is this a "nice" amount for the culture? Works in major units for TWD/JPY. */
function isNice(culture: Culture, minor: number, currency: Currency): boolean {
  switch (culture) {
    case "zh-TW":
      // Hundreds, no 4 (sounds like "death"), and either a lucky 6 or 8 or a round thousand.
      return minor % 100 === 0 && !hasDigit(minor, "4") && (hasDigit(minor, "6") || hasDigit(minor, "8") || minor % 1000 === 0);
    case "ja-JP":
      // Whole thousands (bills), not starting with 4 ("death") or 9 ("suffering").
      return minor % 1000 === 0 && leadingDigit(minor) !== "4" && leadingDigit(minor) !== "9";
    case "fr-FR":
    case "en-US": {
      // Round amounts: steps of 5 under 50, steps of 10 above. Minor units are cents.
      const major = currency === "TWD" || currency === "JPY" ? minor : minor / 100;
      return Number.isInteger(major) && (major < 50 ? major % 5 === 0 : major % 10 === 0);
    }
  }
}

function step(culture: Culture, currency: Currency): number {
  if (culture === "zh-TW") return 100;
  if (culture === "ja-JP") return 1000;
  return currency === "TWD" || currency === "JPY" ? 1 : 100;
}

/** The smallest nice amount at or above `minor`. */
export function niceUp(culture: Culture, m: Money): Money {
  const s = step(culture, m.currency);
  let n = Math.max(s, Math.ceil(m.minor / s) * s);
  while (!isNice(culture, n, m.currency)) n += s;
  return { minor: n, currency: m.currency };
}

/** The largest nice amount at or below `minor`, or null if none. */
export function niceDown(culture: Culture, m: Money): Money | null {
  const s = step(culture, m.currency);
  let n = Math.floor(m.minor / s) * s;
  while (n > 0 && !isNice(culture, n, m.currency)) n -= s;
  return n > 0 ? { minor: n, currency: m.currency } : null;
}

export function checkAmount(culture: Culture, m: Money): AmountCheck {
  if (isNice(culture, m.minor, m.currency)) {
    const noteKey = culture === "zh-TW" && hasDigit(m.minor, "8") ? "rules.zhTW.lucky8" : undefined;
    return { ok: true, noteKey, alternatives: [] };
  }
  const down = niceDown(culture, m);
  const up = niceUp(culture, m);
  const noteKey =
    culture === "zh-TW" && hasDigit(m.minor, "4") ? "rules.zhTW.avoid4"
    : culture === "ja-JP" && ["4", "9"].includes(leadingDigit(m.minor) ?? "") ? "rules.jaJP.avoid4or9"
    : "rules.roundAmount";
  return { ok: false, noteKey, alternatives: down ? [down, up] : [up] };
}

export interface AmountSuggestion {
  amount: Money;
  reasonKey: string;
}

/**
 * Three amounts for a contribution to a gift goal:
 *  - "finish": the nice amount that completes the goal (from the fee engine's gross-up)
 *  - "most": the largest nice amount below that
 *  - "classic": the culture's usual gift for the child's age
 * `finishGross` comes from `grossUpFor(remaining)` so fees are already inside it.
 */
export function suggestGoalAmounts(
  culture: Culture,
  finishGross: Money,
  childAgeYears: number,
): AmountSuggestion[] {
  const finish = niceUp(culture, finishGross);
  const most = niceDown(culture, finishGross);
  const classic = classicAmount(culture, childAgeYears, finishGross.currency);

  const out: AmountSuggestion[] = [{ amount: finish, reasonKey: "rules.finishGoal" }];
  const add = (amount: Money | null, reasonKey: string) => {
    if (amount && amount.minor < finish.minor && !out.some((s) => s.amount.minor === amount.minor)) out.push({ amount, reasonKey });
  };
  add(most, "rules.mostOfGoal");
  add(classic, `rules.classic.${culture}`);
  return out.sort((a, b) => a.amount.minor - b.amount.minor);
}

/** The usual gift by age: red envelope (zh-TW), otoshidama (ja-JP), étrennes (fr-FR). */
export function classicAmount(culture: Culture, age: number, currency: Currency): Money | null {
  const table: Partial<Record<Culture, { currency: Currency; byAge: (a: number) => number }>> = {
    "zh-TW": { currency: "TWD", byAge: (a) => (a < 6 ? 600 : a < 13 ? 1200 : 2000) },
    "ja-JP": { currency: "JPY", byAge: (a) => (a < 6 ? 1000 : a < 13 ? 3000 : 5000) },
    "fr-FR": { currency: "EUR", byAge: (a) => (a < 6 ? 2000 : a < 13 ? 3000 : 5000) },
  };
  const row = table[culture];
  if (!row || row.currency !== currency) return null;
  return { minor: row.byAge(age), currency };
}
