export type Lang = "en" | "zh-TW" | "ja-JP" | "fr-FR";
export type Localized = Record<Lang, string>;

/** Stages of a child's life. The catalog is curated per stage. */
export type LifeStage = "expecting" | "baby" | "toddler" | "kid" | "big_kid";

export const STAGE_AGE_MONTHS: Record<LifeStage, [number, number]> = {
  expecting: [-9, 0],
  baby: [0, 12],
  toddler: [12, 48],
  kid: [48, 96],
  big_kid: [96, 156],
};

export type Area = "SF" | "East Bay" | "Bay Area";

/**
 * How Thought turns the money into the gift. Only `gift_card` is automated;
 * the others are bought by a person and labeled that way in the app.
 *  - gift_card: an e-gift card bought through PayPal (MCP commerce tools, or a
 *    gift-card API such as Tremendous or Tango) by the AI agent
 *  - membership: a family membership bought on the venue's site
 *  - registration: a class or camp spot booked for the chosen dates
 *  - registry: an item from the parent's own registry (e.g. Babylist)
 */
export type Fulfillment = "gift_card" | "membership" | "registration" | "registry";

export type Category = "food" | "outing" | "membership" | "lessons" | "camp" | "baby_gear" | "care";

export interface CatalogItem {
  id: string;
  title: Localized;
  /** One line on why it fits, shown on the gift card. */
  why: Localized;
  stages: LifeStage[];
  category: Category;
  area: Area;
  priceUsdCents: number;
  fulfillment: Fulfillment;
  provider: string;
  sourceUrl: string;
  /** What exactly is bought, from the provider's own page (e.g. "eGift by email, $15–$500"). */
  offer?: string;
  /** False until someone re-checks the price on the source page. */
  priceVerified: boolean;
}
