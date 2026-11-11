# MVP and story: "Grandma got you Saturday"

*v2 · Nov 5, 2026 · Updated after the critical market review. The PRD's build order follows this.*

---

## The story

> *When Grandma lives 6,500 miles away, she can't take Mei to the movies on Saturday. Thought lets her do it anyway: she picks it in Chinese, pays in her own currency through PayPal, and Mei hears her voice when the ticket arrives.*

**What changed from v1:** we stopped leading with money and fees. Thought turns a grandparent's money into the **care she'd give in person** (a movie, a family dinner, a museum day), chosen by her, in her language, for this child, this month. Nothing ships.

### Why it has to exist

**1. Grandparents abroad are locked out.**
- Greenlight: "the sender must have a U.S.-based billing address."
- Ugift 529 gifting: US residents only.
- WeChat red packets don't reach US users.

Every US tool for giving to a child shuts out the grandparent who lives abroad.

**2. Distance turns grandparents into a face on a screen.** 阿嬤 (Grandma) flies from Taipei, holds Mei for six months, then goes home. Between visits she can't take Mei anywhere. Giving the outing she'd have given in person is how she keeps showing up.

**3. Lists and boxes don't feel like love.**
- Parents call Amazon wish lists "completely impersonal."
- Grandparents ignore lists, or buy "something random and ship it."
- Mailing from abroad costs $40 a box, or more in brokerage fees.

Parents keep asking for experiences, memberships and time together instead.

**4. The language gap runs both ways.** Grandma can't read the US apps. Mei, growing up in English, may not understand Grandma's Mandarin. Voice notes with captions in both directions mean they actually hear each other. The gift is the reason to talk.

**5. Trust is what lets them say yes.** Reported fraud losses for people 60+ hit $2.4B in 2024. Money only goes to Mei's family, every fee is shown, and PayPal's name sits on every money moment.

### Messaging order (video, Devpost, SheBuilds)

1. **Showing up.** The care she'd give in person: not cash, not a box.
2. **The lockout.** Show the "U.S.-based billing address" line, then show Grandma in Taipei succeeding.
3. **Two grandparents, two currencies, one Saturday.** The most novel moment.
4. **The loop.** Voices both ways, and the photo from the movie afterwards.
5. **Honest costs.** Every fee shown. *"Use Wise for cash. Use Thought when cash isn't the gift."*

**What we don't claim:** that we're cheaper than Wise for sending cash (we're not), or that we know the size of this exact market (no public data exists; we say so and show what families told us).

---

## The MVP: one Saturday, end to end

**Hero gift:** "Saturday at the movies with Mom" (a $100 Regal gift card), pooled by Grandma Chen (Taipei, TWD) and Grandpa Kenji (Tokyo, JPY).
**Second gift:** a Saturday at the Exploratorium (family membership $239), shown as a goal we fulfill by hand, clearly labeled.

| Step | Who | What they see | Behind it |
|---|---|---|---|
| 1 | Lin (parent) | Adds two hints: "Mei loves dinosaur movies", "Saturdays work" | Hints, not a wish list |
| 2 | Grandma Chen | Opens Lin's LINE invite in 繁體中文 (Traditional Chinese); one code to sign in | Language and currency come from the invite |
| 3 | Grandma Chen | Home: Mei's face, one button 送禮物 ("Send a gift") | |
| 4 | Grandma Chen | Asks in Chinese; gets 3 care gifts for Mei this month, each explained in Chinese | AI concierge reads Lin's hints and the catalog |
| 5 | Grandma Chen | Picks "Saturday movie with Mom"; pays NT$3,000; sees the cost receipt (family receives ≈ $85.97); records a voice note | PayPal Checkout in TWD; fee engine |
| 6 | Grandpa Kenji | Gets a note in Japanese ("Mei's movie is 86% there"), adds ¥3,000, the usual お年玉 for a 6-year-old (≈ $18.11); the $100 goal is reached | PayPal Checkout in JPY |
| 7 | Lin | One tap: "Yes, this Saturday" | Parent hint, not a veto |
| 8 | Thought | The AI agent buys the Regal card through PayPal | Agentic purchase (or a labeled simulation, see Day-1 spike) |
| 9 | Mei | "From 阿嬤 and おじいちゃん: Saturday at the movies", both voices with English captions | Child view |
| 10 | Lin and Mei | After the movie: a photo and Mei's thank-you, translated into Chinese and Japanese | Thank-you loop |

**The math (demo rates 1 USD = NT$32 = ¥150; PayPal sets the real rate):**

| Who | Pays | PayPal fees | Conversion | Family receives |
|---|---|---|---|---|
| 阿嬤 Chen | NT$3,000 | NT$164 | $2.66 | ≈ $85.97 |
| おじいちゃん Kenji | ¥3,000 | ¥199 | $0.56 | ≈ $18.11 |
| **Together** | | | | **≈ $104.08** (goal $100) |

The extra ≈ $4 stays on the gift (popcorn). Earlier drafts used NT$1,600 + ¥2,000, which only reaches ≈ $57.62.

### Two PayPal moments
1. **Money in:** each grandparent pays in their own currency through PayPal Checkout, with the receipt showing PayPal's real fee and rate. *Confirmed possible.*
2. **Money out:** Thought's AI agent buys the US gift card through PayPal. *Must be tested on Day 1.*

### The parent's role: three taps, never a veto
- "We already have this"
- "Yes, this month"
- "Pick a Saturday"

The grandparent still chooses. The parent only adds reality.

### Care catalog (6 gifts)

| Gift | Fulfillment |
|---|---|
| Saturday at the movies (Regal $100) | Agent buys a gift card via PayPal |
| Family dinner night (Benihana $100 or Grubhub $25) | Agent buys a gift card via PayPal |
| An adventure day (iFLY $50) | Agent buys a gift card via PayPal |
| A Saturday at the Exploratorium (family membership $239) | Goal, fulfilled by hand, labeled |
| A Saturday at the SF Zoo (family membership $199) | Goal, fulfilled by hand, labeled |
| 紅包 red envelope (Lunar New Year) | Cash moment in Mei's wallet (if time) |

Card brands come from PayPal's sandbox gift-card demo store. Re-check prices before recording.

**Cut:** shipped items, baby registry, open prepaid cards, any address flow, allowance, payouts.

---

## Day-1 spikes (decide the build on Nov 6)

| # | Test | If yes | If no |
|---|---|---|---|
| 1 | A Taiwan sandbox account pays a TWD order to our US business account, and the capture returns the fee and exchange rate | Hero flow as planned | Fall back to USD orders and show PayPal's conversion |
| 2 | Our agent can call PayPal's gift-card tools (the WebMCP demo store's `shopping.*` tools, or the MCP server with `commerce:true`) and get a sandbox card | The agent buys the Regal card live in the demo | Simulate the purchase and label it "simulated in sandbox" |
| 3 | A grandparent with no PayPal account can pay by card as a guest from Taiwan or Japan | One-step checkout | Add a "create a PayPal account" step to the invite flow |
| 4 | "Log in with PayPal" works easily in sandbox | Offer it as sign-in | Keep the one-time code |

