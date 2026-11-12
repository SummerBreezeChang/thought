# Lovable starter kit (SheBuilds + PayPal)

*Nov 5, 2026 · One codebase for both hackathons: started in Lovable, synced to GitHub, PayPal and AI parts built locally with Claude Code.*

---

## 1. Timeline: two events, one build

| Date | SheBuilds | PayPal AI Hackathon | What we do |
|---|---|---|---|
| Thu Nov 5 | Applications open | Building | Apply. Create the Lovable project. Sandbox accounts. |
| Fri 6 – Sun 8 | Applications close **Sun 11:59 PM PT** | Building | Foundation, PayPal payments, AI concierge |
| Mon Nov 9 | Decisions 9 AM PT | Building | Gift goals, fulfillment |
| Tue 10 – Wed 11 | **Build week starts Tue 9 AM PT** | Building | Child wallet, polish, video |
| Thu Nov 12 | Build week | **Due 12:00 PM PT** (we aim for 10 AM) | Submit to Devpost |
| Fri Nov 13 | **Build week ends 11:59 PM PT** | Done | Lovable polish for SheBuilds: visual pass, family-use extras |

**SheBuilds has no judging or winner.** The FAQ says: "No. This edition is about learning and building, not competing." You get live sessions, a peer group, guided tracks and expert-led sessions. So starting before Nov 10 carries little risk. Use build week for the Lovable polish and the family side, and share progress with your peer group.

**Still worth a quick check:** the site doesn't say whether a project started before Nov 10 is OK. It's a *learning* program (tracks, webinars, peer groups), and the FAQ on judging isn't readable from outside. **Ask them before Nov 10:** email shebuilds@lovable.dev, or ask in the Slack once accepted. A short message you can send:

> Hi! I'm applying to the "Build Something for Your Family" track. I'm also entering the PayPal AI Hackathon (due Nov 12) with a related family app built in Lovable. Is it OK to bring a project I started this week and keep building it during SheBuilds week, or should I start a fresh Lovable project on Nov 10?

**If they say "start fresh":** keep the PayPal build as it is, and on Nov 10 start a new Lovable project for SheBuilds focused on the family and child side (the grandparent home, child wallet and thank-you loop), using the same design brief.

---

## 1a. Why Lovable + Claude Code (not one or the other)

| | Lovable alone | Claude Code alone | **Both (chosen)** |
|---|---|---|---|
| SheBuilds | ✅ | ❌ not a Lovable project | ✅ project lives in Lovable |
| Screens, system map, database | ✅ fast, visual | slower, more back-and-forth | ✅ Lovable |
| PayPal (multi-currency orders, webhooks, fee receipt, payouts) | ⚠️ risky; easy to get money logic subtly wrong | ✅ | ✅ Claude Code |
| AI agent with tools and guardrails | ⚠️ | ✅ | ✅ Claude Code |
| Devpost needs (public repo, README, run instructions) | ✅ via GitHub sync | ✅ | ✅ |

