# NSE Breakout Scanner

Scans a universe of NSE stocks every trading day at **2:00 PM IST** and delivers the
qualifying breakouts to your email and/or WhatsApp. It runs on GitHub Actions, so
nothing needs to be open on your machine.

## The strategy

A stock is reported only when **all four** conditions hold:

1. CMP is above the 30 DMA
2. CMP is above the 50 DMA
3. CMP is above the 200 DMA
4. CAR has risen on each of the last 10 sessions

CAR (cumulative average) is the running average of every close since the stock's
52-week high. A CAR that rises 10 sessions in a row means the stock has been closing
consistently above its own post-peak average — steady accumulation rather than a
one-day spike.

Results are sorted by distance from the 200 DMA, ascending, so the earliest-stage
breakouts appear first.

A stock is skipped when it has fewer than 200 sessions of history, when Yahoo returns
no data for the symbol, or when its 52-week high is newer than 10 sessions (there is
no CAR trend to measure yet). Skipped symbols are listed at the bottom of the email.

## What you receive

- **Email** — an HTML table of the breakouts, the conditions applied, the list of
  skipped symbols, and `Final_Breakout_List.xlsx` attached.
- **WhatsApp** — a short text summary: symbol, price, and % above the 200 DMA, capped
  at 25 rows so it stays readable on a phone.

You get a message every trading day, including days when nothing qualifies — so
silence always means something broke, never "no breakouts today".

## Setup

The scan is already scheduled. It will not deliver anything until you add the secrets
for at least one channel.

Go to **Settings → Secrets and variables → Actions → New repository secret** in this
repo and add the ones you need.

### Email (Gmail)

Gmail rejects your normal password over SMTP. Create an App Password instead:
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
(requires 2-Step Verification to be on). Copy the 16-character password.

| Secret | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | the 16-character App Password (not your Google password) |
| `EMAIL_TO` | where to send it — comma-separate for several recipients |
| `EMAIL_FROM` | optional; defaults to `SMTP_USER` |

For Outlook use `smtp.office365.com` with port `587`. Any SMTP provider works.

### WhatsApp — CallMeBot (free, personal use)

1. Save **+34 644 51 95 23** to your phone contacts as *CallMeBot*.
2. WhatsApp it: `I allow callmebot to send me messages`
3. It replies with your API key.

| Secret | Value |
|---|---|
| `CALLMEBOT_PHONE` | your number in international format, e.g. `+919876543210` |
| `CALLMEBOT_APIKEY` | the key from step 3 |

CallMeBot is a free personal service with no uptime guarantee. Use email as your
primary channel and treat WhatsApp as the convenience copy.

### WhatsApp — Twilio (paid, reliable)

| Secret | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | from the Twilio console |
| `TWILIO_AUTH_TOKEN` | from the Twilio console |
| `TWILIO_WHATSAPP_FROM` | e.g. `whatsapp:+14155238886` |
| `TWILIO_WHATSAPP_TO` | e.g. `whatsapp:+919876543210` |

If both WhatsApp providers are configured, CallMeBot is used.

## Verifying it works

Actions → **Daily Breakout Scan** → **Run workflow**. Tick **force** to bypass the
trading-day check if the market is closed right now. The run log prints the full
result, and the Excel file is attached to the run as a downloadable artifact even
when delivery fails.

Start with **dry_run** ticked to see the output without sending anything.

## Schedule details

The cron is `30 8 * * 1-5` — 08:30 UTC, which is 14:00 IST, Monday to Friday. India
does not observe daylight saving, so this stays fixed year-round.

NSE holidays are not in the cron. The scanner checks whether the NIFTY index printed
a bar for today and exits quietly if it did not, so no holiday calendar needs
maintaining.

Two GitHub behaviours worth knowing:

- Scheduled runs are queued, not guaranteed on the minute. Under load the start can
  slip 5–15 minutes. Prices are read at execution time, so a late run reports later
  prices — it is never stale.
- GitHub disables scheduled workflows in repos with no activity for 60 days, and
  emails you when it does. Any push re-enables them.

Because 2 PM is inside market hours (NSE closes at 3:30 PM), the latest bar is the
in-progress daily candle. CMP is the live price and the DMAs include today's partial
close, which is the intended behaviour for an intraday scan — but a signal at 2 PM can
still invalidate itself by close.

## Changing the stock list

Edit `tickers.py`. Symbols use Yahoo's convention: the NSE symbol plus `.NS`.

To check that every symbol still resolves — companies get renamed, merged and
demerged — run the scan with `--validate`, which lists everything Yahoo could not
return usable history for.

## Running locally

```bash
cd scanner
pip install -r requirements.txt

python run_daily.py --dry-run    # scan and print, send nothing
python run_daily.py --validate   # list unresolvable symbols
python run_daily.py --force      # scan and deliver, ignoring the holiday check
python scan.py                   # just the table, no delivery
```

Local delivery reads the same environment variables:

```bash
export SMTP_HOST=smtp.gmail.com SMTP_USER=you@gmail.com \
       SMTP_PASS=your-app-password EMAIL_TO=you@gmail.com
python run_daily.py --force
```

## Tests

```bash
python test_scan.py     # strategy logic and report rendering
python test_notify.py   # delivery channels and the trading-day check
```

Both run fully offline against synthetic price series and stubbed HTTP, so they need
no credentials and no market data.

## Files

| File | Purpose |
|---|---|
| `tickers.py` | the stock universe |
| `scan.py` | data fetching and the strategy |
| `report.py` | Excel, HTML email and text summary rendering |
| `notify.py` | email and WhatsApp delivery |
| `run_daily.py` | entry point: trading-day check → scan → deliver |
| `../.github/workflows/breakout-scanner.yml` | the 2 PM IST schedule |

---

This is an automated technical screen for personal research. It is not investment
advice, and the conditions above say nothing about fundamentals, liquidity, news or
position sizing.
