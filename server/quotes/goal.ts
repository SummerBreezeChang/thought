import type { Money } from "../money/money.ts";

export interface GoalContribution {
  memberId: string;
  /** What the family receives from this contribution, in USD. Actual if captured, else estimate. */
  receivedUsd: Money;
  isActual: boolean;
}

export interface GoalProgress {
  targetUsd: Money;
  receivedUsd: Money;
  remainingUsd: Money;
  /** 0..1, capped at 1. */
  share: number;
  funded: boolean;
  /** True while any contribution is still an estimate. */
  hasEstimates: boolean;
}

export function goalProgress(targetUsd: Money, contributions: GoalContribution[]): GoalProgress {
  const received = contributions.reduce((sum, c) => sum + c.receivedUsd.minor, 0);
  const remaining = Math.max(0, targetUsd.minor - received);
  return {
    targetUsd,
    receivedUsd: { minor: received, currency: "USD" },
    remainingUsd: { minor: remaining, currency: "USD" },
    share: Math.min(1, received / targetUsd.minor),
    funded: received >= targetUsd.minor,
    hasEstimates: contributions.some((c) => !c.isActual),
  };
}
