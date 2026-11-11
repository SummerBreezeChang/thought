import type { Currency } from "../money/money.ts";
import type { Culture } from "../rules/amounts.ts";
import type { Area } from "../catalog/types.ts";

/** Demo seed. In the app these rows come from Lovable Cloud (Supabase). */
export interface Member {
  id: string;
  familyId: string;
  title: string;
  role: "parent" | "grandparent" | "relative";
  culture: Culture;
  currency: Currency;
  status: "invited" | "approved" | "blocked";
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  birthdate: string;
  interests: string[];
}

export interface Goal {
  id: string;
  familyId: string;
  childId: string;
  catalogItemId: string;
  targetUsdCents: number;
  /** USD cents already received (estimate or actual). */
  receivedUsdCents: number;
  status: "open" | "funded" | "fulfilled" | "cancelled";
}

export interface Family {
  id: string;
  name: string;
  area: Exclude<Area, "Bay Area">;
  hints: string[];
  /** Catalog IDs the parent marked "we already have this". */
  alreadyHave: string[];
}

export const DEMO = {
  families: [{ id: "fam-lin", name: "Lin", area: "SF", hints: ["Mei loves dinosaur movies", "Saturdays work"], alreadyHave: [] }] as Family[],
  children: [{ id: "child-mei", familyId: "fam-lin", name: "Mei", birthdate: "2020-08-14", interests: ["science", "dinosaurs", "swimming"] }] as Child[],
  members: [
    { id: "m-lin", familyId: "fam-lin", title: "Lin", role: "parent", culture: "en-US", currency: "USD", status: "approved" },
    { id: "m-chen", familyId: "fam-lin", title: "阿嬤", role: "grandparent", culture: "zh-TW", currency: "TWD", status: "approved" },
    { id: "m-kenji", familyId: "fam-lin", title: "おじいちゃん", role: "grandparent", culture: "ja-JP", currency: "JPY", status: "approved" },
    { id: "m-claire", familyId: "fam-lin", title: "Mamie", role: "grandparent", culture: "fr-FR", currency: "EUR", status: "invited" },
  ] as Member[],
  goals: [{ id: "goal-movies", familyId: "fam-lin", childId: "child-mei", catalogItemId: "saturday-movies", targetUsdCents: 10000, receivedUsdCents: 0, status: "open" }] as Goal[],
};

export function ageInMonths(birthdate: string, today = new Date()): number {
  const b = new Date(birthdate);
  return (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth()) - (today.getDate() < b.getDate() ? 1 : 0);
}
