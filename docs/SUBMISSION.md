# Devpost submission: Thought

Copy each section into the matching Devpost field.

---

## Project name

Thought

## Tagline

Thoughtful gifts from grandparents abroad.

## Elevator pitch (30 seconds)

Millions of kids in the US have grandparents in another country, and today those grandparents wire money: a bank form, fees nobody explains, and they never see what it bought. Thought turns that wire into a thoughtful gift. A grandmother in Taipei opens Thought in Chinese, and AI suggests gifts that fit her grandchild's age and city: dinner delivered when the family is sick, a sitter night for tired parents, a museum year, swim lessons, a week of camp. She pays in New Taiwan dollars through PayPal and sees every fee, before and after. Grandparents in different countries can give together, and the child sends one video thank-you, translated for each of them.

## Links

- Live demo: https://thought-one.vercel.app
- Code: https://github.com/SummerBreezeChang/thought
- Video: [YouTube link]

---

## Inspiration

It's 9 p.m. in Taipei. Grandma Chang wants to give her granddaughter Mei, who lives in San Francisco, something for her sixth birthday. All she can do is wire money: a bank form, a fee nobody explains, a week of waiting. Mei's mom says thank you for her, and Grandma never sees what it bought.

Almost half of California's kids (44%) have a parent born abroad. US grandparents spend about $2,654 a year on their grandchildren, but sending money across borders through a bank averages almost 15% in fees. And research on loneliness keeps saying the same thing: what helps isn't more contact, it's feeling close.

We wanted a grandparent far away to give a meaningful moment in the child's week, not a transfer, and to hear back.

## What it does

Thought has three people and three steps.

1. **Grandma picks a gift, in her own language.** Ideas fit the child's age and city: a Saturday at the movies, a museum year, swim lessons, a sitter night for tired new parents. Amounts follow her culture (in Taiwan: no 4s, lucky 6s and 8s; in Japan: round thousands). Before she pays, she sees every fee: PayPal's processing, international and conversion fees, Thought's $0, and what the family receives.
2. **PayPal moves the money.** She pays in NT$, ¥ or € on PayPal's own checkout. After capture, the receipt shows PayPal's actual numbers: the fee, PayPal's exchange rate, and the US$ that arrived. On our two completed sandbox payments, our fee estimate matched PayPal's exactly.
3. **Mei says thank you.** Mei sees one gift from everyone who gave and records one short video. It reaches every grandparent, marked New, with her words translated into each one's language using the name she calls them.

An AI concierge helps grandparents choose ("Mei likes rainy days, what should I give?"), quotes fees, and drafts a contribution. It can never pay: only the grandparent can, in PayPal.

We also designed for how families feel. Gifts are **given together, not a scoreboard**: each grandparent sees only their own amount, and everyone else simply "joined".

## How we built it

- **PayPal Orders v2 REST API** in the buyer's currency, with `experience_context` (brand, locale, pay now), idempotent create and capture, and the capture's `seller_receivable_breakdown` for the actual fee, rate and net. The sandbox business account auto-converts to US$.
- **A fee and FX engine** in integer minor units with live market rates, which estimates every PayPal fee before payment and grosses up so a gift is exactly funded.
- **The AI concierge** runs Claude Sonnet 5.5 through the **Vercel AI Gateway** with the **Vercel AI SDK**'s tool calling. Five tools (family context, catalog search, culture-aware amounts, fee quote, draft contribution) are each guarded in code. A six-prompt safety eval checks that it refuses scams like "send my money to my nephew's account".
- The same model **translates the child's thank-you** for each grandparent.
- **Next.js 16** on **Vercel**, with **Vercel Blob** for payment records and videos (uploaded straight from the browser, streamed with byte ranges so they play on iPhone).
- Characters and logo hand-drawn in SVG. Every screen works in Traditional Chinese, Japanese, French and English.
- Built with **Claude Code** as a design and engineering partner, from research to the last commit.

## Challenges we ran into

- **Getting the fee math to match PayPal to the cent.** International, fixed and conversion fees differ by currency, and TWD and JPY have no decimals. We tested against completed sandbox captures until the estimate matched.
- **Exchange rates.** A fixed demo rate was US$1.90 off. Switching to live market rates brought the estimate within 6 cents.
- **Making AI safe around money.** We drew a hard line: the model suggests, code checks every number and rule, and only a person can pay.
- **Family dynamics.** Showing who gave how much invited comparison between grandparents, so we made amounts private and the gift collective.

## Accomplishments that we're proud of

- Two completed cross-currency PayPal payments (NT$ and ¥) funding one gift, with fee estimates that matched exactly.
- A thank-you loop that feels like a family moment, not a transaction.
- An interface a grandparent can use without typing: their language, their customs, big type, one choice per screen.

## What we learned

The receipt is the product. Grandparents don't fear PayPal; they fear not knowing where their money went. Showing every fee, before and after, builds more trust than any copy we could write.

## What's next for Thought

- Parent setup: invite grandparents, add gift ideas, approve who can give.
- Notifications when a gift or a thank-you arrives.
- Booking the gift itself (tickets, memberships) with partners.
- PayPal payouts straight to each family's account.

---

## Built with

PayPal Orders v2 API, PayPal Sandbox, Vercel AI Gateway, Vercel AI SDK, Claude Sonnet 5.5 (Anthropic), Claude Code, Next.js, React, TypeScript, Tailwind CSS, Vercel, Vercel Blob, Zod

## Tools: which AI, and how

| Tool | How we used it |
|---|---|
| **Claude Sonnet 5.5** via Vercel AI Gateway | In the product: the gift concierge (tool calling over our catalog, fee quotes and guarded drafts) and translation of the child's thank-you for each grandparent. |
| **Vercel AI SDK** | `generateText` with tools and step limits for the concierge. |
| **Claude Code** | Building it: research and source checks, product and design decisions, all code and tests, the pitch deck and these docs. |
