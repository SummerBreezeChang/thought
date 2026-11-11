# Grandparent Gifting × PayPal AI Hackathon: Research Brief

*Prepared Nov 5, 2026. Working name: **"Hóngbāo Bridge"** (placeholder, rename freely)*

---

## 0. TL;DR

- **The idea fits the hackathon very well.** It matches 4 of the 5 inspiration themes PayPal listed: *Money Movement*, *Consumer Experiences* ("a simpler checkout flow for a niche audience (students, families, seniors) that PayPal doesn't fully serve today"), *Social Impact* ("multi-language") and *AI Agents*. That quote is almost exactly your user.
- **No existing product combines all five pieces:**
  1. A sender abroad
  2. A wallet the kid can see
  3. A UI in the grandparent's own language
  4. Gift shopping
  5. Cultural rituals (red envelopes, otoshidama)

  Kid-wallet apps block foreign senders. Remittance apps have no kid view and no ritual. Red-envelope apps only work inside one country.
- **Taiwan → US is the corridor nobody serves.** Xoom and Remitly don't list Taiwan as a sender country, and Wise doesn't support TWD as a source currency. PayPal *does* work in Taiwan. That's your "why PayPal" story.
- **⏰ Deadline: Thu Nov 12, 2026, 12:00 PM Pacific** (the official rules govern; the webinar said 2 PM, so plan for noon). That leaves **7 days**. Scope hard.
- **Prizes to aim for:** a Grand Prize, plus *Most Impactful*, *Best Use of Agentic Commerce* or *Best Use of PayPal + AI* (honorable mentions are $5K each). Add **Channel3** ($1,500 sponsor prize) for the gift shop. You can win one grand or honorable-mention prize **plus** one sponsor prize.

---

## 1. What the hackathon actually requires

