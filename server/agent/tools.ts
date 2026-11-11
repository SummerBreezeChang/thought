import { randomUUID } from "node:crypto";
import { z } from "zod";
import { BAY_AREA_CATALOG } from "../catalog/bay-area.ts";
import { curate } from "../catalog/curate.ts";
import type { CatalogItem, Lang } from "../catalog/types.ts";
import { ageInMonths, DEMO } from "../demo/family.ts";
import { PAYPAL_US_2026 } from "../quotes/fee-schedule.ts";
import { grossUpFor, quoteContribution, usdListingAlternative } from "../quotes/quote.ts";
import type { RateProvider } from "../quotes/rates.ts";
import { checkAmount, suggestGoalAmounts } from "../rules/amounts.ts";

/**
 * The concierge's tools. "AI suggests, code decides, human approves":
 * every number comes from code, and the only write is a draft that the
 * grandparent pays with the PayPal button. The model cannot move money.
 */

export interface ToolContext {
  memberId: string;
  rates: RateProvider;
  data?: typeof DEMO;
  catalog?: CatalogItem[];
  /** Gifts already fully given (from live payments). Never suggested again. */
  fundedGiftIds?: string[];
}

export class GuardError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}

/** Smallest contribution we accept, in USD cents. Stops "make it $0.01". */
export const MIN_CONTRIBUTION_USD_CENTS = 500;

function load(ctx: ToolContext) {
  const data = ctx.data ?? DEMO;
  const member = data.members.find((m) => m.id === ctx.memberId);
  if (!member || member.status !== "approved") throw new GuardError("not_approved", "Only approved family members can give.");
  const family = data.families.find((f) => f.id === member.familyId)!;
  const child = data.children.find((c) => c.familyId === family.id)!;
  return { data, member, family, child, catalog: ctx.catalog ?? BAY_AREA_CATALOG };
}

const lang = (culture: string): Lang => (culture === "en-US" ? "en" : (culture as Lang));

export const schemas = {
  searchCatalog: z.object({ maxUsd: z.number().positive().optional() }),
  suggestAmounts: z.object({ goalId: z.string() }),
  quote: z.object({ amount: z.number().int().positive().describe("In the member's currency minor unit (whole NT$ or ¥)") }),
  prepareContribution: z.object({
    goalId: z.string(),
    amount: z.number().int().positive(),
    message: z.string().max(500).optional(),
  }),
};

export function makeTools(ctx: ToolContext) {
  return {
    getFamilyContext() {
      const { family, child, member, data } = load(ctx);
      return {
        childName: child.name,
        ageMonths: ageInMonths(child.birthdate),
        interests: child.interests,
        area: family.area,
        parentHints: family.hints,
        you: { title: member.title, language: member.culture, currency: member.currency },
        alreadyFullyGiven: ctx.fundedGiftIds ?? [],
        openGoals: data.goals.filter((g) => g.familyId === family.id && g.status === "open").map((g) => ({
          goalId: g.id, catalogItemId: g.catalogItemId, targetUsdCents: g.targetUsdCents, receivedUsdCents: g.receivedUsdCents,
        })),
      };
    },

    searchCatalog(input: z.infer<typeof schemas.searchCatalog>) {
      const { family, child, member, catalog } = load(ctx);
      const l = lang(member.culture);
      return curate(catalog, {
        ageMonths: ageInMonths(child.birthdate),
        area: family.area,
        maxUsdCents: input.maxUsd === undefined ? undefined : Math.round(input.maxUsd * 100),
        exclude: [...family.alreadyHave, ...(ctx.fundedGiftIds ?? [])],
      }).map((i) => ({
        id: i.id, title: i.title[l], why: i.why[l], priceUsdCents: i.priceUsdCents,
        area: i.area, howItArrives: i.fulfillment, priceChecked: i.priceVerified,
      }));
    },

    async suggestAmounts(input: z.infer<typeof schemas.suggestAmounts>) {
      const { data, member, family, child } = load(ctx);
      const goal = data.goals.find((g) => g.id === input.goalId && g.familyId === family.id && g.status === "open");
      if (!goal) throw new GuardError("no_goal", "That gift isn't open for this family.");
      const midRate = await ctx.rates.getMidRate(member.currency);
      const remaining = { minor: goal.targetUsdCents - goal.receivedUsdCents, currency: "USD" as const };
      const finish = grossUpFor(remaining, { midRate, schedule: PAYPAL_US_2026 });
      const age = Math.floor(ageInMonths(child.birthdate) / 12);
      return suggestGoalAmounts(member.culture, finish, age).map((s) => ({
        amount: s.amount.minor, currency: s.amount.currency, reasonKey: s.reasonKey,
        familyReceivesUsdCents: quoteContribution({ gross: s.amount, midRate, schedule: PAYPAL_US_2026 }).familyReceivesUsd.minor,
      }));
    },

    async quote(input: z.infer<typeof schemas.quote>) {
      const { member } = load(ctx);
      const midRate = await ctx.rates.getMidRate(member.currency);
      const gross = { minor: input.amount, currency: member.currency };
      const q = quoteContribution({ gross, midRate, schedule: PAYPAL_US_2026 });
      return {
        lines: q.lines.map((l) => ({ key: l.key, amount: l.amount.minor, currency: l.amount.currency })),
        familyReceivesUsdCents: q.familyReceivesUsd.minor,
        totalCostPercent: Math.round(q.totalCostShare * 1000) / 10,
        ifListedInUsdYouWouldPayExtra: usdListingAlternative(q, PAYPAL_US_2026).extraForBuyer.minor,
        customCheck: checkAmount(member.culture, gross),
        rate: { source: midRate.source, asOf: midRate.asOf },
        note: "Estimate. PayPal sets the final rate.",
      };
    },

    /** Saves a draft only. The grandparent confirms and pays with the PayPal button. */
    async prepareContribution(input: z.infer<typeof schemas.prepareContribution>) {
      const { data, member, family } = load(ctx);
      const goal = data.goals.find((g) => g.id === input.goalId);
      if (!goal || goal.familyId !== family.id) throw new GuardError("wrong_family", "Gifts can only go to your own family.");
      if (goal.status !== "open") throw new GuardError("goal_closed", "That gift is already complete.");
      const midRate = await ctx.rates.getMidRate(member.currency);
      const q = quoteContribution({ gross: { minor: input.amount, currency: member.currency }, midRate, schedule: PAYPAL_US_2026 });
      if (q.familyReceivesUsd.minor < MIN_CONTRIBUTION_USD_CENTS) {
        throw new GuardError("too_small", "That amount is too small to send after fees.");
      }
      const remaining = goal.targetUsdCents - goal.receivedUsdCents;
      if (q.familyReceivesUsd.minor > remaining * 1.5 + 2000) {
        throw new GuardError("too_large", "That's well over what this gift needs.");
      }
      return {
        draftId: `draft-${randomUUID()}`,
        goalId: goal.id,
        amount: input.amount,
        currency: member.currency,
        familyReceivesUsdCents: q.familyReceivesUsd.minor,
        message: input.message ?? "",
        next: "Show the confirm card with the PayPal button. The member pays; the assistant cannot.",
      };
    },
  };
}