---

## PayPal accounts: who needs what

| Who | Account needed | Notes |
|---|---|---|
| Grandparent in Taiwan, Japan or France | Their **own country's** PayPal account, or a card as guest (to test) | No US account or citizenship needed. PayPal accounts follow where you live; 200+ countries. |
| Thought | A **US business** account | Receives payments; buys US gift cards (PayPal Digital Gifts requires a US account); sends any refunds |
| Parent | None for the MVP | Payouts are cut from the MVP |

- **Japan:** paying a merchant is fine, but sending money to a person needs extra identity checks. That's one more reason Grandma pays Thought, not her daughter.
- **Taiwan:** card payments work as normal. Taiwanese bank linking is limited, which doesn't affect paying us.

---

## Roadmap slide (not built)

- **PayPal World:** Weixin Pay (WeChat) users in mainland China can already pay US PayPal merchants. That reaches the largest Chinese-speaking grandparent group, whose red packets can't reach the US today.
- **Rate lock (FXaaS):** quote the exact rate before payment instead of an estimate.
- **Multiparty:** pay families directly without Thought holding funds.
- **Venue partnerships:** memberships and classes bought directly, not by hand.

---

## Evidence to gather before Nov 12

A 10–20 person survey of your own network (Taiwan, Japan and France families, plus your neighbors):
- How do grandparents give today?
- What goes wrong?
- Would they give a Saturday instead of a box?

No public number exists for this exact group, so first-hand answers are the strongest proof. (Survey draft: next step if you want it.)

---

## What exists today (short version)

| What they do | Who | What's missing |
|---|---|---|
| Kids' cards and 529 gifting | Greenlight, Ugift, Venmo Teen, Apple Cash | US senders only |
| Cash across borders | Wise, Remitly, Xoom | Cheap and clear, but cash only. Xoom and Remitly don't serve senders in Taiwan; Wise from Taiwan means paying in USD. |
| Wish lists and registries | Amazon, Babylist | Great logistics, but "completely impersonal", English-only, and ship boxes |
| Group money | PayPal Pools | No gift, no child, fees only described as "international fees apply" |
| AI gift finders | Etsy Gift Mode, Amazon, GiftList and many more | Crowded, and almost all return products to ship |
| Experience gift cards | Little Starts (UK), Sawyer, ExperienceGifts | Not built for a grandparent abroad or for two senders |
| Staying connected | Caribu, Gramms, Aura frames | Connection only, no giving |

Full detail: the "Market research: grandparents gifting (critical review)" page in Notion, plus COMPETITORS.md.
