# Design Brief

*v1 · Nov 5, 2026 · Companion docs: [USER-FLOWS.md](USER-FLOWS.md) · [TECH-SPEC.md](TECH-SPEC.md) · [../RESEARCH.md](../RESEARCH.md)*

---

## 1. Name

**Name: Thought** (chosen Nov 10, 2026)

As in "it's the thought that counts." The gift isn't a box or a transfer; it's proof that someone far away thought about this child, this month, in this city. One short, warm word that grandparents, parents and judges understand without explaining.

In the app it stays in English in every language (like a brand name), for example "Thought 服務費" on the Chinese receipt.

*Earlier working name: Thought (紅線 / 赤い糸). To do before launch beyond the hackathon: check domain and trademarks, since "thought" is a common word.*

---

## 2. The job, in one sentence per person

| Person | Comes here to… |
|---|---|
| **Grandparent abroad** | …give the grandkids something that shows they care, without having to read English or understand US prices. |
| **Parent in SF** | …tell family what the kids actually need, and approve what comes in. |
| **Child** | …see who loves them, and say thank you. |

**One-sentence direction:** *It should feel like getting a handwritten card from Grandma, not like using a bank.*

---

## 3. Audience realities that shape the design

- **Grandparents are 60–80 years old**, often on an iPad or a large phone, often with reading glasses. Many have never used a US app. Some read Traditional Chinese or Japanese only.
- **They are generous and they are careful.** They worry about scams and about "doing it wrong" (the wrong amount, an unlucky number, an odd gift). The design has to make them feel *sure*.
- **Parents are tired.** A new baby, two jobs, grandparents visiting. Their screens must be quick: approve, done.
- **Kids aged 4–12** can't read much. Pictures, faces and voice do the work.

---

## 4. Principles for this product

These come from your design-taste rules, applied to this product.

1. **One job, one big action.** On every grandparent screen there is exactly one primary button.
2. **Faces before numbers.** The grandchild's photo leads; amounts come second.
3. **Two currencies, always together.** "NT$3,000 · about $96". Each amount appears once, never repeated.
4. **Say what happens next.** "Mei will see this tomorrow morning, her time." Not "Transaction complete."
5. **The custom is built in, never lectured.** Lucky amounts are suggested quietly; no one gets told off.
6. **Safety is visible.** Every payment screen shows *who* the money goes to: the grandchild's photo, approved by the parent.
7. **Remove before you add.** No dashboards for grandparents, no settings they don't need.
8. **No hidden costs, ever.** Before anyone pays they see what they pay, each PayPal fee, the conversion, and what the family receives. After paying they see the actual numbers from PayPal. (See §5a and TECH-SPEC §5.)
9. **PayPal is visible, not buried.** PayPal's name and mark show up at every money moment (paying, converting, receipts, payouts), so the grandparent knows a name they trust is handling it.

---

## 5. Visual direction

> **Updated Nov 10:** the built app uses a minimal, Apple-like direction instead: white space, the system font, large type, and **PayPal blue as the one color moment** on the payment screen. Tokens live in `app/globals.css` (`--th-*`). The paper-and-ink direction below is kept for reference.

**Mood (v1):** warm paper, ink, and one red thread. Calm, personal and handmade. Think a letter in a red envelope, not a fintech app. No gradients, no glossy 3D coins, no stock photos of smiling seniors.

**The one color moment:** **thread red** marks the main action on each screen, and only that. Everything else is ink on paper.

### Palette (tokens, in oklch)

| Token | Role | Value | Notes |
|---|---|---|---|
| `--paper` | App background | `oklch(0.975 0.012 80)` | Warm off-white |
| `--paper-raised` | Cards that show an object (gift, envelope) | `oklch(0.995 0.005 80)` | |
| `--ink` | Primary text | `oklch(0.22 0.02 40)` | Warm near-black |
| `--ink-muted` | Secondary text, labels | `oklch(0.45 0.02 40)` | Must pass 4.5:1 on `--paper`; check with a contrast tool |
| `--line` | Dividers, input borders | `oklch(0.88 0.015 70)` | |
| `--thread` | Primary action, progress fill, envelope | `oklch(0.50 0.19 27)` | Deep red. White text on it must pass 4.5:1. |
| `--thread-ink` | Text on `--thread` | `oklch(0.99 0 0)` | |
| `--thread-soft` | Selected states, tag backgrounds | `oklch(0.94 0.04 27)` | Text on it uses `--ink` |
| `--gold` | Celebration only (goal funded, envelope opened) | `oklch(0.78 0.12 85)` | Decoration, never text |
| `--success` / `--warning` / `--danger` | System states | to define | Danger must be clearly different from `--thread`, so use an orange-red or an icon + label |

