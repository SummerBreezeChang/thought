/**
 * Saves the current demo state (payments and thank-yous) as the state that
 * "Start the demo over" returns to. Run after recording the hero thank-you:
 *   npm run demo:snapshot
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set, else .data/seed.json.
 */
import { store } from "../server/store/store.ts";

store.snapshot().then((n) => console.log(`Saved demo state: ${n.contributions} payments, ${n.thankYous} thank-yous.`));
