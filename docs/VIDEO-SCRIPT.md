# Thought: video script (about 2:50)

**Slides used in the video:** 1 → 2 → 3 → 5 → 6 → 7 → 8, then the app, then 9 → 14. Slides 10–13 and 15–18 are for judges reading the deck (16–18 are backup screens if the live demo fails).

Face on camera to open, then screen share: the deck first, then the live app.

- **Deck:** https://claude.ai/artifact/AArddBB5fQmX8318dpAnXJ (press Present, or use the arrow keys)
- **App:** https://thought-one.vercel.app (phone-size window, see "Set up" at the bottom)

Read it out loud once before recording. Talk like you're telling a friend, not reading. The lines in **bold** are the ones to land slowly.

---

## 1. Face on camera (0:00–0:15)

> Hi, I'm Summer.
>
> A lot of grandparents live across an ocean from their grandkids. When they want to send a gift, all they can do is wire money. And then they never see what it turned into.
>
> **So I built Thought: thoughtful gifts from grandparents abroad.**

*Switch to screen share.*

---

## 2. The story: slides 2 → 7 (0:15–0:50)

Skip slide 4 (the California numbers) in the video; it's there for judges who read the deck.

**Slide 2, "It's 9 p.m. in Taipei"**

> Meet Grandma Chen. She lives in Taipei. Her granddaughter Mei is six, and lives in San Francisco.
>
> Last year, for Mei's birthday, Grandma sent a wire. A bank form, fees nobody explained, a week of waiting.
>
> **Grandma never got to see what it bought.**

**Slide 3, "Distance is lonely"**

> Being far away is lonely. What helps isn't calling more. It's feeling close.

**Slide 5, "Grandparents already give"** *(a few seconds)*

> Grandparents already give. But a bank can take almost fifteen percent on the way.

**Slide 6, "Give a Saturday, not a transfer"**

> So instead of a transfer, what if Grandma could give a moment? A Saturday at the movies. Swim lessons. A night off for tired parents.

**Slide 7, "Three steps, three people"**

> Grandma picks a gift. PayPal moves the money. Mei says thank you.

**Slide 8, "Let me show you"**

> Let me show you.

*Switch to the app.*

---

## 3. Demo: the app (0:50–2:25)

**Start page → "Open as Grandma Chen"**

> This is Grandma's side. Everything is in Chinese, her language.

**Tap a suggestion, like 博物館一年會員 (a museum year)** *(cut the wait in editing)*

> She can ask for ideas. The AI knows Mei's age and city, and suggests gifts that fit. It can suggest, but it can never pay. Only Grandma can.

**Open 讓爸媽放一晚假 (a night off for the parents) → amounts → tap "PayPal 手續費 ›"**

> She picks an amount. No fours: in Taiwan, four sounds like a bad word. Small thing, **but it says "we thought about you."**
>
> **And before she pays, she sees every fee.**

**用 PayPal 付款 → PayPal checkout → approve** *(cut the login)* **→ Sent screen, heart travels to Mei**

> She pays in Taiwan dollars, on PayPal. And the receipt shows PayPal's actual fee, the exchange rate, and exactly what Mei's family got.

**Back → "Open as Grandpa Kenji" → 土曜日は映画へ (Saturday at the movies)**

> Grandpa Kenji in Tokyo gave to the same gift, in yen. **Two grandparents, two countries, one gift.** Each one only sees what they gave. **No scoreboard.**

**Back → "Open as Mei" → Say thank you → record a few seconds → send**

> Mei sees one gift from both of them. She records one little thank-you… and the heart goes back to both.

**Back → "Open as Grandma Chen": Mei waving, 新的 (New) → press play**

> On Grandma's phone, it's waiting, translated into Chinese, calling her 阿嬤, the way Mei does.
>
> **That's the moment this whole thing is for.**

*Switch back to the deck, slide 9.*

---

## 4. How it's built, then close (2:25–2:50)

**Slide 9, "Three pieces, in plain words"** *(about 10 seconds)*

> Under the hood: PayPal moves the money and tells us the exact fee. AI suggests gifts and translates, but never pays. And it's one web app that works on any phone.

**Jump to slide 14, "Thoughtful gifts from grandparents abroad"** *(skip 10–13; they're for judges reading the deck)*

> Thought is live, and the code is open. Because the people who love our kids from far away deserve to see their love land.

*Optional: back on camera.*

> Thanks for watching.

---

## Set up before recording (5 minutes)

1. **Reset the demo:** open the app's start page and click "Start the demo over" at the bottom.
2. **Phone-size window for the app:** in Chrome, open Developer Tools (⌥⌘I) → device toolbar (⌘⇧M) → iPhone 14 Pro Max. Or use your iPhone's screen recorder.
3. **Pay for a gift that isn't full yet**, like 讓爸媽放一晚假 (a night off for Mei's parents). The movie gift is already fully given.
4. **Have the Taiwan sandbox login ready.** Cut the typing out when you edit.
5. **Camera and mic:** good light for your face and for Mei's thank-you.
6. **No music,** unless it's royalty-free.
7. **Keep it under 3:00.** If you run long, skip slide 5 and shorten the AI ask. If the live demo breaks, use slides 16–18 (the demo screens) instead.

## After recording

1. Tell Claude "recorded". It will save the demo state (`npm run demo:snapshot`), so judges see your thank-you.
2. Upload to YouTube as **Public** or **Unlisted**. Title: "Thought: thoughtful gifts from grandparents abroad (PayPal AI Hackathon 2026)".
3. Paste the YouTube link into Devpost (Project details → video, at the bottom) and send it to Claude for the README.
