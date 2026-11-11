import { BAY_AREA_CATALOG } from "../catalog/bay-area.ts";
import type { CatalogItem } from "../catalog/types.ts";
import { goalProgress, type GoalProgress } from "../quotes/goal.ts";
import { store, type Contribution } from "./store.ts";

/** What a paid contribution delivered: PayPal's actual USD if we have it, else our estimate. */
export function receivedUsdCents(c: Contribution): number {
  return c.actual?.receivedUsd?.minor ?? c.estimateUsdCents;
}

export const isPaid = (c: Contribution) => c.status === "captured" || c.status === "pending";

export interface GiftStatus {
  item: CatalogItem;
  progress: GoalProgress;
  givers: Contribution[];
}

/** Every gift is a goal of its catalog price, funded by paid contributions. */
export async function giftStatus(giftId: string): Promise<GiftStatus | undefined> {
  const item = BAY_AREA_CATALOG.find((i) => i.id === giftId);
  if (!item) return undefined;
  const givers = (await store.contributions()).filter((c) => c.giftId === giftId && isPaid(c));
  const progress = goalProgress(
    { minor: item.priceUsdCents, currency: "USD" },
    givers.map((c) => ({ memberId: c.memberId, receivedUsd: { minor: receivedUsdCents(c), currency: "USD" }, isActual: !!c.actual?.receivedUsd })),
  );
  return { item, progress, givers };
}