**Rules that keep it from getting messy:**
- PayPal, fee and agent code lives in its own folders.
- Lovable's project knowledge says not to rewrite those files.
- I work on a feature branch; you merge it.
- After a merge, tell Lovable what changed (see the prompt in Lovable's docs).

## 2. Draft application answers

*You're already accepted, so this section is just for reference.*

Step 1 of the form asks for: full name, role, company or school, LinkedIn. The later steps aren't visible until you sign in; the track is chosen there.

| Field | Suggested answer |
|---|---|
| Full name | Summer Chang |
| Your role | Founder / Entrepreneur (or Designer / UX / Creative) |
| Company or school | AOS (Agency OS) |
| LinkedIn | *(your profile URL)* |
| Build track | **Build Something for Your Family** |

**If they ask what you'll build (short version):**

> My neighbor's parents flew in from Taiwan to help with the new baby. They can't read English, and they wanted to give their grandkids something meaningful, not just money in a transfer app. I'm building **Thought**: grandparents abroad pick thoughtful gifts for their grandkids in the US (a museum membership, a week of camp, babysitter nights for tired parents, a red envelope at Lunar New Year), in their own language. The family can chip in together across countries, every fee is shown before anyone pays, and the kids get a voice note from Grandma with every gift.

**If they ask why you, or what you hope to learn:**

> I'm a product designer and founder, and I build in public with AI. I want to take a real family problem from research to a working app in a week, and learn Lovable's backend and AI features well enough to teach them.

---

## 3. Create the Lovable project

1. Go to lovable.dev and start a new project.
2. Paste the **first prompt** from §4 as the very first message.
3. In **Project settings → Knowledge** (project instructions), paste §5.
4. Turn on **Lovable Cloud** when it asks. This gives you the database, sign-in and file storage.
5. **Project settings → Git → connect GitHub.** Lovable creates a new repo and syncs both ways.
6. Send me the repo URL. I'll clone it into this folder and build the PayPal and AI parts here, on a feature branch that you merge into `main`. Lovable then pulls it in.
7. **Secrets** (Lovable: Cloud → Secrets). You add these yourself; never paste them in chat:
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` (sandbox)
   - AI key: either use **Lovable AI** (built in, but it only works in the Lovable preview or published app, not locally), or add your own `AI_GATEWAY_API_KEY` / `ANTHROPIC_API_KEY`, which works everywhere. Recommended: your own key, so I can test locally.

The empty Next.js scaffold in this folder will be removed once the Lovable repo is cloned in. Your docs stay.

---

## 4. First prompt for Lovable

Copy everything in the box.

````
Build the foundation of "Thought", a web app where grandparents who live abroad give their grandchildren in San Francisco the care they'd give in person: a Saturday at the movies, a family dinner, a museum day. The idea: "Grandma got you Saturday." Don't add payments yet. I'll add PayPal later.

WHO USES IT
- Grandparent (abroad): uses the app in Traditional Chinese (zh-TW), Japanese (ja-JP) or French (fr-FR). Large type, one main button per screen.
- Parent (in San Francisco, English): sets up the family, adds wishes, approves gifts.
- Child (English): sees gifts from each grandparent, plays their voice note, says thank you.

SCREENS (mobile-first, responsive)
Grandparent:
1. Home: the grandchild's photo, the next occasion ("Mei's birthday · in 21 days"), one main button "Send a gift".
2. Gift ideas: up to 3 gift cards (illustration, title, one line on why it fits, price in USD with ≈ local currency, a "★ Parent's wish" tag).
3. Gift detail: what it is, what it covers, a progress bar for a family gift goal, who has given.
4. Contribute: suggested amounts, a "my family receives the full gift (I'll cover the fees)" toggle, a receipt-style cost breakdown placeholder, a message box. A placeholder area where the PayPal button will go.
5. Sent: confirmation ("Sent! Mei will see it tomorrow morning").
Parent:
6. Setup: family name, child (name, birthday, photo, interests), invite a grandparent (title like 阿嬤, country, language), which produces an invite link.
7. Home: new gifts, goals that are funded, members waiting for approval, the wish list.
Child:
8. Wallet: a shelf of gifts grouped by grandparent, each with a face, the gift, a play button for a voice note with an English caption, and "Say thank you".

LANGUAGE
- All UI text comes from translation files for en, zh-TW, ja-JP, fr-FR. Add a language switcher on every screen, each language labelled in itself (English · 繁體中文 · 日本語 · Français).
- Money uses Intl.NumberFormat with the right currency (NT$3,000, ¥5,000, 20,00 €). TWD and JPY have no decimals.

DATA (use Lovable Cloud)
Tables: families, members (role parent|grandparent|relative|child, title, country, language, currency, status invited|approved|blocked), children, catalog_items (type cash|care|experience|item|recurring, title and description in each language, price_usd, age range, city, fulfillment type, source_url), wishes, gift_goals (target_usd, occasion, due date, status), contributions (amount, currency, message, status), thank_yous.
Row-level security: members only see their own family. Only parents can approve members.
Seed demo data: family "Lin", child Mei (6, loves science, dinosaurs, swimming), grandparents 阿嬤 Chang (Taipei, zh-TW, TWD), おじいちゃん Kenji (Tokyo, ja-JP, JPY), Mamie Claire (Paris, fr-FR, EUR).
Catalog of care gifts (nothing ships; everything happens in Mei's city): Saturday at the movies (Regal gift card, $100), Family dinner night (Benihana $100 or Grubhub $25), An adventure day (iFLY $50), A Saturday at the Exploratorium (family membership $239), A Saturday at the SF Zoo (family membership $199), a Lunar New Year red envelope (cash).
Parent hints for Mei: "loves dinosaur movies", "Saturdays work". Seed one gift goal: Saturday at the movies, $100, with a contribution from 阿嬤 Chang of NT$3,000 (family receives ≈ $85.97, so the goal shows 86%). Grandpa Kenji finishes it live in the demo with ¥3,000.

LOOK AND FEEL
Warm paper, ink, and one red thread. It should feel like a handwritten card from Grandma, not a bank.
- Colors as CSS variables (no hardcoded colors in components): --paper oklch(0.975 0.012 80), --paper-raised oklch(0.995 0.005 80), --ink oklch(0.22 0.02 40), --ink-muted oklch(0.45 0.02 40), --line oklch(0.88 0.015 70), --thread oklch(0.50 0.19 27) for the ONE main action per screen, --thread-ink oklch(0.99 0 0), --thread-soft oklch(0.94 0.04 27), --gold oklch(0.78 0.12 85) for celebrations only.
- Fonts: Fraunces + Noto Serif TC/JP for display; DM Sans + Noto Sans TC/JP for body. Grandparent body text 20px; parent 17px.
- No gradients, no stock photos, no default grey shadcn look. Cards only for objects (gifts, envelopes). Tap targets at least 56px on grandparent screens.
- Motion 200ms ease-out. Respect reduced motion.
- Design empty, loading and error states for every screen, with warm short copy that says what to do next.
- WCAG AA contrast and visible focus rings.
````

---

## 5. Project knowledge (paste into Lovable's project instructions)

```
Thought rules. Follow these in every change.

Product
- Grandparents abroad gift grandkids in the US. PayPal handles all payments. Every fee and currency conversion is shown before paying (estimate) and after paying (actual from PayPal). Never hide a cost. Always show "Thought fee: $0".
- Money only goes to approved members of the family. Only parents approve members.

Money
- Amounts are always computed on the server from the catalog, goal or rules. Never trust an amount sent from the browser.
- TWD and JPY are whole numbers (no decimals). EUR and USD use 2 decimals.
- Payment amounts are in the grandparent's own currency. The business account converts to USD.
- Fee rates come from a fee_schedule table, never hardcoded in components.

AI
- The AI suggests; code decides; the person approves. The AI never sets a price, never creates a payment by itself, and only recommends catalog items returned by a tool.
- The AI replies in the user's language and refuses any request to pay someone outside the family.

Design
- Use the CSS variables for color; no hex values in components. One --thread colored main action per screen.
- Grandparent screens: 20px body text, 56px tap targets, one main button.
- Every screen has empty, loading and error states.
- Copy is warm, short and direct. Never use: delve, landscape, leverage, tapestry, foster, robust, seamless, dive in, let's unpack.

Code
- TypeScript, no `any`. Function components. Tailwind + shadcn/ui using our tokens.
- Payment and AI code lives in server functions. Secrets only from Cloud secrets.
- Some code is written outside Lovable (PayPal, AI agent, fee engine). Don't rewrite those files unless asked.
```

---

## 6. Who builds what

| Part | Where | Who |
|---|---|---|
| Screens, look and feel, translations, seed data | Lovable | You (prompting), me (reviewing against the design brief) |
| Database tables and row-level security | Lovable Cloud | Lovable, from the first prompt; I check the policies |
| PayPal: quotes, orders, capture, webhooks, refunds, payouts | Server functions in the repo | Me, locally, pushed through GitHub |
| AI concierge, rules engine, translation | Server functions in the repo | Me |
| Secrets | Lovable Cloud → Secrets | You |
| Demo video, Devpost and SheBuilds write-ups | — | Together |

**A Lovable gotcha:** Lovable doesn't automatically deploy edge functions or run database migrations that arrive through GitHub. After I push those, ask Lovable in chat to deploy the function, or to apply the migration.