**Token gap to watch:** red is both the brand color and the usual "error" color. Errors must always carry an icon and words, never color alone.

### Typography

Every typeface has to cover Latin, Traditional Chinese and Japanese, so the type system is built around CJK first.

| Role | Latin | zh-TW | ja-JP | Use |
|---|---|---|---|---|
| Display | **Fraunces** (soft, warm serif) | **Noto Serif TC** | **Noto Serif JP** | Names, gift titles, big moments ("A year at the Exploratorium") |
| Body / UI | **DM Sans** | **Noto Sans TC** | **Noto Sans JP** | Everything else |

**Scale** (rem, 1rem = 16px):

| Use | Size |
|---|---|
| Display | 2.5 |
| H1 | 2 |
| H2 | 1.5 |
| Body (grandparent screens) | **1.25** (20px) |
| Body (parent screens) | 1.0625 (17px) |
| Label | 0.875 |

- **Grandparent screens use bigger body text.**
- **CJK line height:** 1.7 for CJK body text, 1.5 for Latin.
- **Tracking:** slightly tight (-0.01em) on large Latin text; no tracking change on CJK.
- **Banned:** Inter, Geist, Arial, any thin or light weight below 400 on grandparent screens.

### Shape, space, motion

- **Radius:** 12px for cards, 999px for chips. The envelope and gift cards are the only "objects" that get a card; everything else sits on the paper.
- **Spacing:** tight inside groups (8–12px), generous between groups (32–48px). Grandparent screens get extra room.
- **Tap targets:** at least 56px on grandparent screens (above the 44px floor), 44px elsewhere.
- **Motion:** 200ms ease-out for most transitions. There are **two** exceptions where we allow play:
  - opening an envelope
  - a funded goal

  Even those stay short (≤ 600ms), with no bouncing loops. Respect `prefers-reduced-motion`.

### Imagery

- Real family photos that the parent uploads: kids, grandparents.
- Simple flat illustrations for gift categories: a museum, a tent for camp, a bowl of noodles for a DoorDash dinner. One line weight, ink plus one red accent.
- The red envelope and the thread are the only "brand graphics." The thread can join the grandparent's avatar to the child's avatar on the home screen.

---

## 5a. The cost receipt (signature component)

This component is our answer to "hidden costs." It appears on the contribute screen as an estimate, and on the sent screen and parent approval as actuals. It reads like a paper receipt: ink on `--paper-raised`, aligned number lanes, no color except the final line.

```
 You pay                         NT$3,000
 ───────────────────────────────────────
 PayPal processing (3.49%)        −NT$105
 International payment (1.50%)     −NT$45
 PayPal fixed fee                  −NT$14
 Conversion to US$ (3%, by PayPal)  −$2.66
 Thought fee                        $0
 ───────────────────────────────────────
 Mei's family receives          ≈ $85.97
 Total cost 8.3% · rate at 10:42, PayPal sets the final rate
```

**Rules**
- **Number lanes line up:** right-aligned, tabular figures, local currency and USD in fixed columns.
- **One toggle above it:** "Mei's family receives the full gift (I'll cover the fees)." It's on by default. When it's on, "You pay" goes up and "family receives" matches the gift price.
- **One explainer line, in the grandparent's language:** "You pay in NT$, so PayPal won't add a conversion fee on your side."
- **Estimates are labelled "≈"** with the rate time. Actuals replace them after PayPal confirms and drop the "≈".
- **"Thought fee $0" is always shown,** because saying nothing would read as hiding something.
- **Grandparent view:** fee lines collapse into one "PayPal fees" line that taps open. The total cost % always stays visible.
- **Parent view:** always expanded, plus the payout line.
- **Child view:** never shows fees.

---

## 6. Voice and copy

Warm, short and direct. Lead with the person, not the feature.

| Instead of | Say |
|---|---|
| "Transaction successful" | "Sent. Mei will see it when she wakes up." |
| "Select a gift category" | "What would you like to give Mei?" |
| "Contribution amount" | "How much would you like to give?" |
| "Insufficient funds" | "PayPal couldn't take this payment. Try another card or account." |
| "Goal progress: 35%" | "A third of the way there. Grandpa Kenji can help finish it." |

