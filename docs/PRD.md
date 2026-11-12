# PRD: Thought

*For Lovable (and any builder). v1 · Nov 5, 2026 · Owner: Summer Chang*
*Detail lives in the Design Brief, User Flows and Technical Spec. This page is the single source of what to build.*

---

## 1. One line

**"Grandma got you Saturday."** Grandparents who live abroad give their grandkids in the US the care they'd give in person (a movie, a family dinner, a museum day), chosen in their own language, paid in their own currency through PayPal, with every fee shown.

## 2. Why

- **US tools lock grandparents abroad out.** Greenlight needs "a U.S.-based billing address", Ugift needs US residency, and WeChat red packets don't reach the US.
- **Distance turns grandparents into a face on a screen.** Between visits, Grandma can't take Mei anywhere.
- **Lists and boxes don't feel like love.** Parents call wish lists impersonal, and mailing from abroad costs $40+ a box. Parents ask for experiences instead.
- **The language gap runs both ways.** Voice notes with captions let grandparent and grandchild hear each other.
- **We're not a cheaper way to send cash.** Use Wise for cash; use Thought when cash isn't the gift.

## 3. Users

| User | Language | Device | Needs |
|---|---|---|---|
| **Grandparent** (60–80, abroad) | zh-TW · ja-JP · fr-FR | iPad or large phone | Big type, one action per screen, confidence the money reaches the grandchild, gifts explained in their language |
| **Parent** (San Francisco) | English | Phone | Set up the family, list real needs, approve members and gifts, quickly |
| **Child** (4–12) | English | Parent's phone or tablet | See who loves them, hear Grandma's voice, say thank you |

## 4. Goals and success

| Goal | Measured by |
|---|---|
| A grandparent can give a gift without reading any English | Hero flow done end to end in zh-TW and ja-JP |
| Her pick becomes a real Saturday | The funded gift is bought through PayPal (or a labeled simulation), and a photo comes back afterwards |
| No hidden costs | The cost receipt is shown before payment and the actual numbers after, for 100% of payments |
| Gifts feel personal | Every gift can carry a message or voice note, and the child view shows the giver's face |
| Family can give together | Two grandparents in two currencies fund one gift goal |
| Safe by design | Money can only go to the approved family. The AI refuses outside payment requests. |

## 5. Scope

**Must have (hackathon demo)**
1. Family setup and invites; parent adds hints ("loves dinosaur movies", "Saturdays work")
2. Grandparent home, gift ideas, gift detail, contribute, sent
3. Gift goals pooled across currencies (hero: $100 Saturday at the movies)
4. Cost receipt (estimate before paying, actual after)
5. Parent's three taps: "we have this" · "yes, this month" · "pick a Saturday"
6. Gift fulfilled by Thought's AI agent through PayPal *(built by Claude Code; labeled simulation if the sandbox doesn't allow it)*
7. Child view with voice notes, plus the photo and thank-you loop
8. Four languages (en, zh-TW, ja-JP, fr-FR) with a switcher on every screen
9. AI gift concierge in the grandparent's language *(built by Claude Code)*
10. PayPal payment in the grandparent's currency *(built by Claude Code)*

**Should have:** red envelope with lucky-amount suggestions · scam guard message · goal cancellation and refunds

**Won't have (now):** shipped items · baby registry · open prepaid cards · any address flow · allowance · payouts · live money · native apps · child logins

## 6. Care catalog (MVP)

| Gift | Price | How it's delivered |
|---|---|---|
| **Saturday at the movies** (Regal) | $100 | AI agent buys the gift card through PayPal |
| Family dinner night (Benihana / Grubhub) | $100 / $25 | AI agent buys the gift card through PayPal |
| An adventure day (iFLY) | $50 | AI agent buys the gift card through PayPal |
| A Saturday at the Exploratorium (family membership) | $239 | Goal, fulfilled by hand, labeled |
| A Saturday at the SF Zoo (family membership) | $199 | Goal, fulfilled by hand, labeled |
| 紅包 red envelope | Lucky amounts | Cash moment in the child's wallet (if time) |

