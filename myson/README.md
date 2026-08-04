# mySon — 4-Day WhatsApp MVP

AI companion for elderly Indian parents, built with WhatsApp Cloud API, Haiku 4.5, and Sarvam speech services.

## Setup

### Prerequisites

- Node.js 18+
- Supabase account (free tier OK)
- Meta Business Account with WhatsApp API access
- Anthropic API key (Claude Haiku 4.5)
- Sarvam API key (STT/TTS)
- ngrok (for local webhook exposure)

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required variables:
   - `PHONE_NUMBER_ID` — from Meta WhatsApp API Setup page
   - `WHATSAPP_API_TOKEN` — System User permanent token
   - `WEBHOOK_VERIFY_TOKEN` — any random string you invent
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` — from Supabase project settings
   - `ANTHROPIC_API_KEY` — from Anthropic console
   - `SARVAM_API_KEY` — from Sarvam dashboard

### Database Setup

1. In your Supabase dashboard, run the SQL from `src/db/init.ts` to create tables
2. Or run: `npm run db:init` (logs the SQL to copy-paste)

### Installation

```bash
npm install
npm run build
```

### Development

```bash
npm run dev
```

This starts the server on `http://localhost:3000`.

### Webhook Setup

1. Expose your local server via ngrok:
   ```bash
   ngrok http 3000
   ```

2. In Meta App Dashboard → WhatsApp → Configuration → Webhook:
   - Callback URL: `https://your-ngrok-url/webhook`
   - Verify Token: (paste your WEBHOOK_VERIFY_TOKEN)
   - Subscribe to: `messages`

3. Test with:
   ```bash
   curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
   ```

## Architecture

### Day 1 — Plumbing
- Webhook verify handshake
- Receive text and audio messages
- Idempotency guard (wa_message_id UNIQUE)
- Echo bot response

### Day 2 — Intelligence
- Sarvam STT (inbound audio)
- Haiku 4.5 with cached persona
- Modality routing (audio → voice, text → text)
- Conversation memory

### Day 3 — Alerts
- Minute-cron reminder engine
- Pre-generated audio (Sarvam TTS)
- Quick-reply buttons
- Escalation to child on missed reminders

### Day 4 — Real People
- Onboard 5 families manually in Supabase
- Monitor and fix issues

## Database Schema

```sql
parents — parent profiles
  id, wa_id, parent_name, child_name, child_wa_id, voice_id, language, reply_mode

reminders — daily reminders
  id, parent_id, kind, label_hi, scheduled_time, days_of_week, audio_media_id, active

reminder_events — reminder history
  id, reminder_id, fired_at, acknowledged_at, ack_method, status

messages — message log
  id, parent_id, wa_message_id (UNIQUE!), direction, transcript, modality
```

The `wa_message_id UNIQUE` constraint is the idempotency guard — WhatsApp redelivers on any failure.

## Cost

| Item | Cost | Note |
|---|---|---|
| Claude Pro | ₹1,760/mo | Can't buy 4 days; this is the monthly charge |
| Anthropic API credits | ₹440 | $5 minimum; you'll use ~₹45 for the MVP |
| Sarvam (STT/TTS) | ₹0 | ₹1,000 free credits covers dev + 5 families for days |
| Supabase | ₹0 | Free tier |
| WhatsApp (test number) | ₹0 | No charges |
| Hosting (ngrok) | ₹0 | Free for 4 days; laptop must stay awake |
| **Total** | **≈ ₹2,200** | |

## Verification Checklist

- [ ] Meta verify-token handshake passes
- [ ] Text in → text back
- [ ] Voice note in → voice note back (phone test)
- [ ] Button tap → acknowledged, no LLM in logs
- [ ] "Namaste, aaj thoda thak gaya" → reply acknowledges tiredness (Day 2)
- [ ] "Maine abhi kya kaha?" → it recalls (Day 2)
- [ ] Replayed webhook → exactly one reply (idempotency)
- [ ] cache_read_input_tokens > 0 from turn 2 (Day 2)
- [ ] Reminder fires on time (Day 3)
- [ ] Two misses reach child (Day 3)
- [ ] End-to-end latency under 8s (Day 4)

## References

- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Anthropic API](https://docs.anthropic.com)
- [Sarvam Speech](https://sarvam.ai)
- [Supabase](https://supabase.com)
