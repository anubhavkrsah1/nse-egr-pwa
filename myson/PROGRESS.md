# mySon WhatsApp MVP — Build Progress

**Start date:** Aug 4, 2026  
**Timeline:** 4 days (Aug 4–7)  
**Blocker:** Meta setup (started: TBD)

---

## Day 1 (Aug 4) — Plumbing

**Milestone:** echo bot — say something, it repeats it back

**Tasks:**
- [ ] Scaffold Fastify + TypeScript server
- [ ] Create Supabase schema (parents, reminders, reminder_events, messages)
- [ ] Implement webhook verify handshake (GET /webhook with hub.challenge)
- [ ] Implement receive endpoint (POST /webhook, return 200 immediately)
- [ ] Idempotency guard (wa_message_id UNIQUE constraint)
- [ ] Send text reply to parent
- [ ] Send hardcoded voice note

**Verification:**
- [ ] Meta verify-token handshake passes
- [ ] Voice note in → voice note back (phone test)
- [ ] Text in → text back

---

## Day 2 — Intelligence

**Milestone:** real Hindi conversation that remembers earlier turns

**Tasks:**
- [ ] Sarvam STT integration (inbound audio)
- [ ] Sarvam TTS integration (outbound voice notes)
- [ ] Haiku 4.5 with cached persona prefix (4,096+ tokens)
- [ ] Modality routing (audio → TTS, text → text)
- [ ] STT-failure fallback

**Verification:**
- [ ] "Namaste, aaj main thoda thak gaya hoon" → reply acknowledges tiredness
- [ ] "maine abhi kya kaha tha?" → it recalls
- [ ] cache_read_input_tokens > 0 from turn 2

---

## Day 3 — Alerts

**Milestone:** reminder fires → tap button → logged. Miss twice → child gets message.

**Tasks:**
- [ ] Reminders schema (kind, label_hi, scheduled_time, days_of_week, audio_media_id)
- [ ] Pre-generate reminder audio via Sarvam (store media_id, reuse)
- [ ] Minute-by-minute cron job
- [ ] Quick-reply buttons (Le li / 10 min baad / Kaunsi?)
- [ ] Button intent mapping (NO LLM)
- [ ] Miss detection (30min overdue)
- [ ] Escalation to child's WhatsApp on 2nd miss

**Verification:**
- [ ] Reminder fires on time
- [ ] Button tap logged as acknowledged
- [ ] Two misses reach child

---

## Day 4 — Real people

**Milestone:** five real parents in conversation with it

**Tasks:**
- [ ] Onboard 5 families by hand in Supabase
- [ ] Coordinate recipient allowlisting (each must confirm code)
- [ ] Monitor logs for breakage
- [ ] Fix issues real-time

**Verification:**
- [ ] Replayed webhook payload → exactly one reply (idempotency)
- [ ] End-to-end latency under ~8s
- [ ] Five families talking, no crashes

---

## Blockers / Issues

### Meta setup (prerequisite)

- [ ] Facebook account exists
- [ ] Meta Business Account created
- [ ] Developer app created (type: Business)
- [ ] WhatsApp product added (auto-issues test phone number)
- [ ] PHONE_NUMBER_ID and WABA ID collected
- [ ] 5 recipients allowlisted (each confirms code)
- [ ] System User token generated (permanent, non-expiring)
- [ ] ngrok static domain claimed
- [ ] Webhook URL configured
- [ ] messages field subscribed
- [ ] Handshake verified (hello_world template sent and received)

---

## Notes

- **Pro plan strategy:** Sonnet 5 for architecture, Haiku 4.5 for boilerplate, never Opus on critical path
- **Caching critical:** Haiku 4.5 minimum 4,096 tokens or silently no-cache
- **STT risk:** Elderly speech accuracy is the unknown; test Day 4 with actual users
- **Parallel:** Run persona voice test (hand-record, send to 5 elderly people) in parallel with build