Card brands come from PayPal's sandbox gift-card demo store. Nothing ships; everything is used in the child's city.

## 7. Screens

**Grandparent** (their language, 20px body text, 56px tap targets, one red button per screen)

| # | Screen | Must show |
|---|---|---|
| G1 | Home | The child's photo, the next occasion, one button "Send a gift" |
| G2 | Gift ideas | Chat or voice input; up to 3 gift cards with why each fits, price in USD + ≈ local currency, "★ Parent's wish" tag |
| G3 | Gift detail | What it is and covers (in their language), goal progress, who has given |
| G4 | Contribute | Suggested amounts, cover-fees toggle (on), **cost receipt**, message or voice note, PayPal button area, "This goes to Mei's family, approved by Lin" |
| G5 | Sent | "Sent! Mei will see it tomorrow morning", final receipt |

**Parent** (English)

| # | Screen | Must show |
|---|---|---|
| P1 | Setup | Family, child (name, birthday, photo, interests), invite grandparents (title, country, language), invite link |
| P2 | Home | New gifts, funded goals, members waiting, hints ("loves dinosaur movies", "Saturdays work") |
| P3 | Gift detail | Givers, full cost receipt per contribution, three taps: "we have this" · "yes, this month" · "pick a Saturday" |
| P4 | After the Saturday | Upload a photo; it goes to the grandparents with Mei's thank-you |

**Child** (English)

| # | Screen | Must show |
|---|---|---|
| C1 | Wallet | Gifts grouped by grandparent: face, gift, voice note with English caption, "Say thank you" |
| C2 | Gift opened | Short celebration (≤ 600ms), givers' faces, play buttons |
| C3 | Thank you | Record voice or pick a drawing; sent back translated |

**Every screen** has empty, loading and error states with warm, short copy that says what to do next.

## 8. The cost receipt (required on G4, G5, P3)

```
You pay                           NT$3,000
PayPal processing (3.49%)          −NT$105
International payment (1.50%)       −NT$45
PayPal fixed fee                     −NT$14
Conversion to US$ (3%, by PayPal)    −$2.66
Thought fee                          $0
Mei's family receives            ≈ $85.97
Total cost 8.3% · PayPal sets the final rate
```

- **Before payment:** an estimate, marked "≈".
- **After payment:** PayPal's actual numbers.
- "Thought fee $0" is always shown.
- Grandparents see one "PayPal fees" line that taps open; parents always see it expanded.
- Children never see fees.
- **Lovable builds the component with placeholder data.** Claude Code connects the real numbers.

## 9. Data

| Table | Key fields |
|---|---|
| families | name, city |
| members | role (parent / grandparent / relative / child), title (阿嬤, おじいちゃん, Mamie), country, language, currency, status (invited / approved / blocked) |
| children | name, birthdate, interests, photo, show_amounts |
| catalog_items | type, title and description per language, price_usd, age range, city, fulfillment type, source_url |
| wishes | child, catalog item, note |
| gift_goals | child, catalog item, target_usd, occasion, due date, status (open / funded / fulfilled / cancelled) |
| contributions | goal, member, amount, currency, fee and rate fields, status, message (original + English), voice note |
| thank_yous | child, to member, voice note, text (original + translated) |
| fee_schedule | fee key, value, currency, source URL |

**Access rules:**
- Members only see their own family.
- Only parents approve members and gifts.
- Grandparents never see the street address.

**Seed data:**
- Family Lin; child Mei (6; loves science, dinosaurs, swimming).
- 阿嬤 Chang (Taipei, zh-TW, TWD), おじいちゃん Kenji (Tokyo, ja-JP, JPY), Mamie Claire (Paris, fr-FR, EUR).
- The catalog in §6.
- One goal: Saturday at the movies ($100), with 阿嬤 Chang's NT$3,000 already in (≈ $85.97, 86%).

