## Inspiration

It's 9 p.m. in Taipei. Grandma Chang wants to give her granddaughter Mei, who lives in San Francisco, something for her sixth birthday. All she can do is wire money: a bank form, fees nobody explains, a week of waiting. Mei's mom says thank you for her, and Grandma never finds out what it bought.

That's the story of millions of families. **44% of California's children have at least one immigrant parent** ([PPIC, 2026](https://www.ppic.org/publication/immigrants-in-california/)), and many have grandparents an ocean away. **The average US grandparent spends $2,654 a year on their grandchildren** ([AARP, 2026](https://www.aarp.org/pri/topics/social-leisure/relationships/the-essential-role-of-grandparents/)), but sending money abroad through a bank costs **14.99% on average**, more than double the 6.36% global average ([World Bank, Q3 2025](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf)).

The money isn't the hard part, though. Distance is lonely: **1 in 6 people worldwide are affected by loneliness** ([WHO, 2025](https://www.who.int/groups/commission-on-social-connection)). For grandparents and adult grandchildren, feeling close lowered depressive symptoms, while more contact on its own didn't help ([Moorman & Stokes, 2016](https://pubmed.ncbi.nlm.nih.gov/24906517/)). And experience gifts bring people closer than things, even when the giver isn't there ([Chan & Mogilner, 2017](https://academic.oup.com/jcr/article-abstract/43/6/913/2632328)).

So we asked: what if a grandparent far away could give a meaningful moment in the child's week, see exactly where the money went, and hear back?

## What it does

**Thought: thoughtful gifts from grandparents abroad.** Three people, three steps.

1. **Grandma picks a gift, in her own language.** Thought works in Traditional Chinese, Japanese, French and English. AI suggests gifts that fit the child's age and city: dinner for a tired week, a night off for the parents, a museum year, swim or art classes, a week of camp. Grandparents can tap a preset or ask in their own words. Amounts follow their culture: in Taiwan, no 4s and lucky 6s and 8s; in Japan, round thousands.
2. **PayPal moves the money, and every fee is shown.** She pays in NT$, ¥ or € on PayPal's own checkout. Before paying, she sees PayPal's processing, international and conversion fees, Thought's $0, and what the family will receive. After capture, the receipt shows PayPal's actual fee, exchange rate and the US$ that arrived. On our two completed sandbox payments, our fee estimate matched PayPal's exactly (NT$164 and ¥199).
3. **The child says thank you, once, to everyone.** Grandparents in different countries can fund one gift together. Each sees only their own amount, and everyone else simply "joined", so a gift never becomes a contest. Mei records one short video; it reaches every grandparent, marked New, with her words translated into each one's language using the name she calls them (阿嬤, おじいちゃん).

## How we built it

- **PayPal Orders v2 REST API** in the buyer's own currency, with `experience_context` (brand, locale, pay now), idempotent create and capture (`PayPal-Request-Id`), and the capture's `seller_receivable_breakdown` for the actual fee, net and exchange rate. The sandbox business account auto-converts to US$.
- **A fee and FX engine** in integer minor units (TWD and JPY have no decimals) with live market rates. It estimates every PayPal fee before payment and grosses up so a gift is funded exactly.
- **An AI gift concierge**: Claude Sonnet 5.5 through the **Vercel AI Gateway**, using the **Vercel AI SDK**'s tool calling. Five tools (family context, catalog search, culture-aware amounts, fee quote, draft contribution) are each guarded in code: approved family member only, right family only, at least $5 after fees, never far over what the gift needs. The AI can draft but never pay; only the grandparent can, in PayPal. A six-prompt safety eval checks it refuses scams like "send my money to my nephew's account". All six pass.
- **AI translation** of the child's thank-you for each grandparent.
- **Next.js 16** on **Vercel**, with **Vercel Blob** storing payments and videos. Videos upload straight from the browser and stream with byte ranges, so they play on iPhone.
- Hand-drawn SVG characters (Grandma Chang, Grandpa Kenji, Mei) with gentle motion: a heart travels along a red thread when a gift is sent and when the thank-you comes back. The motion turns off for people who prefer reduced motion.
- Built with **Claude Code** as a design and engineering partner, from research and source checks to the last commit.

## Challenges we ran into

- **Matching PayPal's fees to the cent** across currencies with different decimals and fixed fees. We tested against completed sandbox captures until the estimate matched.
- **Exchange rates.** A fixed demo rate was US$1.90 off; live market rates brought our estimate within 6 cents of PayPal.
- **Making AI safe around money.** We drew a hard line: the model suggests, code checks every number and rule, and only a person can pay.
- **Family dynamics.** Showing who gave how much invited comparison between grandparents, so we made amounts private and the gift collective.
- **Getting the facts right.** We had every statistic in our pitch independently re-checked against its source, and corrected two that were wrong.

## Accomplishments that we're proud of

- Two completed cross-currency PayPal payments (NT$ and ¥) funding one gift, with fee estimates that matched exactly.
- A thank-you loop that feels like a family moment, not a transaction.
- An app a grandparent can use without typing: their language, their customs, large type, one choice per screen.

## What we learned

The receipt is the product. Grandparents don't fear PayPal; they fear not knowing where their money went. Showing every fee, before and after, builds more trust than anything we could write. And the most meaningful feature, the thank-you, costs nothing to send.

## What's next for Thought

- Parent setup: invite grandparents, add gift ideas, approve who can give.
- Notifications when a gift or a thank-you arrives.
- Buying gift cards and bookings directly with partners (meals, sitters, memberships, classes) instead of funding the family to book them.
- PayPal payouts straight to each family's account.

---

**Try it:** https://thought-one.vercel.app · **Code (MIT):** https://github.com/SummerBreezeChang/thought