- **Translations are written, not machine-only.** The core UI strings in zh-TW, ja-JP and fr-FR get a human check before the demo. Ask a native speaker; your neighbors count. AI translates only user content: messages and voice notes.
- **Forms of address:** use family titles, not first names, in the child's view: 阿嬤 (Grandma, Taiwanese), 外公 (Grandpa, mother's side), おばあちゃん (Grandma, Japanese), Mamie (Grandma, French). The parent sets these titles.
- **Banned words:** delve, landscape, leverage, tapestry, foster, robust, seamless, dive in, let's unpack. Go easy on em-dashes.

---

## 7. The three experiences

### Grandparent app (in their language, mobile/tablet first)
- **Feel:** a letter. Large type, one action, lots of space.
- **Home:** grandkids' faces, the next occasion ("Mei's birthday · in 12 days"), and one button: 送禮物 ("Send a gift").
- **Gift concierge:** a conversation, not a form. They can type or hold to talk. Suggestions arrive as 3 gift cards at most.
- **Never shown:** account settings, transaction lists, fees jargon.

### Parent app (English, mobile first, also works on desktop)
- **Feel:** quick and tidy, like Linear's density.
- **Home:** what came in, what needs approval, and the wish list.
- **Core actions:** approve a family member, add a wish, cash out.

### Child view (English, tablet/phone, can be the parent's phone)
- **Feel:** opening presents.
- **Wallet:** a shelf of gifts grouped by person, each with a face, the gift, a play button for the voice note, and a "Say thank you" button.
- **Goals:** shown as a picture filling up (the museum illustration filling with red), not a progress bar with percentages.
- **No balances in dollars for young kids.** Show the gift itself. Older kids (8+) can switch on dollar amounts; the parent controls this.

---

## 8. States that must be designed (not just the happy path)

| Screen | Empty | Loading | Error |
|---|---|---|---|
| Grandparent home | "Mei's family hasn't added wishes yet. You can still send a red envelope or ask for ideas." | Faces load first; skeleton for the occasion line | Offline: "No connection. Your gift is saved; we'll send it when you're back online." |
| Gift concierge | Three starter prompts in their language ("Birthday ideas for Mei", "Something for the new baby", "A red envelope for New Year") | "Thinking about Mei…" with the thread animating | "I couldn't find ideas right now. Here are the family's wishes instead." |
| Payment | n/a | PayPal button area holds its space so nothing jumps | Declined / cancelled: plain-language message, the gift stays saved, and a "Try again" button |
| Goal | "No one has started this yet. Be the first." | n/a | Goal cancelled by parent: "Your NT$3,000 is being returned to your PayPal." |
| Child wallet | "When family sends you gifts, they'll show up here." | Shelf skeleton | Voice note failed: show the text caption instead |
| Parent approvals | "All caught up." | List skeleton | Payout failed: what happened plus "Try again" or "Change payout account" |

---

## 9. Accessibility floor

- WCAG 2.1 AA everywhere: 4.5:1 text contrast, checked on actual backgrounds including `--thread-soft`.
- Visible focus rings (2px `--ink` outline, offset 2px), and everything keyboard reachable.
- Grandparent mode: minimum 20px body text, 56px targets, no essential information conveyed by color alone, no time limits.
- Voice notes always have text captions; the child view works with VoiceOver.
- Language switcher on every screen, labelled in its own language (繁體中文 · 日本語 · Français · English).

---

## 10. References and anti-references

**Look to:**
- Handwritten letters and red envelopes themselves
- Muji's calm, paper-like restraint
- Linear's density for the parent view
- Stripe docs' clarity for anything explaining money
- LINE's sticker-like warmth for the child's thank-you moments

**Avoid:**
- Fintech green-and-black dashboards
- Gradient "AI" glows
- Default shadcn grey with no opinion
- Cartoon piggy banks
- Anything that looks like a casino or a red-packet grab game (no random-split "lucky draw" envelopes; the amount is the grandparent's choice)

---

## 11. Deliverables

1. Token file (`globals.css` custom properties) from §5
2. Three key screens in Figma or Lovable first:
   - Grandparent home
   - Gift concierge with 3 suggestions
   - Child wallet with an opened gift
3. Screenshot review after each screen (spacing, type, contrast, alignment, fit, repetition)
4. Envelope-opening and goal-funded animations (≤ 600ms, reduced-motion fallback)