## 10. Design (summary)

- **Feeling:** a handwritten card from Grandma, not a bank. Warm paper, ink, one red thread.
- **Color tokens only:**

  | Token | Use |
  |---|---|
  | `--paper` | Background |
  | `--paper-raised` | Raised surfaces |
  | `--ink` | Text |
  | `--ink-muted` | Secondary text |
  | `--line` | Borders, dividers |
  | `--thread` | The one main action per screen |
  | `--thread-ink` | Text on thread |
  | `--thread-soft` | Soft thread tint |
  | `--gold` | Celebrations only |

- **Type:** Fraunces + Noto Serif TC/JP for display; DM Sans + Noto Sans TC/JP for body.
- **Avoid:** gradients, stock photos, default grey component looks.
- **Motion:** 200ms ease-out; respect reduced motion.
- **Accessibility:** WCAG AA contrast, visible focus rings, keyboard reachable.
- **Copy:** warm and short. Banned words: delve, landscape, leverage, tapestry, foster, robust, seamless, dive in, let's unpack.

## 11. Who builds what

| Part | Builder |
|---|---|
| Screens, components, design tokens, translations, seed data | **Lovable** |
| Database tables, access rules, sign-in, file storage | **Lovable Cloud** |
| PayPal payments, payment confirmations, refunds | **Claude Code** (via GitHub sync) |
| AI agent buying the funded gift card through PayPal | **Claude Code** |
| Fee and currency engine (cost receipt numbers) | **Claude Code** |
| AI gift concierge, custom-amount rules, translation | **Claude Code** |

**Lovable: leave these alone unless asked.** Folders for PayPal, fees, rules and the agent. Build their screens with placeholder data and clear `TODO: connect` markers instead.

## 12. Build order for Lovable

**MVP first:** "Grandma got you Saturday": Grandma Chang (TWD) and Grandpa Kenji (JPY) pool a $100 Saturday at the movies for Mei (see MVP-STORY.md). Steps 1, 3, 4 and 5 below cover the MVP; step 2's invite and approvals come after (seed the members instead).

| Step | Prompt Lovable with | Done when |
|---|---|---|
| 1 | Foundation: tokens, fonts, four languages, layout, data tables, seed data | Grandparent home renders in all 4 languages with Mei's seed data |
| 2 | Parent setup + invite link + approvals | Parent can add a grandparent and see them as "invited" |
| 3 | Grandparent flow G1–G5 with placeholder gift ideas and a placeholder cost receipt | You can click through G1→G5 in zh-TW |
| 4 | Gift goals: progress, givers, funded state | Chang's NT$3,000 shows the goal at 86%; Kenji's ¥3,000 makes it funded |
| 5 | Child wallet C1–C3 with voice note playback (upload a sample audio file) | Mei's shelf shows gifts from 3 grandparents |
| 6 | Polish: empty, loading and error states; contrast check; mobile and tablet | Every screen has all three states |

After step 3, Claude Code connects PayPal and the cost receipt. After step 4, it connects the AI concierge.

## 13. Hackathon requirements this PRD must meet

- **PayPal AI Hackathon** (due Thu Nov 12, 12:00 PM PT):
  - PayPal is central to the product, and AI is used meaningfully.
  - Working build, public GitHub repo with an open-source license, run instructions.
  - Demo video under 3 minutes.
- **SheBuilds** (Nov 10–13): track "Build Something for Your Family", built with Lovable. No judging or winner; it's a learning week with live sessions and a peer group. *Track starter brief: add once visible in your SheBuilds account.*

## 14. Open questions

1. SheBuilds: the track starter brief and prompt (in your account, not public)
2. AI key: Vercel AI Gateway or Anthropic.
3. Exchange-rate source for estimates.
4. Domain and trademark check for "Thought" (after the hackathon).
