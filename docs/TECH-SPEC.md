# Technical Spec

*v1 · Nov 5, 2026 · Companion docs: [DESIGN-BRIEF.md](DESIGN-BRIEF.md) · [USER-FLOWS.md](USER-FLOWS.md) · [../RESEARCH.md](../RESEARCH.md)*

**MVP (v2): "Grandma got you Saturday".** Two grandparents pool a $100 Saturday at the movies in TWD and JPY; Thought's AI agent buys the gift card through PayPal. See MVP-STORY.md for the full flow and Day-1 spikes. Shipped items, payouts and allowance are cut from the MVP.

**Product goal for the hackathon:** show PayPal at every touch point of a cross-border gift: choosing the currency, converting, paying, receiving, paying out. Every fee and every conversion is shown before anyone pays and confirmed afterwards. **No hidden costs.**

---

## 1. Scope

**In (demo):**
- Gift goals (pooled)
- Red envelope
- Care credit (gift card bought as merchant of record, or earmarked payout)
- Allowance (subscription)
- Child wallet
- Parent approvals and payouts
- AI concierge
- Custom-rules engine
- Translation
- Scam guard
- **Fee and FX transparency everywhere**

**Stretch:** physical items via Channel3 + shipment tracking.

**Out:**
- Live money
- Real partner fulfillment (DoorDash, sitters, museums)
- KYC
- Native mobile apps

---

## 2. Stack

**Decision pending: Lovable vs Next.js** (see SPEC.md §9). The layers below are the same either way; only the hosting of server code changes.

