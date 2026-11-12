import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import type { Currency } from "../money/money.ts";
import type { ActualReceipt } from "../paypal/actual.ts";

/**
 * A tiny JSON store for the prototype. With BLOB_READ_WRITE_TOKEN set (Vercel),
 * it lives in a private Vercel Blob; without it, in .data/ on local disk.
 * Fine for a demo; use Postgres before real families rely on it.
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
  /** Set when the video lives in Vercel Blob instead of .data/videos. */
  blobPathname?: string;
  caption: string;
  /** Caption translated into the giver's language, when AI is set up. */
  captionTranslated?: string;
  createdAt: string;
  /** Caption translated for each giver, in their language and with the name Mei calls them. */
  captionByMember?: Record<string, string>;
  /** Givers who have pressed play. Anyone not listed still sees "New". */
  watchedBy?: string[];
}

interface Data {
  contributions: Contribution[];
  thankYous: ThankYou[];
}

export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

export const usesBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_STORE = "data/store.json";
const empty = (): Data => ({ contributions: [], thankYous: [] });

async function read(): Promise<Data> {
  if (usesBlob()) {
    const r = await get(BLOB_STORE, { access: "private", useCache: false }).catch(() => null);
    if (!r || r.statusCode !== 200) return empty();
    return JSON.parse(await new Response(r.stream).text()) as Data;
  }
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Data;
  } catch {
    return empty();
  }
}

async function write(data: Data): Promise<void> {
  if (usesBlob()) {
    await put(BLOB_STORE, JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2));
}

const BLOB_SEED = "data/seed.json";
const SEED_FILE = path.join(DATA_DIR, "seed.json");

async function readSeed(): Promise<Data | undefined> {
  if (usesBlob()) {
    const r = await get(BLOB_SEED, { access: "private", useCache: false }).catch(() => null);
    if (!r || r.statusCode !== 200) return undefined;
    return JSON.parse(await new Response(r.stream).text()) as Data;
  }
  try {
    return JSON.parse(await readFile(SEED_FILE, "utf8")) as Data;
  } catch {
    return undefined;
  }
}

async function writeSeed(data: Data): Promise<void> {
  if (usesBlob()) {
    await put(BLOB_SEED, JSON.stringify(data), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SEED_FILE, JSON.stringify(data, null, 2));
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
  markWatched(id: string, memberId: string) {
    return update((d) => {
      const t = d.thankYous.find((x) => x.id === id);
      if (t && !t.watchedBy?.includes(memberId)) t.watchedBy = [...(t.watchedBy ?? []), memberId];
    });
  },
  /**
   * Back to the saved demo state (the real sandbox payments and the hero
   * thank-you), so one judge's clicks don't erase the demo for the next.
   * With no saved state, starts empty. Save one with `npm run demo:snapshot`.
   */
  async reset() {
    const seed = await readSeed();
    return update((d) => {
      d.contributions = seed?.contributions ?? [];
      d.thankYous = (seed?.thankYous ?? []).map((t) => ({ ...t, watchedBy: [] }));
    });
  },
  async snapshot() {
    const d = await read();
    await writeSeed(d);
    return { contributions: d.contributions.length, thankYous: d.thankYous.length };
  },
};
