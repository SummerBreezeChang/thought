import { STAGE_AGE_MONTHS, type Area, type CatalogItem, type LifeStage } from "./types.ts";

export function stageForAge(ageMonths: number): LifeStage {
  const stages = Object.entries(STAGE_AGE_MONTHS) as [LifeStage, [number, number]][];
  const hit = stages.find(([, [lo, hi]]) => ageMonths >= lo && ageMonths < hi);
  return hit ? hit[0] : "big_kid";
}

export interface CurateInput {
  ageMonths: number;
  /** Where the child lives. "Bay Area" items show everywhere. */
  area: Exclude<Area, "Bay Area">;
  maxUsdCents?: number;
  /** Catalog IDs the parent marked "we already have this". */
  exclude?: string[];
}

/** Gifts that fit this child's stage and city, cheapest first. */
export function curate(catalog: CatalogItem[], input: CurateInput): CatalogItem[] {
  const stage = stageForAge(input.ageMonths);
  return catalog
    .filter((i) => i.stages.includes(stage))
    .filter((i) => i.area === "Bay Area" || i.area === input.area)
    .filter((i) => input.maxUsdCents === undefined || i.priceUsdCents <= input.maxUsdCents)
    .filter((i) => !input.exclude?.includes(i.id))
    .sort((a, b) => a.priceUsdCents - b.priceUsdCents);
}