| Layer | Option 1: Lovable (recommended if entering a Lovable hackathon) | Option 2: Next.js (matches PayPal's official guide) |
|---|---|---|
| App framework | TanStack Start (Lovable's current default), React, TypeScript | Next.js 16 App Router, Server Actions |
| UI | Tailwind + shadcn/ui, tokens from DESIGN-BRIEF §5 | Same |
| Database / auth / storage | Lovable Cloud (Supabase): Postgres + row-level security, email one-time codes, storage for voice notes | Supabase (via Vercel Marketplace) |
| PayPal client | `@paypal/react-paypal-js` (SDK v6) | Same |
| PayPal server | `@paypal/paypal-server-sdk` in server functions; REST calls for Payouts | Same, in Server Actions / route handlers |
| AI | AI SDK + `@paypal/agent-toolkit/ai-sdk`; model via Vercel AI Gateway or an Anthropic key | Same |
| Speech | Speech-to-text for voice notes (model choice TBD; OpenAI or similar via the AI Gateway) | Same |
| Hosting | Lovable publish | Vercel |

**Node:** the local machine has Node 20. AI SDK 7 needs Node 22, so pin AI SDK 6 or upgrade Node.

---

## 3. Architecture

```
┌──────────────── Browser ────────────────┐
│ Grandparent UI (zh-TW / ja-JP / fr-FR)  │
│ Parent UI (en) · Child UI (en)          │
│ PayPal JS SDK v6 button (client ID)     │
└───────────────┬─────────────────────────┘
                │ server functions (never trust amounts from browser)
┌───────────────▼─────────────────────────┐
│ App server                               │
│  quotes/      FX + fee quote (§5)        │
│  orders/      create, capture            │
│  fulfill/     gift purchase or payout    │
│  subs/        allowance plans            │
│  refunds/     goal cancellation          │
│  webhooks/    verify signature → ledger  │
│  agent/       AI concierge + tools       │
│  rules/       custom amounts engine       │
└──────┬──────────────┬───────────────┬────┘
       │              │               │
   PayPal sandbox   Postgres       AI model / STT
   (REST + webhooks) (Supabase)     Channel3 (stretch)
```

---

## 4. PayPal integration, touch point by touch point

| # | Touch point | PayPal API | What the user sees |
|---|---|---|---|
| T1 | Grandparent picks an amount | none (our quote, §5) | Cost receipt: *you pay · fees · conversion · family receives* |
| T2 | Grandparent pays | **Orders v2** `POST /v2/checkout/orders` in the **grandparent's currency** (TWD/JPY/EUR) + **JS SDK v6** button with `locale` | PayPal popup in their language, charging exactly the amount they chose |
| T3 | Payment confirmed | `POST /v2/checkout/orders/{id}/capture` + webhook `PAYMENT.CAPTURE.COMPLETED` | Receipt updated with **actual** fee and rate from PayPal (§5.4) |
| T4 | Goal funded → payout | **Payouts** `POST /v1/payments/payouts` (PayPal email or `recipient_wallet: "Venmo"`) + webhooks `PAYMENT.PAYOUTS-ITEM.*` | Parent sees amount, payout fee (if any), and the gift note |
| T5 | Allowance | **Subscriptions** (`/v1/catalogs/products`, `/v1/billing/plans`, `/v1/billing/subscriptions`) + `PAYMENT.SALE.COMPLETED` | Monthly receipt with that month's fee and rate |
| T6 | Goal cancelled | **Refunds** `POST /v2/payments/captures/{id}/refund` | "Your NT$3,000 is on its way back", with what fees PayPal does or doesn't return (§5.5) |
| T7 | Item shipped (stretch) | Orders v2 with `shipping` + **tracking** `POST /v2/checkout/orders/{id}/track` | Tracking in their language |
| T8 | "Where's my gift?" | Agent toolkit `get_order`, shipment tracking | AI answers in their language with real PayPal status |

**Implementation rules**
- **Amounts are set on the server** from the catalog, goal or rules engine. The browser sends only a gift ID and the chosen option. (PayPal's guide: "Never accept the amount from the browser.")
- **Zero-decimal currencies:** TWD and JPY are integers. EUR and USD use 2 decimals. One `money.ts` helper formats and validates per currency.
- **Idempotency:** send a `PayPal-Request-Id` header (our contribution ID) on create, capture, refund and payout, so retries never double-charge.
- **Webhook truth:** the UI can show "captured" from the capture response, but the ledger is written only from a **verified webhook** (`POST /v1/notifications/verify-webhook-signature`). Store the raw event for the audit trail.
- **Errors:** branch on `details[0].issue`, log `debug_id`, show our own copy. Test `INSTRUMENT_DECLINED` and `DUPLICATE_INVOICE_ID` via the `PayPal-Mock-Response` header.
- **`invoice_id` / `custom_id`** on each order = our contribution ID, so dashboard records map back to the app.

---

## 5. Fees and FX: the transparency engine

### 5.1 PayPal's published US merchant fees
Source: [paypal.com/us/business/paypal-business-fees](https://www.paypal.com/us/business/paypal-business-fees), read Nov 5, 2026.

| Fee | Rate | Applies to us when |
|---|---|---|
| PayPal Checkout | **3.49% + fixed fee** | Every grandparent payment |
| Fixed fee | **NT$14 · ¥49 · €0.39** | Charged in the payment's currency |
| International commercial transaction | **+1.50%** | Buyer is outside the US: all our grandparents |
| Currency conversion spread, "paying for goods in a currency other than the listed currency" | **4.00%** | **We avoid this.** The order is listed in the grandparent's currency, so they pay exactly what they see, with no buyer-side conversion. |
| Currency conversion spread, "all other transactions" | **3.00%** | Our US business account converting the received TWD/JPY/EUR into USD |
| Payouts fee | **US: 2%, capped at $1.00** (international: 2%, capped at $20) | Earmarked payout to the parent |
| Refunds | **No fee to refund, but the original fees aren't returned** | Goal cancelled; Thought absorbs the lost fee |

Full evidence and verdicts are in [PAYPAL-FEASIBILITY.md](PAYPAL-FEASIBILITY.md).

These rates go into a `fee_schedule` config table, never hardcoded in UI code, so they can be updated when PayPal changes them.

### 5.2 The "right choice" we make (and explain) for the grandparent

| Option | Grandparent pays | Conversion spread | Who bears it | Our default? |
|---|---|---|---|---|
| **A. Order in their currency** (NT$3,000) | Exactly NT$3,000 | 3% on our side | Comes out of the gift (or covered, see 5.3) | ✅ Default |
| B. Order in USD ($94) | PayPal converts on their side, at a rate they see only in the popup | 4% on their side | Grandparent, less visibly | ❌ Shown as "why we don't do this" |

The UI explains this in one line: *"You pay in NT$, so PayPal won't add a conversion fee on your side."*

### 5.3 Who covers the fees: the grandparent chooses

On the contribute screen (T1), one toggle:
- **"Mei's family receives the full gift"** (grandparent covers the fees; the amount is grossed up). **Default ON.**
- **"Fees come out of the gift"**

**Estimate formula** (per payment, in the payment currency):
```
processing  = gross × (3.49% + 1.50%) + fixed_fee(currency)
net_local   = gross − processing
usd_est     = net_local × mid_rate × (1 − 3.00%)      # our conversion spread
total_cost% = 1 − usd_est / (gross × mid_rate)
```

**Gross-up** (to deliver a target USD value):
```
gross = ( target_usd / (mid_rate × 0.97) + fixed_fee ) / (1 − 0.0499)
→ round UP to the currency's unit (and, for red envelopes, to the next lucky amount)
```

**Worked example (illustrative rate: 1 USD = 32 TWD; the live rate is used at runtime):**

| Line | NT$ | ≈ USD |
|---|---|---|
| Grandma pays | **3,000** | 93.75 |
| PayPal processing (3.49%) | −104.7 | −3.27 |
| International (1.50%) | −45.0 | −1.41 |
| Fixed fee | −14.0 | −0.44 |
| Conversion to USD (3% spread) | | −2.66 |
| **Mei's family receives** | | **≈ 85.97** |
| **Total cost** | | **≈ 8.3%** |

That 8.3% is shown plainly, next to the World Bank global average of 6.36% for remittances ([RPW Q3 2025](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf)). We don't hide that a cross-border card-network payment has a real cost. The value we add is the gift, the trust and the clarity.

**Thought's own fee:** **$0 in the demo**, shown as its own line ("Thought fee: $0"). Business model ideas (a small platform fee, or merchant partnerships) go in the pitch, not into the receipt.

### 5.4 Estimate → actual

- **Before payment:** `quotes/` returns `{gross, currency, lines[], usd_estimate, mid_rate, rate_source, rate_time, quote_expires_at}`. Quotes expire after 10 minutes and the UI labels everything "about".
- **After capture:** PayPal returns `seller_receivable_breakdown` on the capture: `gross_amount`, `paypal_fee`, `net_amount`, and, when PayPal converts, `receivable_amount` and `exchange_rate`. We store this as the **actual** and show the grandparent and parent a final receipt: "Estimated $85.97 · Actual $86.10".
  - *Verify on Day 1:* that the sandbox business account is set to **auto-convert received currencies to USD** (receiving preferences). Otherwise funds sit as a TWD balance, and the conversion happens as a separate later step (also 3%) that we'd record as its own ledger line.
- **Mid-market rate source** for estimates: a free rates API that includes TWD/JPY/EUR (*decision pending*). PayPal's quote-and-lock API (`/v2/pricing/quote-exchange-rates`) needs an FXaaS contract, so the receipt always shows *"Estimate based on market rate at 10:42. PayPal sets the final rate."* Rate locking is the production upgrade we name in the pitch.

### 5.5 Refunds and payouts, honestly

- **Refunds:** PayPal keeps its original fees on a refund. **Thought absorbs that loss** so the grandparent gets back exactly what they paid, and the parent sees the absorbed fee before confirming the cancellation.
- **Payouts:** the payout fee is shown to the parent before they approve: "You'll receive $85.97 − payout fee $1.00 = $84.97". Payouts in USD to a US PayPal/Venmo account mean no conversion on this leg.

### 5.6 Fulfillment and PayPal policy

PayPal's [Acceptable Use Policy](https://www.paypal.com/us/legalhub/paypal/acceptableuse-full) lists "Payment Facilitator" (money service business, escrow) as needing pre-approval. Pooling grandparents' money and paying cash to parents fits that description. So:

| Path | Use | How |
|---|---|---|
| **Merchant of record (primary)** | Experiences, care credits, items | Each contribution buys a specific gift. When funded, Thought buys it: a gift card via the **PayPal MCP gift-card tools** (`search_product` / `create_cart` / `checkout_cart` with `commerce:true`) if they work in sandbox, otherwise simulated; a physical item with shipment tracking. |
| **Earmarked payout (shown, flagged)** | Cash moments, demo of the original idea | Payouts API to the parent. README and video say: "production needs PayPal payment-facilitator approval or Multiparty." |
| **Roadmap** | Not holding funds at all | PayPal Multiparty with the parent as payee and a platform fee; FXaaS rate lock; PayPal World wallets (Weixin Pay / UPI today). |

**Agentic commerce angle:** when a goal is funded, the AI agent places the gift-card order through PayPal's own MCP commerce tools. That's an AI agent completing a real purchase, which fits the "Best Use of Agentic Commerce" prize.

### 5.7 Where cost info appears (every touch point)

| Touch point | Shown |
|---|---|
| Gift card (concierge) | Price in USD + ≈ local currency |
| Contribute | Full cost receipt (estimate) + cover-fees toggle + "why you pay in NT$" |
| PayPal popup | PayPal's own total, in their currency, equal to the receipt's "You pay" |
| Sent screen | Final receipt (actual, from PayPal) |
| Goal page | Total given vs total received (fees visible in aggregate) |
| Parent approval | What came in, fees taken, payout fee, what lands in their account |
| Child view | No fees (kids see the gift). Parent can open the receipt. |
| Monthly allowance | Each month's receipt in the grandparent's history |

---

## 6. Custom-rules engine (`rules/`)

The rules are deterministic code. The AI only explains them; it never decides the numbers.

```ts
type Culture = "zh-TW" | "ja-JP" | "fr-FR";
type Occasion = "lunar_new_year" | "oshogatsu" | "birthday" | "christmas" | "new_baby" | "school_start";

suggestAmounts(culture, occasion, childAgeYears, currency): Suggestion[]   // 3 options + reason keys
checkAmount(culture, amount): { ok: boolean; noteKey?: string; alternatives?: number[] }
```

- **zh-TW:** prefer even amounts and amounts containing 6 or 8; flag any amount containing 4. Default red-envelope ladder: NT$600 / 1,200 / 2,000 / 3,600 / 6,000 / 8,800.
- **ja-JP (お年玉):** age bands, roughly ¥1,000 under 6, ¥3,000 for 6–12, ¥5,000–10,000 for 13+. Avoid amounts starting with 4 or 9. Use new-bill-style round amounts.
- **fr-FR:** no number custom; round amounts (€10 / €20 / €50).
- Every note is an i18n key, and AI copy may paraphrase it but never change the number.
- **Gross-up rounding:** when "cover fees" is on, round up to the next allowed amount.

---

## 7. AI design (`agent/`)

**Model:** one mid-size model via AI Gateway (for example a current Claude Sonnet) with structured tool calls. Fall back to a cheaper model on rate limits.

**System rules (summarized):**
- Reply in the user's language.
- Only recommend catalog item IDs returned by tools.
- Never state a price or fee that didn't come from a tool.
- Never ask for or accept payment details.
- Refuse any request to pay someone outside the approved family members, then tell the user to contact the parent.

**Tools**

| Tool | Does | Notes |
|---|---|---|
| `get_family_context()` | Child age, interests, wishes, occasions, the user's language and currency | Read-only |
| `search_catalog({category?, maxUsd?, occasion?})` | Filtered catalog items | IDs + facts from DB |
| `suggest_amounts({occasion})` | Calls the rules engine | Numbers from code |
| `quote({giftId, amount, coverFees})` | Calls the fee/FX engine (§5) | Returns the receipt lines the AI may read out |
| `prepare_contribution({giftId, amount, coverFees, message})` | Saves a **draft** and returns a confirm card | The user pays with the PayPal button; the AI can't |
| `translate({text, to})` | Messages and captions | Original always stored |
| `fulfill_gift({goalId})` | Buys the funded gift via PayPal MCP commerce tools | Parent-approved goals only |
| PayPal toolkit `get_order`, `get_shipment_tracking` | Status questions | Read-only subset only |
| `search_products` (Channel3, stretch) | Physical items | Translate intent to English first |

**Guardrails in code:**
- Order creation checks that the payer is an approved member of the family and the gift belongs to that family's child.
- Amounts are rechecked against the rules and the quote.
- The model's text never reaches PayPal.

**Eval set (before the demo):** 30 prompts across the 3 languages:
- gift ideas
- unlucky amounts
- "send money to my nephew's account" (must refuse)
- "make it $0.01" (must refuse)
- fee questions (must quote from the tool)

---

## 8. Data model (Postgres)

```sql
families        (id, name, city, created_by)
members         (id, family_id, user_id, role [parent|grandparent|relative|child],
                 title, country, language, currency, paypal_email, venmo_handle,
                 status [invited|approved|blocked])
children        (id, family_id, name, birthdate, interests text[], photo_url, show_amounts bool)
catalog_items   (id, type [cash|care|experience|item|recurring], title_i18n jsonb,
                 description_i18n jsonb, price_usd numeric, age_min, age_max, city,
                 fulfillment [wallet|gift_card|earmarked_payout|ship|subscription],
                 source_url, price_checked_at)
wishes          (id, child_id, catalog_item_id, added_by, note)
gift_goals      (id, child_id, catalog_item_id, target_usd, occasion, due_date,
                 status [open|funded|fulfilled|cancelled])
quotes          (id, member_id, gift_ref, gross_minor, currency, cover_fees, lines jsonb,
                 usd_estimate, mid_rate, rate_source, expires_at)
contributions   (id, goal_id null, child_id, member_id, kind [goal|envelope|care|item|allowance],
                 quote_id, paypal_order_id, paypal_capture_id, gross_minor, currency,
                 paypal_fee_minor, net_minor, receivable_usd, exchange_rate,
                 status [draft|created|captured|failed|refunded],
                 message_original, message_lang, message_en, voice_url, unlock_at)
ledger_entries  (id, child_id, contribution_id null, payout_id null, amount_usd, kind [in|out|fee])
fulfillments    (id, goal_id, method [gift_card|payout|ship], paypal_ref, amount_usd, fee_usd, note, status)
subscriptions   (id, member_id, child_id, paypal_plan_id, paypal_subscription_id, status)
thank_yous      (id, child_id, to_member_id, voice_url, text_original, text_translated)
webhook_events  (id, paypal_event_id unique, type, payload jsonb, verified bool, processed_at)
fee_schedule    (id, key, value, currency null, source_url, checked_at)
```

**Row-level security:**
- Members read only their own family.
- Grandparents can't read other members' payout details or the street address.
- Only parents write approvals and payouts.

**Money columns:**
- Integer minor units per currency. JPY and TWD minor = 1 unit, so no cents.
- USD as numeric(12,2).

---

## 9. Internationalization

- UI strings live in `messages/{en,zh-TW,ja-JP,fr-FR}.json`. A native speaker checks the zh-TW and ja-JP core strings.
- The locale comes from the member's profile (set by the invite), with a switcher on every screen.
- **Money formatting:** `Intl.NumberFormat(locale, {style: "currency", currency})`, so you get NT$3,000 / ¥5,000 / 20,00 €.
- **Dates** show in the child's time zone ("Mei will see it at 8 AM her time").
- The PayPal button gets the matching `locale`.

---

## 10. Security and privacy

- **Secrets:** the PayPal client secret, AI key and webhook ID live in server env/secrets only. Only the PayPal client ID is public.
- **Webhooks:** verify the signature and dedupe on `paypal_event_id`.
- **No card data** ever touches our app; PayPal handles all payment details.
- **Data minimization:**
  - Grandparents see the city only.
  - Voice notes live in private storage with signed URLs.
- **Kids' data:** the parent owns the child profile; no child accounts or logins under 13 (the child view runs inside the parent's session).
- **Compliance note for the pitch:** pooling funds for others is regulated (money transmission). Production would use PayPal-held balances, a licensed partner, or PayPal's platform products.

---

## 11. Environment variables

```
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=                # public (VITE_/NEXT_PUBLIC_ prefix per stack)
PAYPAL_CLIENT_SECRET=            # server only
PAYPAL_WEBHOOK_ID=               # from Developer Dashboard → app → webhooks
AI_GATEWAY_API_KEY=              # or ANTHROPIC_API_KEY
FX_RATES_API_URL=                # mid-market source for estimates (decision pending)
CHANNEL3_API_KEY=                # stretch
SUPABASE_URL= / SUPABASE_ANON_KEY= / SUPABASE_SERVICE_ROLE_KEY=   # service role server only
```

---

## 12. Sandbox setup and test plan

**Accounts** (Developer Dashboard → Testing Tools → Sandbox Accounts):

| Account | Type | Country | Role |
|---|---|---|---|
| Thought | Business | US | Merchant + payout sender. Set auto-convert to USD; fund it for payouts. |
| Grandma Chen | Personal | Taiwan | Payer (TWD) |
| Grandpa Kenji | Personal | Japan | Payer (JPY) |
| Mamie Claire | Personal | France | Payer (EUR) |
| Lin | Personal | US | Payout receiver |

**Day-1 checks**
1. Can TW and JP personal accounts approve an order in TWD/JPY from a US business account?
2. Does the capture include `seller_receivable_breakdown.exchange_rate`?
3. Do payouts to `recipient_wallet: Venmo` work in sandbox?
4. Does guest card checkout appear for TW/JP buyers?
5. Do PayPal's MCP gift-card tools respond with `commerce:true`?

**Unhappy paths to test:**
- Cancel the popup.
- `INSTRUMENT_DECLINED`.
- Duplicate submit (idempotency).
- Webhook arriving before the capture response.
- Expired quote.
- Payout failure.
- Refund after a partial goal.

**Proof for judges:** screenshots of the Developer Dashboard event logs (orders, captures in TWD/JPY, payouts) in the README and video.

---

## 13. Milestones

| Day | Deliverable | Done when |
|---|---|---|
| Fri 6 | Project + DB schema + seed catalog (prices checked) + i18n shell | All 3 languages render the grandparent home |
| Sat 7 | Quote engine + Orders create/capture in TWD/JPY/EUR + webhook → ledger | A sandbox NT$3,000 payment shows the estimated and actual receipt |
| Sun 8 | Agent + rules engine + translation | The concierge suggests 3 gifts in each language; eval prompts pass |
| Mon 9 | Gift goals + payouts + parent approvals + scam guard | Two grandparents fund a goal → the parent receives an earmarked payout |
| Tue 10 | Child wallet + envelope + allowance + polish | Hero flow end to end |
| Wed 11 | Unhappy paths, README with judge credentials, MIT license, video | A stranger can run it from the README |
| Thu 12 | Submit by 10 AM PT | |

**Cut order if late:** Channel3 items → allowance → voice (fall back to text) → envelope animation.
**Never cut:** the gift goal, the fee receipt, PayPal pay, payout, child wallet.

---

## 14. Open items

| Item | Status |
|---|---|
| Lovable vs Next.js | Waiting on which Lovable hackathon |
| AI key source | Your choice: AI Gateway or Anthropic |
| FX rate API for estimates | Pick one that covers TWD |
| Fees | ✅ Confirmed (§5.1). EUR €0.39 to eyeball on the page. |
| Sandbox: TW/JP payers, auto-convert breakdown, guest card, Venmo payouts, MCP gift-card tools | Day-1 checks ([PAYPAL-FEASIBILITY.md](PAYPAL-FEASIBILITY.md)) |
| Catalog prices | Found: Exploratorium $239/$339, Cal Academy $329/$419, SF Zoo $199/$239, Bay Area Discovery Museum $229 ([COMPETITORS.md](COMPETITORS.md)). Re-check before recording. |
| Pay Later for Paris grandma | ❌ Not available cross-border. Removed from Flow D. |