Source: [paypalaihackathon.devpost.com](https://paypalaihackathon.devpost.com/), [Rules](https://paypalaihackathon.devpost.com/rules), [Resources](https://paypalaihackathon.devpost.com/resources), Oct 6 webinar ([YouTube](https://www.youtube.com/watch?v=FFJfCW9z3Do))

**The one hard rule:** the project must *meaningfully* use **PayPal (sandbox)** and **AI**. In the webinar, PayPal's Jo Franchetti put it this way: *"adding a PayPal button to an unrelated app is not going to be enough… PayPal should be central to what your project does."*
→ Here money movement *is* the product, so this is easy to meet.

**Submission checklist**
- [ ] Working build. Judges must be able to run it: a hosted URL **or** full setup instructions in the README. Mockups fail.
- [ ] **Public GitHub repo with an OSS license** shown in the repo's About section (MIT is fine)
- [ ] **Demo video under 3 min**, public on YouTube, no copyrighted music
- [ ] Text description, elevator pitch, project story, and the list of AI tools with how each was used
- [ ] Sandbox test credentials in the README so judges can log in as "Grandma in Taipei"
- [ ] Everything in English, or with English translations. The demo will show Chinese, Japanese and French UI, so add English subtitles or captions.

**Judging:** five criteria, equally weighted, after a pass/fail viability check.

| Criterion | What it means for us |
|---|---|
| Technological Implementation | Real Orders v2 + Payouts + Subscriptions + webhooks + an AI agent with tools. Non-trivial. |
| Design | One complete product: grandparent app, kid wallet and parent approval, not a proof of concept |
| Potential Impact | *"credible, specific case for a real problem for a real audience"*. Use the stats in §4. |
| Innovation | The ritual-aware AI and the closed loop to the grandchild are new (§5) |
| Presentation | A fifth of the score, and **Best Demo Delivery is its own $5K prize**. The story sells itself. |

**Webinar tips worth following**
- Start from the problem, then map it to PayPal capabilities (Marco Podien). That is what you're doing.
- Test the *unhappy paths* (declined payment, cancel) using sandbox negative testing.
- PayPal has an **Agentic Commerce** workspace in its Postman collection (postman.com/paypal).
- The **PayPal AI-Toolkit** plugin works inside Claude Code (`/paypal:setup`, `/paypal:sandbox`, `/paypal:test-accounts`), so we can use it while building.
- Ask questions on the PayPal Discord: https://discord.gg/sJ2G6DyvSK

---

## 2. Lessons from past winners

This hackathon's project gallery isn't published yet, so I studied [past PayPal winners on Devpost](https://devpost.com/software/built-with/paypal?query=is%3Awinner) and [Tensor Hack's data on 735 winners](https://tensorhack.com/guides/what-wins-hackathons).

**Closest recent winner: [Babes & Babies](https://devpost.com/software/babes-babies-ai-shopping-assistant-with-paypal).** It's a baby-products shop in Nigeria whose AI assistant speaks **English or Pidgin**, fills the cart, and checks out with PayPal Orders v2.

What won it the prize, and what we should copy:
- **A real person and a real place:** "my shop, my customers, they talk like this." Your SF neighbor's parents are that story.
- **A local language as the hook.** That's the same idea as our grandparent who doesn't speak English.
- **"Keep the AI's job small."** The AI picks what the customer meant; *code* sets prices and totals. It even showed the AI refusing a "$0.01 price" trick. We should demo something similar: the AI can't send money to anyone except the verified grandchild.
- **The AI never takes payment by itself.** The human approves in the PayPal popup.
- **Screenshots of the PayPal sandbox dashboard API calls as evidence.** Judges like seeing proof of a real integration.
- An AG Grid owner dashboard picked up a sponsor prize as well.

**Patterns across winners:** 80% link a repo, 80% have a video, 55% are AI projects, and 25% won solo, so solo is viable.

**Our difference:** Babes & Babies is one merchant in one country. Ours is **cross-border, multi-party (grandparent, parent, child), multi-currency and ritual-aware.**

---

## 3. The story: need, user and moment

**The scene (your neighbor):** a grandmother from Taipei is in San Francisco on a 6-month visitor visa helping with the new baby. She doesn't speak English. She wants to buy diapers or a toy and to give a 紅包 (red envelope) for the baby's first Lunar New Year. She has no US bank account and can't use the family's US apps. When she flies home, she still wants to be part of every birthday.

**Who the users are:**

| Role | Lives | Needs |
|---|---|---|
| **Grandparent (sender)** | Taiwan, Japan or France, or visiting SF | Their own language, big simple UI, ritual-correct gifting, confidence the money reached *the grandchild* and not a scammer |
| **Parent (guardian)** | San Francisco | Approve and see all gifts, cash out to Venmo or PayPal, manage the kid's wishlist |
| **Grandchild** | San Francisco | A wallet that *shows love*: "Grandma sent you NT$1,200 = $38 🧧", a voice note, a gift arriving |

**Moments that matter:** Lunar New Year (Jan/Feb), Japanese New Year / お年玉 (Jan 1), Christmas, birthdays, the first day of school, report cards, a visiting grandparent's farewell.

---

## 4. Evidence for "Potential Impact"

Every number is linked. These are the numbers for the pitch.

**Audience size**
- **26% of the 69.1M US children** live with an immigrant parent; **45% in California (3.6M kids)** ([MPI](https://www.migrationpolicy.org/journal/spotlight/frequently-requested-statistics-immigrants-and-immigration-united-states))
- The Bay Area has **2M+ Asian and Pacific Islander residents (27%)**, and **64% are foreign-born** ([Bay Area Equity Atlas](https://www.bayareaequityatlas.org/research/analyses/asian-and-pacific-islander-population-bay-area-large-and-diverse-and-fueling)). Chinese and Taiwanese are over 60% of SF's Asian residents ([SF Chronicle](https://www.sfchronicle.com/projects/2022/san-francisco-asian-population/))

**Willingness to give**
- US grandparents give **$172B/year** directly, **90% give money**, averaging **$2,654/year**. **76%** use tech as a primary way to stay connected ([AARP, Jun 2026](https://www.aarp.org/press/releases/2026-06-15-grandparents-study.html))
- *Gap we found:* there is **no data on grandparents abroad giving to US grandchildren**. Pitch it as an invisible, unmeasured flow.

**Language barrier**
- Only **46% of Chinese immigrants** in the US are English-proficient, against 92% of the US-born ([Pew](https://www.pewresearch.org/race-and-ethnicity/fact-sheet/asian-americans-chinese-in-the-u-s/))

**Cost**
- Sending $200 averages **6.36%** in fees, against a UN target of 3% ([World Bank RPW](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf))
- A $50 gift through consumer PayPal P2P can lose around 9% to fees and FX ([PayPal fees](https://www.paypal.com/us/digital-wallet/paypal-consumer-fees), [Tipalti](https://tipalti.com/blog/paypal-international-transaction-fees/))

**Elder scams**
- Reported fraud losses for people 60+ went from **$600M (2020) to $2.4B (2024)**. The FTC estimates the true cost at **$10–81B** ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults))
- → A **closed loop** that can only pay a verified grandchild is a safety feature.

---

## 5. Competitive landscape

| Product | Sender abroad? | Grandparent's language | Kid view | Video / voice message | Buys items | Rituals |
|---|---|---|---|---|---|---|
| Greenlight | ❌ US billing address required ([source](https://help.greenlight.com/hc/en-us/articles/10257522661659-Can-friends-or-family-send-money-to-my-child-s-Greenlight-account)) | ❌ | ✅ | ~ | ❌ | ❌ |
| GoHenry / Acorns Early | ? Giftlinks; foreign cards unverified | ❌ | ✅ | thank-you note | ❌ | ❌ |
| BusyKid / Step | ? / ❌ no gift links | ❌ | ✅ | ❌ | ❌ | ❌ |
| Venmo Teen (PayPal) | ❌ US-only, ages 13+ | ❌ | ✅ teens | notes | ✅ | ❌ |
| Apple Cash Family | ❌ US residents only ([source](https://support.apple.com/en-us/105010)) | ✅ | ✅ | iMessage | ❌ | ❌ |
| Ugift / Backer (529 plans) | ? | ❌ | ❌ | greeting | ❌ | ❌ |
| EarlyBird (video gift "memories") | — **shut down** after Acorns bought it in 2025 ([source](https://techcrunch.com/2025/05/15/acorns-acquires-family-wealth-and-digital-memory-platform-earlybird/)) | | | ✅ | | |
| Xoom (PayPal) / Remitly / Wise | ⚠️ **Taiwan not supported** as a sender ([Xoom](https://www.xoom.com/united-states/send-money?locale=en-US), [Remitly](https://www.remitly.com/us/en), [Wise](https://wise.com/help/articles/2571907/what-currencies-can-i-send-to-and-from)) | ✅ | ❌ | ❌ | ❌ | ❌ |
| LINE Pay / JKOPay / PayPay / WeChat red envelopes | ❌ domestic only | ✅ | ❌ | ✅ | ❌ | ✅ |
| Amazon international / Rakuten | ✅ | ✅ | ❌ | gift note | ✅ | ❌ |

→ **The empty space:** cross-border sender + kid wallet + localized grandparent UX + gift shopping + ritual intelligence + scam-safe closed loop.

Copper, a teen banking app, collapsed with Synapse in 2024 ([TechCrunch](https://techcrunch.com/2024/05/21/teen-fintech-copper-had-to-emergency-discontinue-its-banking-debit-products/)). That's a good argument for building on a trusted network like PayPal rather than banking-as-a-service middleware.

---

## 6. Problems to solve, and where AI does real work

| Problem | Feature | AI's role |
|---|---|---|
| Language barrier | The whole grandparent UI is in 繁中 / 日本語 / Français. **Voice-first:** "幫我給小美一個生日紅包" ("give Mei a birthday red envelope for me") | Speech to intent; the agent fills the gift; it translates the message for the child (and the child's reply back) |
| "How much is proper?" | **Ritual-aware amounts:** even numbers with 6s and 8s, no 4s ([source](https://studycli.org/chinese-culture/hongbao/)); otoshidama by age (~¥1,000 for preschoolers, ¥2,000–3,000 for elementary, ¥5,000–10,000 for teens); Taiwan 2026 norm NT$600–1,200 ([SinoPac](https://www.sinotrade.com.tw/richclub/Financialfreedom/-2026-%E7%B4%85%E5%8C%85%E8%A1%8C%E6%83%85%E6%94%BB%E7%95%A5-%E7%B4%85%E5%8C%85%E6%80%8E%E9%BA%BC%E5%8C%85-%E5%8C%85%E4%BD%A0%E4%B8%8D%E5%A4%B1%E7%A6%AE--63abb323785d805c5077ee93)) | Suggests a culturally right amount, and can round so the gift *lands* as a lucky number ($88, not $87.43) |
| "What should I buy?" | **Gift concierge:** "she's 6, loves dinosaurs, budget ¥5,000" → 3 options shipped to SF | Agent calls **Channel3** (age filter, interests, price cap) and explains the picks in the grandparent's language |
| FX confusion | Shows the gift in both currencies (NT$1,200 ≈ $38) | Agent explains the conversion |
| Scams / wrong recipient | **Closed loop:** money can only go to the verified grandchild's wallet. The parent approves new family members. | Agent refuses off-platform payment requests and flags suspicious messages. (This is our version of Babes & Babies' "AI refuses the $0.01 price.") |
| Kid doesn't feel the love | **Kid wallet:** an animated envelope to "open", Grandma's voice note with English captions, balance and savings goals | Turns the voice note into a caption; suggests an age-appropriate thank-you |
| Forgetting dates across time zones | Holiday and birthday calendar; monthly allowance | Agent reminds the grandparent in their language and proposes a plan |
| Visiting grandparent buying in SF | Buy diapers or toys with a home-country PayPal account, delivered to the family's address | Same concierge, local delivery |

---

## 7. PayPal technical fit (verified against the docs)

**Key design decision: our app is the merchant.** The grandparent pays *the app* through **Orders v2**. This avoids the friends-and-family limits on Japanese PayPal accounts (person-to-person sends there need a KYC "premier" upgrade, per [PayPal JP user agreement](https://www.paypal.com/jp/legalhub/paypal/useragreement-full)). PayPal converts JPY, TWD and EUR to USD. The app keeps a ledger for the child, and the parent cashes out through **Payouts** to Venmo or PayPal.

| Flow | PayPal API | AI |
|---|---|---|
| Red envelope / cash gift | Orders v2 + JS SDK v6 button with `locale: zh-TW / ja-JP / fr-FR`; `PAYMENT.CAPTURE.COMPLETED` webhook | Voice intent → amount + message; ritual check; translation |
| Buy a gift shipped to SF | Orders v2 with `shipping` + items → `create_shipment_tracking` | Channel3 search + ranking, explained in the grandparent's language |
| Monthly allowance | Subscriptions API (create a plan, subscribe) | Agent proposes the plan and sends reminders |
| Parent cash-out | **Payouts** (`recipient_wallet: "Venmo"` or a PayPal email) | Agent summary and spending insight |
| "Where's my gift?" / refunds | `get_order`, shipment tracking, `create_refund` | Agent answers in the grandparent's language |

**Tooling**
- [`@paypal/agent-toolkit`](https://github.com/paypal/agent-toolkit) has 43 tools (orders, subscriptions, invoices, shipment tracking, refunds, disputes) and works with the Vercel AI SDK, LangChain, OpenAI Agents and MCP. **Payouts is not included**, so we wrap it as our own tool.
- **Agentic Commerce angle:** PayPal's "Store Sync" and "Agent Ready" exist but are gated with no sandbox. We can shape our gift agent's cart like PayPal's cart schema (states CREATED → READY → COMPLETED) and say so in the pitch ([docs](https://docs.paypal.ai/growth/agentic-commerce/cart-orchestration-integration)).
- **Channel3** returns products with buy links only; its checkout is "coming soon". So the app must be the merchant of record: we charge through PayPal and simulate fulfillment. Use promo code `PAYPAL-HACKATHON-2026` for 20K free credits. Its `language` setting doesn't support ja or zh, so we translate the request to English first.

**Gotchas**
- **TWD and JPY have no decimals.** Send whole numbers.
- **Venmo's checkout button and payouts are US-only.** That's fine: the grandparent pays with PayPal, and the parent cashes out to Venmo.
- **Pay Later** is offered to French buyers, not Japanese or Taiwanese ones.

**Verify on Day 1**
1. Can sandbox create **TW / JP / FR personal accounts**, and can they pay a US merchant?
2. Do Venmo payouts work in sandbox? If not, fall back to a payout to a PayPal email.
3. Set the business account's payment-receiving preferences so JPY and TWD payments don't sit "pending".

---

## 8. Live demo plan: SF as the hub

**Three sandbox grandparents and one family:**
- 🇹🇼 **阿嬤 (Grandma) in Taipei:** zh-TW voice gift, a Lunar New Year 紅包 of NT$1,200 → the kid sees $38 and an animated envelope. *(Hero flow)*
- 🇯🇵 **おじいちゃん (Grandpa) in Tokyo:** otoshidama with an age-based amount suggestion, plus a ¥5,000 dinosaur toy from Channel3 shipped to SF
- 🇫🇷 **Mamie (Grandma) in Paris:** a €20/month allowance subscription (Pay Later available here)
- 🇺🇸 **Parent in SF:** approves, sees all gifts, cashes out to Venmo. **Kid (Mei, 6)** opens envelopes, plays voice notes, picks a wishlist item.

**3-minute video arc:**
1. **0:00–0:25:** The neighbor story. A grandma in SF who can't read the English apps.
2. **0:25–1:30:** The Taipei grandma speaks in Mandarin → the AI suggests a lucky amount → PayPal sandbox checkout in zh-TW → the kid's phone lights up with the envelope and her voice note in English.
3. **1:30–2:10:** The Tokyo gift concierge (Channel3) → order + tracking. The Paris allowance.
4. **2:10–2:40:** The parent's dashboard and Venmo payout. The scam guard refusing an "send money to this new account" request.
5. **2:40–3:00:** The impact numbers and why PayPal (the Taiwan corridor gap).

Show the PayPal sandbox API logs on screen as proof, like Babes & Babies did.

---

## 9. Suggested 7-day plan (Nov 5 → Nov 12, noon PT)

| Day | Build |
|---|---|
| **Thu 5** | Research ✅. Register on Devpost, PayPal developer account, sandbox accounts (US business + TW/JP/FR personal), Channel3 key |
| **Fri 6** | Next.js scaffold, i18n (zh-TW/ja/fr/en), v6 checkout in sandbox, create and capture an order, webhook |
| **Sat 7** | AI gift agent (voice → intent, ritual amounts, translation) using the PayPal agent toolkit as tools |
| **Sun 8** | Channel3 gift concierge → order with shipping + tracking; kid wallet ledger |
| **Mon 9** | Subscriptions (allowance) + Payouts (parent cash-out) + scam guard |
| **Tue 10** | Kid wallet UI (envelope animation, voice-note captions), parent dashboard, polish |
| **Wed 11** | Deploy, README with judge credentials, MIT license, record the video |
| **Thu 12** | Submit by **10 AM PT** (2-hour buffer) |

---

## 10. Risks and honest caveats

- **Holding money for kids is money transmission** in real life. Frame production as "PayPal-held balances / a licensed partner"; in the hackathon this is all sandbox.
- **Venmo Teen has no API.** We build our own kid wallet view and mention Venmo Teen as the future path.
- **Xoom has no public API.** Use it only as a contrast in the pitch: "Xoom sends cash. We send a moment."
- **US tax** (Form 3520) only applies to gifts from foreign persons over $100K a year, so it doesn't matter here.
- **Not yet verified:** whether GoHenry, Backer or Ugift accept foreign cards; inbound-to-US coverage for Western Union and WorldRemit; how many grandparents come on visitor visas to provide childcare (academic studies exist, but no count).
