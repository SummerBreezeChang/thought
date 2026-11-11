import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Currency } from "../money/money.ts";
import type { ActualReceipt } from "../paypal/actual.ts";

/**
 * A tiny JSON file store for the prototype. Swap for Postgres before real use:
 * the file lives on local disk, so it doesn't persist on serverless hosts.
 */

export interface Contribution {
  id: string;
  memberId: string;
  giftId: string;
  amountMinor: number;
  currency: Currency;
  message: string;
  status: "created" | "captured" | "pending" | "failed";
  orderId?: string;
  estimateUsdCents: number;
  actual?: ActualReceipt;
  createdAt: string;
}

export interface ThankYou {
  id: string;
  contributionId: string;
  videoFile: string;
  mimeType: string;
  caption: string;
  /** Caption translated into the giver's language, when AI is set up. */
  captionTranslated?: string;
  createdAt: string;
  /** First time the grandparent pressed play. Unset means "New". */
  watchedAt?: string;
}

interface Data {
  contributions: Contribution[];
  thankYous: ThankYou[];
}

export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

async function read(): Promise<Data> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Data;
  } catch {
    return { contributions: [], thankYous: [] };
  }
}

async function write(data: Data): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2));
}

// Serialize writes so two quick requests can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function update<T>(fn: (d: Data) => T): Promise<T> {
  const next = queue.then(async () => {
    const d = await read();
    const out = fn(d);
    await write(d);
    return out;
  });
  queue = next.catch(() => undefined);
  return next;
}

export const store = {
  async contributions(): Promise<Contribution[]> {
    return (await read()).contributions;
  },
  async contribution(id: string): Promise<Contribution | undefined> {
    return (await read()).contributions.find((c) => c.id === id);
  },
  addContribution(c: Contribution) {
    return update((d) => void d.contributions.push(c));
  },
  patchContribution(id: string, patch: Partial<Contribution>) {
    return update((d) => {
      const c = d.contributions.find((x) => x.id === id);
      if (c) Object.assign(c, patch);
      return c;
    });
  },
  async thankYous(): Promise<ThankYou[]> {
    return (await read()).thankYous;
  },
  addThankYou(t: ThankYou) {
    return update((d) => void d.thankYous.push(t));
  },
  markWatched(id: string) {
    return update((d) => {
      const t = d.thankYous.find((x) => x.id === id);
      if (t && !t.watchedAt) t.watchedAt = new Date().toISOString();
    });
  },
  reset() {
    return update((d) => {
      d.contributions = [];
      d.thankYous = [];
    });
  },
};
