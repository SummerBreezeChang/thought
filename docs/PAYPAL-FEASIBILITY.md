# Can PayPal do it? Feasibility check

*Nov 5, 2026 · Every row is checked against PayPal docs, fee pages or policy. Feeds [TECH-SPEC.md](TECH-SPEC.md).*

| # | Question | Verdict | Evidence | What it means for us |
|---|---|---|---|---|
| 1 | Can a US merchant charge buyers in TWD and JPY? | ✅ Confirmed | [Currency codes](https://developer.paypal.com/reference/currency-codes) (Aug 2026) list TWD and JPY as zero-decimal. The in-country-only rule covers BRL, CNY and MYR, not TWD. | List gifts in the grandparent's currency, in whole numbers. Turn on auto-convert, or payments sit as "pending" until approved by hand. |
| 2 | Does PayPal tell us the real fee and exchange rate? | ✅ Confirmed | `seller_receivable_breakdown`: `paypal_fee`, `net_amount`, `receivable_amount`, `exchange_rate` ([model](https://developer.paypal.com/serversdk/php/models/structures/seller-receivable-breakdown), [FX guide](https://developer.paypal.com/v5/checkout/fx/integrate)). Without auto-convert: `PENDING` / `RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION`. | The after-payment receipt is built entirely from PayPal's own numbers. Rate fields appear only when a conversion happens; test on Day 1. |
| 3 | Can we get or lock an exchange rate before payment? | ⚠️ Exists, needs a contract | `POST /v2/pricing/quote-exchange-rates` returns `fx_id`, rate and expiry, and can lock the rate on the order ([API](https://developer.paypal.com/api/pricing/v2)). Needs an FXaaS contract ([eligibility](https://developer.paypal.com/foreign-exchange-as-a-service)). | Pre-payment numbers are **estimates** from a public rate plus PayPal's published spread. The pitch names the rate lock as the production upgrade. |
| 4 | Exact fees | ✅ Confirmed | [Fee page](https://www.paypal.com/us/business/paypal-business-fees): 3.49% + fixed; +1.50% international; fixed TWD 14 / JPY 49 / EUR 0.39 (EUR to be eyeballed); conversion 4% (buyer pays in an unlisted currency) or 3% (other conversions, i.e. ours); Payouts US 2% capped at $1, international 2% capped at $20; refunds free, but **original fees are not returned**. | Cost receipt rates are confirmed. Refunds lose the fee, so Thought absorbs that and says so. |
| 5 | Payouts and Venmo | ⚠️ Partly | `recipient_wallet: "Venmo"`, US/USD only ([Venmo payouts](https://developer.paypal.com/payouts/use-payouts/venmo)). Live use needs access approval; sandbox testing is allowed ([overview](https://developer.paypal.com/payouts/use-payouts/overview)). | Demo shows the batch status and the business account debit, not a Venmo inbox. |
| 6 | PayPal World (local wallets) | ⚠️ Live, but not for TW/JP | Weixin Pay (China) and UPI (India) users can pay US PayPal merchants ([paypalworld.com](https://www.paypalworld.com/us/home)). No LINE Pay, JKOPay or PayPay. | Roadmap line: "a grandmother in Shanghai pays with Weixin Pay." Not a demo feature. |
| 7 | Gift cards | ⚠️ Partly | PayPal Digital Gifts store exists. PayPal's **remote MCP server** has gift-card commerce tools (`search_product`, `create_cart`, `checkout_cart`) behind `x-feature-flags: commerce:true` ([agent tools](https://developer.paypal.com/ai-tools/agent-tools)). | **An AI agent could buy a DoorDash or UrbanSitter gift card as fulfillment.** Strong "agentic commerce" angle. Test it in sandbox before promising it. |
| 8 | Multiparty (pay parents directly, platform fee) | ⚠️ Sandbox only until approved | Approved partners only for live use; testable in sandbox ([platforms](https://developer.paypal.com/platforms/get-started)). | Avoids holding funds, but it's built for sellers and is too heavy for 7 days. Roadmap item. |
| 9 | Pay Later / Fastlane for grandparents abroad | ❌ No | Pay Later is domestic only ([overview](https://developer.paypal.com/pay-later/overview)); Fastlane is US only. Guest card checkout from TW/JP: untested. | Drop Pay Later from the Paris flow. Check guest card checkout with a JP/TW sandbox buyer. |
| 10 | Agent toolkit | ✅ Confirmed, no payouts | Orders, refunds, tracking, subscriptions, invoices, disputes, reporting ([agent tools](https://developer.paypal.com/ai-tools/agent-tools), Oct 29 2026). `@paypal/agent-toolkit` 1.11.0, `@paypal/mcp` 1.8.1. | Payouts go through our own REST call. Create orders through REST (zero-decimal handling); use toolkit tools for status, refunds and tracking. |
| 11 | Is pooling money allowed? | 🚩 Policy risk | [Acceptable Use Policy](https://www.paypal.com/us/legalhub/paypal/acceptableuse-full) (Nov 4 2026): "Payment Facilitator" (money service business, escrow) needs **pre-approval**. Accounts can be held up to 180 days. | Fine in sandbox. **In production, each contribution must buy a specific gift that Thought fulfills as merchant of record.** Cash payouts to parents become the exception (refunds/credits) or move to Multiparty. |

---

## Revised money flow

1. **Estimate.** The gift is listed in TWD/JPY/EUR. The receipt shows 3.49% + 1.50% + fixed fee, 3% conversion and the estimated USD, labelled "estimate; PayPal sets the final rate."
2. **Pay.** Orders v2 in the buyer's currency (integers for TWD/JPY); the sandbox merchant auto-converts to USD.
3. **Actual receipt.** Built from `seller_receivable_breakdown` and stored per contribution.
4. **Fulfill when the goal is funded:**
   - **(a) Primary: Thought buys the gift as merchant of record.**
     - Gift cards (DoorDash, UrbanSitter, ActivityHero, an Exploratorium "any amount" gift) are bought by the AI agent through PayPal's MCP gift-card tools if they work in sandbox. Otherwise fulfillment is simulated.
     - Physical items are shipped, with `create_shipment_tracking`.
   - **(b) Shown, with a clear flag: earmarked payout** to the parent (2%, capped at $1), noting that production needs PayPal approval.
5. **Refund** via `create_refund`. The contributor gets their full amount back; Thought absorbs the fee PayPal keeps.
6. **Roadmap:** FXaaS rate lock, Multiparty to pay parents directly, PayPal World wallets (China/India today).

## Day-1 sandbox tests

1. A JP and a TW personal account can pay a TWD/JPY order to a US business.
2. The capture shows `exchange_rate` and `receivable_amount` with auto-convert on.
3. Guest card checkout appears for TW/JP buyers.
4. A Venmo payout batch succeeds.
5. The MCP gift-card tools respond with `commerce:true` in sandbox.
6. `POST /v2/pricing/quote-exchange-rates` (expect an authorization error).
