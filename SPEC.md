# Thought: project docs

*Grandparents abroad send thoughtful, curated gifts to grandkids in the US. PayPal shows up at every money moment, and every fee and conversion is visible.*

| Doc | What's in it |
|---|---|
| [RESEARCH.md](RESEARCH.md) | Hackathon rules and judging, past winners, competitors, market stats, pain points |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Name, audience, principles, palette and type tokens, the cost receipt, voice, states, accessibility |
| [docs/USER-FLOWS.md](docs/USER-FLOWS.md) | Setup, gift goal (hero), red envelope, items, allowance, care credit, thank-you, payouts, scam guard, refunds, money state machine, demo script |
| [docs/PAYPAL-FEASIBILITY.md](docs/PAYPAL-FEASIBILITY.md) | 11 checks of what PayPal can and can't do (currencies, fees, rate lock, payouts, PayPal World, gift cards, policy), with verdicts and the revised money flow |
| [docs/COMPETITORS.md](docs/COMPETITORS.md) | Round 2: registries, experience gifting, gift cards, PayPal Pools, grandparent apps, fee transparency benchmarks, white space, pitch lines |
| [docs/LOVABLE-START.md](docs/LOVABLE-START.md) | Two-event timeline, the first Lovable prompt, project knowledge to paste, who builds what |
| [docs/TECH-SPEC.md](docs/TECH-SPEC.md) | Stack options, architecture, PayPal API at every touch point, fee and FX engine, rules engine, AI tools and guardrails, data model, i18n, security, sandbox test plan, milestones |

## Status (Nov 10)
- **Built:** fee engine, amount rules, Bay Area catalog by life stage, PayPal sandbox client (create, capture, refund, webhook check), AI concierge with guardrails, and the app: start page, grandparent home, gift + cost receipt + PayPal checkout, Sent receipt, Mei's gifts, video thank-you. 29 tests pass.
- **Not yet run for real:** PayPal sandbox and AI (needs keys in `.env.local`). Parent screens (three taps, photo) and the agent buying the gift card are next.

## Decided
- **SheBuilds (Lovable): accepted.** Track: Build Something for Your Family.
- **Build approach (Nov 10): Next.js, built here with Claude Code. No Lovable.** Minimal, Apple-like design; PayPal blue is the one color moment. This replaces the Lovable + Claude Code plan, so this build isn't a Lovable project for SheBuilds.
- **Hero story:** Grandma Chang NT$3,000 + Grandpa Kenji ¥3,000 fund the $100 Saturday at the movies (≈ $104 received).
- **Thank-you loop:** Mei records a video thank-you in the browser; her words are translated for the grandparent.

## Decisions waiting on you
1. AI key: your own key (Vercel AI Gateway or Anthropic), so it works locally and in Lovable.

**Decided Nov 10:** estimates use live market rates from open.er-api.com (free, no key, daily), cached 1 hour, falling back to fixed demo rates if it's down. Back-test on Chang's real capture: estimate US$83.50 vs PayPal US$84.07 (was US$85.97 on the demo rate).

## Setup only you can do
In the PayPal Developer Dashboard (sandbox):
- Create accounts: US business, plus Taiwan, Japan, France and US personal accounts.
- Turn on auto-convert to USD on the business account.
- Copy the Client ID and Secret into `.env.local`. Never paste them in chat.

## Deadlines
- PayPal AI Hackathon: **Thu Nov 12, 12:00 PM PT**. Our target is 10 AM.
- SheBuilds (Lovable): build week **Tue Nov 10, 9 AM PT – Fri Nov 13, 11:59 PM PT**.
