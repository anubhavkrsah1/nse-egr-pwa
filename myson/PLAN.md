# mySon — AI Companion for Elderly Parents Living Alone

## Context

**The problem.** Roughly 30 million Indians over 60 live alone or with only another elderly person — about 20% of the elderly population, higher in cities (21.6%) than villages (18.3%), and skewed toward women. Nuclear households passed 52% of all Indian households in the 2011 census and joint families have kept shrinking since. The children moved to Bengaluru, Dubai, or New Jersey. The parents stayed.

What those parents lose is not primarily medical. It is the small daily scaffolding a live-in child provides: someone who notices the BP tablet wasn't taken, who says "go for your walk now," who calls at 7pm, and who would know within minutes if there were a fall.

**What exists today, and the gap.** Indian eldercare splits into two camps that leave a large hole between them:

| Service | What it is | Price | Gap it leaves |
|---|---|---|---|
| [Emoha](https://emoha.com/plans) | Human caregivers, emergency response, home visits | ₹15,000–45,000/mo | Priced for the affluent NRI child |
| [Anvayaa](https://anvayaa.com/care-plans/) | Care managers, health + daily assistance | ₹10,000–30,000/mo | Same |
| [Samarth](https://careforamma.com/guides/elder-care-services-comparison/) | Membership eldercare, NRI-focused | Thousands/mo | Same |
| [Khyaal](https://www.khyaal.com/) | Community app — games, workshops, senior smart card | ₹999–1,499/**year** | Cheap, but it is a *community*, not a companion. Nothing proactive, nothing personal, no emergency path |
| GoodFellows | Human "grandchild" companions, in-person visits | Per-visit | Doesn't scale, city-limited, not 24/7 |
| [ElliQ](https://www.intuitionrobotics.com/post/announcement-commercial-availability-of-elliq) (US) | AI companion robot, proactive conversation | $250 setup + $30–40/mo (₹2,700–3,600/mo) | Closest analogue in the world — English-only, US-only, hardware-gated |

**The hole:** there is no proactive, Hindi-speaking, voice-first AI companion in India at a price a middle-class family will pay without thinking about it. Emoha at ₹15,000 is a decision. mySon at ₹399 is not.

**The differentiated hook.** The companion is not a generic assistant. It carries the name, voice, and likeness of the user's own son or daughter. A reminder from "Rohit" lands differently than a reminder from a chatbot. That single framing decision is the product.

**Business model.** The parent uses it; the child pays for it. The child is the buyer with the credit card, the smartphone literacy, and the guilt. The parent is the user who must never see a payment screen. Phase 2 is a companion app for the child — a daily digest of how their parent actually is.

---

## Decisions locked with the user

| Decision | Choice |
|---|---|
| Pricing | **₹399/mo** — unlimited reminders, ~15 min/day of free-form conversation |
| Avatar | **Stylized illustration** generated from an uploaded photo, animated with audio-driven lip-sync/blink |
| Platform | **Native Android first** — reliable alarms, on-device wake word, telephony access for emergencies |
| Build path | **Scenario A** — solo with Claude Code, ~₹75,000, 10–14 weeks to beta |

---

## Product scope

### v1 — the four things that must work

**1. Proactive reminders (the core loop, and the cheapest feature to run).**
Medicine, meals, walk, water, BP check, doctor appointments, festivals, birthdays. The avatar speaks: *"Papa, saade aath baj gaye — blood pressure ki goli le lijiye."* Parent replies by voice: *"le li"* / *"thodi der mein."* Snoozes escalate; a second miss notifies the child.

This is where the "suggest what to do at what time" ask lives — a daily rhythm the app proposes and adapts: morning walk before the heat, a call to a friend mid-morning, rest after lunch, evening bhajan or news, wind-down at night.

**2. Free-form companionship.** Open conversation in Hindi, English, or Hinglish. Reminiscence prompts ("Papa, aapki pehli naukri kaisi thi?"), news, cricket, jokes, help composing a WhatsApp voice note to a grandchild. Remembers across days — the neighbour's name, the knee that hurts, that Tuesday's doctor visit went badly.

**3. Emergency.** A large always-visible red button, plus voice triggers ("madad," "help," "main gir gaya"), plus a passive check: if the parent doesn't respond to any prompt for N hours, escalate. On trigger, a cascade: call the child → second contact → third contact, with SMS containing location and a plain-language description, and a speakerphone line held open so the parent can talk hands-free from the floor.

**4. Phone-number login.** OTP only. No email, no password. Set up once by the child during onboarding; the parent should never authenticate again.

### Explicitly out of scope for v1

Medical diagnosis or advice. Medication *dispensing*. Fall detection from sensors (accelerometer fall detection is unreliable and false alarms destroy trust — v1 uses button + voice + silence). Video calling. Payments by the parent. English-only markets.

### v2+ — the expansion ladder

The child's app (digest of parent's mood, adherence, activity — this is what turns a ₹399 subscription into a retained one). Vernacular expansion: Marathi, Bengali, Tamil, Telugu, Gujarati, Punjabi. Doctor-report export. Pharmacy refill integration. NRI tier with local-time-zone-aware calling. A "two parents, one subscription" plan.

---

## Model routing — which model does what, and why

This is the heart of the cost design. The counterintuitive finding: **the LLM is the cheapest part of the stack.** Speech-to-text and text-to-speech dominate. Optimising the LLM alone is optimising the wrong thing — but the routing below still cuts LLM spend by roughly 80% versus naively calling one strong model for everything.

### The routing table

| Layer | Handler | Why |
|---|---|---|
| **Wake word** ("Beta, suno") | On-device (Porcupine / openWakeWord) | Never send audio to a server to decide if the user is talking. Zero cost, zero latency, and a privacy story you can defend. |
| **Reminder acknowledgements** — "le li", "haan", "baad mein", "abhi nahi" | **No LLM.** Keyword + regex match on the Hindi/English transcript | This is ~50% of all daily interactions and it is a closed set of maybe 40 phrases. Spending model tokens here is pure waste. Falls through to Haiku only on no-match. |
| **Everyday conversation** (the workhorse) | **`claude-haiku-4-5`** — $1/$5 per Mtok, 200K context | Fastest and cheapest current model. Companionship talk is warm, short-turn, low-reasoning. Haiku is more than sufficient and the latency difference is felt in a voice UI in a way it is not in chat. |
| **Distress / escalation triage** — fired only when the conversational layer flags fall language, chest pain, sustained low mood, confusion, or talk of self-harm | **`claude-sonnet-5`** — $3/$15 ($2/$10 introductory through 2026-08-31) | Judgment matters here and errors are expensive in both directions (missing a real emergency; crying wolf and training the family to ignore alerts). Volume is a fraction of a percent of turns, so the cost impact is negligible. Buy the better judgment where it counts. |
| **Nightly memory consolidation** — compress the day's turns into a durable memory digest | **`claude-sonnet-5` via the Batch API** (50% off, runs ~3 AM) | Not latency-sensitive, so there is no reason to pay real-time rates. Batches are exactly this workload. |
| **Child's daily/weekly digest** | Same nightly batch job | One extra output per parent per day, generated from the already-loaded context. |
| **Anything in the runtime path** | **Never Opus** | `claude-opus-5` at $5/$25 has no place in a ₹399/mo product's hot path. Reserve it for offline work by your team: writing the persona prompts, authoring evals, analysing failure transcripts. |

### Haiku 4.5 configuration notes (non-obvious, will bite you)

- **`effort` is not supported on Haiku 4.5** — it errors. Do not carry an `output_config.effort` setting over from Sonnet/Opus code.
- **Haiku 4.5 uses the older thinking API** — `thinking: {"type": "enabled", "budget_tokens": N}`, not adaptive thinking. For the conversational path, **leave thinking off entirely.** It adds latency and cost for zero benefit on "how was your day."
- **Haiku 4.5's minimum cacheable prefix is 4,096 tokens.** This is the single most important caching fact for this app, and it is not intuitive — the minimum is *not* monotonic across models (Opus 5 caches from 512 tokens, Sonnet 5 from 1,024, Haiku 4.5 from 4,096). A tidy 800-token system prompt will silently not cache at all: no error, just `cache_creation_input_tokens: 0` and a full-price bill on every turn. Design the cached prefix to comfortably exceed 4K — persona + family facts + medication schedule + memory digest + few-shot style examples gets there naturally. If it doesn't, pad it with genuinely useful content rather than filler.

### Prompt caching design

Render order is `tools` → `system` → `messages`, and caching is a **prefix match** — one byte changed anywhere invalidates everything after it. So order by stability:

```
[STABLE — cached, must exceed 4,096 tokens]
  persona: son/daughter name, relationship, speaking style, voice
  family facts: spouse, grandchildren, neighbours, hometown
  medical: conditions, medication schedule, doctor, allergies
  long-term memory digest (rewritten nightly, not per-turn)
  few-shot examples of the right tone in Hindi/Hinglish
  <-- cache_control breakpoint here
[VOLATILE — never cached]
  current date and time
  today's reminder status
  recent conversation turns
```

**The trap to avoid:** interpolating the current time into the system prompt. In a reminders app the model needs to know the time, and the obvious place to put it is the top of the system prompt — which invalidates the cache on **every single turn** and quietly triples your LLM bill. Time goes in the user turn, after the breakpoint. Always.

Use the default 5-minute TTL within a conversation session. Do not use the 1-hour TTL (2× write cost) or run scheduled re-warms — usage here is a handful of short bursts a day, and paying a fresh cache write per session is cheaper than keeping an hour-long cache alive between them.

**Verify it works:** log `usage.cache_read_input_tokens` on every call. If it is zero across repeated turns in a session, a silent invalidator is in the prefix. Note that `input_tokens` reports only the *uncached remainder* — total prompt size is `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`.

### Latency

In a voice UI, perceived latency is time-to-first-audio, not time-to-full-response. The lever is not the model:

1. **Stream the LLM response** and cut at the first sentence boundary.
2. **Send that first sentence to TTS immediately** while the rest is still generating.
3. Play it. The parent hears a reply in well under a second; the remainder streams in behind.

Fast mode is not applicable here — it is Opus 5 / Opus 4.8 only, and at $10/$50 per Mtok it is the wrong direction for this product entirely.

---

## Cost model — the honest arithmetic

Indian-language speech APIs, using [Sarvam AI](https://www.sarvam.ai/api-pricing) as the reference (₹30/hr STT, ₹15 per 10K characters TTS):

| Component | Per user per month | Notes |
|---|---|---|
| STT | ~₹75 | ~5 min/day of *parent* speaking (a 15-min conversation is mostly the app talking) |
| TTS — free-form replies | ~₹180 | ~4,000 chars/day |
| TTS — reminders | **~₹0** | The critical optimisation, below |
| LLM (Haiku 4.5, cached) | ~₹70 | ~1,200 turns/mo. Cheapest line item on the sheet |
| Infra, storage, SMS, gateway | ~₹40 | |
| **Total variable** | **~₹365** | |
| **Price** | **₹399** | Thin at launch; improves with bulk speech rates and scale |

### The reminder-audio optimisation

Reminders are templated and repeat daily: *"Papa, dawai ka time ho gaya."* Sending that to a TTS API 6× a day, 30 days a month, for every user, is paying repeatedly for identical audio.

**Generate each reminder's audio once at setup, cache the file on device, replay forever.** Marginal cost drops to zero, playback works with no network, and latency is instant. Only genuinely novel speech — free-form conversation — costs money. This is what makes "unlimited reminders" affordable at ₹399, and it is why the reminders tier can be given away free as an acquisition funnel if you want one.

Free-form conversation is metered against the ~15 min/day allowance; reminders and emergency are never metered.

---

## Architecture

```
┌─ Parent's Android phone ────────────────────┐
│  Wake word (on-device)                      │
│  Avatar renderer + lip-sync                 │
│  Cached reminder audio  ← zero-cost replay  │
│  Local reminder scheduler (AlarmManager)    │
│  Emergency button → telephony cascade       │
└───────────────┬─────────────────────────────┘
                │ (only free-form turns)
┌───────────────▼─────────────────────────────┐
│  Backend                                    │
│  ├ STT  (Sarvam / equivalent Indic)         │
│  ├ Intent match  → no LLM for 50% of turns  │
│  ├ claude-haiku-4-5  → conversation         │
│  ├ claude-sonnet-5   → escalation only      │
│  ├ TTS  (streamed, sentence-chunked)        │
│  └ Postgres: profiles, schedule, memory,    │
│              transcripts, escalation log    │
└───────────────┬─────────────────────────────┘
                │ nightly batch (Sonnet 5, 50% off)
┌───────────────▼─────────────────────────────┐
│  Memory consolidation + child's digest      │
└─────────────────────────────────────────────┘
```

**Auth.** Phone OTP via Firebase Phone Auth or MSG91. The child authenticates once during onboarding and configures the parent's device; the parent's session persists indefinitely and never shows a login screen again.

**Payments.** Razorpay Subscriptions on **UPI Autopay** — the correct rail for low-ticket recurring collection in India. Billed to the child's account. At ₹399 you are far under the RBI ₹15,000 additional-factor-authentication threshold, but you still owe the 24-hour pre-debit notification. The parent's app must contain no payment surface at all — not even a "manage subscription" link, which is a social-engineering vector against exactly this demographic.

**Data.** Under the DPDP Act 2023 the **parent** is the data principal, not the paying child. Consent must be collected from the parent, in their language, spoken aloud — not buried in a checkbox the child ticks. Conversation content and health mentions are sensitive.

**The dignity constraint on the child's digest:** send the child *summaries and signals*, never raw transcripts. An elderly person confiding that they feel like a burden should not have that sentence forwarded verbatim to their son. Give the parent a spoken way to mark something private ("yeh Rohit ko mat batana") and honour it. Get this wrong and the product becomes surveillance wearing a friendly face — which is both an ethical failure and, eventually, a churn event when the parent works out what is being reported.

**Emergency, stated honestly.** This is not a medical device and not a monitored personal emergency response service. It notifies a cascade of contacts; it does not dispatch an ambulance and no one is watching a screen at 3 AM. Say so plainly in onboarding, to both parent and child. Overpromising here is the fastest way to a lawsuit and the slowest way to a refund.

---

## Build sequence

1. **Persona + voice prototype.** Before any app: a Hindi/Hinglish system prompt and a chosen TTS voice, tested with 5–10 real elderly users over a phone call. Does "my son is talking to me" land, or does it feel eerie? This single question decides whether the product exists. Do not write app code until you know.
2. **Reminder engine.** Local scheduler, pre-generated cached audio, voice acknowledgement via keyword match, escalation on miss. No LLM anywhere in this milestone. This alone is a shippable product.
3. **Conversation.** Haiku 4.5 with the cached-prefix design, streaming to sentence-chunked TTS. Instrument `cache_read_input_tokens` from the first commit.
4. **Avatar.** Photo upload → stylized portrait generation at onboarding, audio-amplitude-driven lip-sync and blink. Explicit likeness consent from the child during upload.
5. **Emergency.** Button, voice triggers, silence detection, contact cascade, speakerphone hold-open.
6. **Auth + payments.** Firebase OTP, Razorpay UPI Autopay, child-side onboarding flow.
7. **Memory + digest.** Nightly Sonnet 5 batch job, privacy filter, child's summary.
8. **Child's companion app** (v2).

---

## Build process

The workflow below is adapted from the vibe-coding process in the reference video, with the deviations that matter for this app called out. **No design work happens yet** — step 3 is deferred until you say go.

**1. Plan before building.** "Give me the full plan. Do not build first." This document is that step. Confirming features and screens up front is the single largest token saving in the whole build — every hour of planning avoids a day of generated code you throw away.

**2. Feed it the competitors.** Give Claude Code the URLs for Emoha, Khyaal, Anvayaa, and ElliQ so it can crawl them and reason about feature parity and positioning rather than inventing from scratch. Their pricing pages in particular are the anchor for our ₹399.

**3. Front-end first, back-end second — DEFERRED.** The intended flow is: generate a feature-only prompt (no design direction, so the design tool has creative freedom), attach one reference image for style direction, produce the screens, then export and hand the files to Claude Code to build the back end against. Holding here until you're ready.

For mySon specifically, the design brief will be unusual and worth writing carefully: the user is 70+, possibly with cataracts, tremor, and no smartphone confidence. That means very large type, extremely high contrast, huge tap targets, almost no chrome, and one primary action per screen. Most design references you'd pull from Dribbble are actively wrong for this audience — dense dashboards, thin fonts, subtle greys. Pick the reference accordingly.

**4. Confirm the stack before it writes code.** Point Claude Code at the exported design files, ask for a back-end plan and the tech stack, and approve it before building. The reference stack (Expo React Native + Next.js + Supabase) mostly carries over, with one significant exception below.

**5. Multi-agent model routing for the build.** Distinct from the runtime routing earlier in this document — this is which model writes the code:

| Build task | Model | Why |
|---|---|---|
| Architecture, schema design, code review, final check | `claude-opus-5` | Highest-leverage decisions, where a bad call costs a week |
| Screen implementation, CRUD, wiring, boilerplate | `claude-sonnet-5` | Bulk of the work, far cheaper, plenty capable |
| The voice pipeline (streaming STT→LLM→TTS, barge-in) | `claude-opus-5` | Hardest concurrent code in the app; do not cheap out here |

Ask it to state which agent handles which task **and why** before it starts. Not ceremony — it's how you catch a bad plan while it's still a paragraph instead of a pull request.

**6. ⚠️ Expo Go will not work for this app.** This is the big deviation from the reference workflow. Scanning a QR code into Expo Go is a lovely preview loop, and it breaks the moment you add a native module — which mySon needs on day one for wake word, foreground services, exact alarms, and telephony. Budget from the start for an **EAS development build** installed on a real device. The iteration loop is slightly slower (a rebuild when native deps change; JS-only changes still hot-reload) and you should plan for it rather than discover it in week three.

**7. Iterate by screenshot.** When a screen is wrong, screenshot it, annotate what's broken, send the image back. Faster and far more accurate than describing a layout bug in prose.

**8. Animations via Lottie JSON.** Free tier is sufficient. For mySon the useful ones are the avatar's listening/speaking/thinking states, the reminder acknowledgement, and the emergency-activated confirmation. Keep them calm — this is a companion for an anxious 75-year-old, not a fintech app. No bouncing, no confetti.

**9. Verify data actually lands.** Open the Supabase table editor and confirm rows are being written before trusting the UI. A screen that renders correctly from local state while writing nothing to the database is the most common silent failure in a generated app.

## Connectors and accounts to set up

| Service | Purpose | Connector | Cost |
|---|---|---|---|
| **Anthropic API** | Runtime LLM calls (separate from your Claude subscription) | API key in `.env` — **never** paste a key into chat | Pay-per-use |
| **Supabase** | Postgres, auth, storage | **MCP connector** — lets Claude create and manage tables directly | Free tier → $25/mo Pro |
| **Sarvam AI** | Hindi STT + TTS | REST | ₹1,000 free credits, then pay-per-use |
| **Firebase / MSG91** | Phone OTP | REST | Free tier, then ~₹0.15–0.25/SMS |
| **Razorpay** | UPI Autopay subscriptions | REST (no official MCP) | ~2% + GST per transaction |
| **Google Play** | Distribution | — | $25 one-time |
| **Expo EAS** | Native dev builds and releases | CLI | Free tier → $99/mo if you need heavy build volume |
| **GitHub** | Version control | MCP connector | Free |

Set up the Supabase MCP connector before the back-end step — it's the one that meaningfully changes the workflow, letting Claude provision schema instead of you clicking through the dashboard.

*Note: several MCP connectors in this session are currently disconnected, and one requires authorization that can't be completed from a non-interactive session. If you want me driving connectors directly, authorize them via your claude.ai connector settings first.*

## Cost to build

Two things dominate and neither is the AI: **real Android test devices** and **your time**. The reference video's receipt scanner is a genuine weekend build — camera, one API call, a table, a list view. mySon is a different weight class: a real-time bidirectional voice pipeline, OEM-hostile background alarms, telephony, a two-sided account model, and health-adjacent compliance. Plan for **10–14 weeks to a testable beta**, not a weekend.

### Scenario A — solo, Claude Code, beta in 10–14 weeks

| Item | Cost |
|---|---|
| Claude Code (Max 5×, ~3.5 months) | ₹31,000 |
| Anthropic API credits (dev + testing) | ₹4,500 |
| Sarvam STT/TTS testing credits | ₹4,000 |
| Google Play developer account | ₹2,200 |
| Domain + landing page | ₹2,000 |
| Supabase / EAS / Firebase | ₹0 (free tiers) |
| **2–3 cheap real Android phones** (Xiaomi, Samsung, Realme) | ₹30,000 |
| **Total** | **≈ ₹75,000** (~$850) |

The test phones are not optional and are the line item people cut first. Xiaomi, Oppo, Vivo, and Samsung each kill background processes differently and aggressively. An emulator will tell you your reminders work. A ₹9,000 Redmi will tell you the truth.

#### Executing Scenario A — de-risking the solo path

**Chosen.** The one real risk this path carries is the native Android layer: wake word, foreground services, exact alarms, telephony. It's where generated code most reliably produces something that looks correct, passes in an emulator, and silently fails on a real handset three days later. Two things largely neutralise it without breaking the ₹75,000 budget:

**1. Reorder the build — spike the riskiest thing in week 1.** The build sequence earlier in this document starts with the persona prototype, which is right for validating the *product*. For a solo build, run a second track in parallel that validates the *platform*, and do it before writing anything real:

> Build a throwaway app that does exactly one thing — play an audio file at a scheduled time. No UI beyond a time picker. Install it on a real Redmi and a real Samsung, enable battery optimisation, don't touch the phones, and leave them for 72 hours across several scheduled fires.

If the audio plays every time, the project is viable solo and you proceed with confidence. If it doesn't, you have learned the single most important thing about this build in week 1 for the price of two phones — instead of in week 10, having built an avatar and a voice pipeline on top of a foundation that drops reminders. Everything else in mySon is ordinary app work. This is the part that isn't.

**2. Buy review hours, not build weeks.** Scenario B's ₹1.5–3 lakh assumed a contractor *building* the native layer. A cheaper variant: build it yourself, then pay a senior Android developer for 3–4 hours to review your `AlarmManager` setup, foreground service, wake lock handling, and OEM whitelisting prompts. Roughly ₹15,000–20,000, keeps you inside Scenario A's envelope, and catches most of what would otherwise surface as a support ticket from a family whose father missed his BP tablet.

**Immediate shopping list (~₹40,000 to start):**

| Item | Cost | When |
|---|---|---|
| 2 real Android phones — one Xiaomi/Redmi, one Samsung, both budget tier | ₹30,000 | Now, before anything else |
| Claude Code (Max 5×), month 1 | ₹8,800 | Now |
| Anthropic API credits (start small, top up) | ₹2,000 | Before the conversation milestone |
| Sarvam account | ₹0 (₹1,000 free credits) | Before the voice prototype |
| Supabase, Firebase, Expo EAS, GitHub | ₹0 (free tiers) | At the back-end milestone |
| Google Play developer account | ₹2,200 | Before first release, not now |

Everything else in the Scenario A table accrues month by month — no reason to pay for it up front.

### Scenario B — solo + contract help for the native layer (recommended)

| Item | Cost |
|---|---|
| Everything in Scenario A | ₹75,000 |
| Contract Android dev, 4–6 weeks part-time (wake word, alarms, telephony, EAS) | ₹1,50,000–3,00,000 |
| Illustrator — avatar style + character sheet | ₹15,000–40,000 |
| User testing with real elderly Hindi speakers (incentives, travel) | ₹15,000 |
| **Total** | **≈ ₹2.5–4.3 lakh** (~$2,900–4,900) |

The native Android layer is where generated code most often produces something that looks right and silently fails on real hardware. Buying 4–6 weeks of someone who has shipped a foreground service before is the highest-return spend in this table.

### Scenario C — small team, production-ready in 4–5 months

| Item | Cost |
|---|---|
| Android dev + backend dev + part-time designer | ₹12,00,000–20,00,000 |
| Legal — DPDP privacy policy, emergency disclaimers, T&C | ₹50,000–1,00,000 |
| Infrastructure, tooling, devices, testing | ₹1,00,000 |
| **Total** | **≈ ₹15–22 lakh** (~$17,000–25,000) |

### Running cost after launch

Variable cost is ~₹365/user/month against ₹399 revenue (breakdown earlier in this document), plus ~₹15,000/month fixed for Supabase Pro, monitoring, and SMS.

| Users | Monthly revenue | Monthly cost | Gross margin |
|---|---|---|---|
| 100 | ₹39,900 | ₹51,500 | **−₹11,600** (loss) |
| 1,000 | ₹3,99,000 | ₹3,80,000 | ₹19,000 (thin) |
| 10,000 (with negotiated speech rates) | ₹39,90,000 | ₹22,00,000 | ₹17,90,000 |

**The economics only work at volume**, and the lever is bulk STT/TTS pricing — at 10,000 users you can negotiate 40–60% off list, which is what moves margin per user from ~₹34 to ~₹180. Below roughly 700 users you are subsidising every subscriber. Know that going in and don't mistake early traction for profitability.

**Break-even on Scenario B** (₹3.5 lakh build) lands around 2,300 user-months — roughly 700 users held for four months, or 200 users held for a year.

### The uncomfortable number

Scenario A's ₹75,000 does not include your salary for three months. If you'd otherwise be earning, the real cost of the solo path is ₹75,000 plus 3.5 months of opportunity cost — which likely exceeds Scenario B's total. Solo is cheaper in cash, not in value. Choose it because you want to learn the stack or retain full ownership, not because the spreadsheet says so.

## Verification

- **Cache health:** assert `cache_read_input_tokens > 0` on turn 2+ of every session in integration tests. This will catch the time-in-system-prompt regression the moment someone reintroduces it.
- **Cost per user:** dashboard tracking actual ₹/user/month against the ~₹365 model, broken out by STT / TTS / LLM. If TTS exceeds ~₹200 the reminder-audio cache has broken.
- **Reminder reliability:** the app must fire correctly through Doze mode, battery optimisation, and OEM task-killers (Xiaomi, Oppo, Vivo, Samsung are each independently hostile to background alarms). Test on cheap real devices, not an emulator. A missed medicine reminder is a product failure, not a bug.
- **Escalation quality:** a labelled corpus of Hindi/Hinglish distress phrases; measure both false-negative rate (missed emergency — catastrophic) and false-positive rate (alert fatigue — kills trust).
- **Latency:** time-to-first-audio under 1s on a mid-range Android phone on 4G.
- **Real users:** every milestone tested with actual elderly Hindi speakers, not with the team. This user group's failure modes — hearing, accent, patience with retries, fear of "breaking" the phone — are not intuitable from the inside.

---

## Open items

- **Repository.** This plan sits in `nse-egr-pwa`, an unrelated NSE e-gold-receipt PWA. mySon is greenfield and native Android; it should get its own repository. I can commit this document here on `claude/app-creation-steps-0oxv2y` as a placeholder, but the code should not live here.
- **Speech vendor.** Sarvam is the reference for pricing above and is the strongest Indic option, but benchmark it against ElevenLabs and Google STT/TTS for Hindi quality on *elderly* speech specifically — older voices, regional accents, and dentures all degrade ASR accuracy in ways standard benchmarks miss.
- **Voice cloning.** Using the child's actual voice would be a step-change in emotional impact and is technically available. It is also the highest-consent-risk feature in the product. Deferred deliberately — revisit only with explicit, revocable, recorded consent from the child and disclosure to the parent.
