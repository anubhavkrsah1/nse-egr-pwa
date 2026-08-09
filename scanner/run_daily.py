"""Daily entry point: check the market is open, scan, and deliver the report.

Run manually:
    python run_daily.py            # skips quietly on a market holiday
    python run_daily.py --force    # scan regardless of the holiday check
    python run_daily.py --dry-run  # scan and print, deliver nothing
    python run_daily.py --validate # report which symbols Yahoo cannot resolve
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
import yfinance as yf

import notify
import report
from scan import advanced_stock_scanner
from tickers import NSE_TICKERS

IST = ZoneInfo("Asia/Kolkata")
# NIFTY 50 index - our proxy for "was there a session today?"
MARKET_INDEX = "^NSEI"
OUTPUT_DIR = Path(__file__).parent / "output"

log = logging.getLogger("run_daily")


def is_trading_day(today: datetime) -> bool:
    """True when the NIFTY index has printed a bar for today's IST date.

    This catches NSE holidays without maintaining a holiday calendar: on a
    holiday the newest available bar belongs to an earlier session.
    """
    if today.weekday() >= 5:  # Saturday or Sunday
        return False

    try:
        index = yf.download(
            MARKET_INDEX,
            period="10d",
            interval="1d",
            auto_adjust=False,
            progress=False,
        )
    except Exception:
        log.exception("Could not fetch %s; assuming the market is open", MARKET_INDEX)
        return True

    if index is None or index.empty:
        log.warning("No data for %s; assuming the market is open", MARKET_INDEX)
        return True

    last_session = pd.Timestamp(index.index[-1]).date()
    return last_session == today.date()


def validate_symbols() -> int:
    """Print the symbols Yahoo returns no usable history for. Returns how many failed."""
    result = advanced_stock_scanner(NSE_TICKERS)
    if result.skipped:
        print(f"\n{len(result.skipped)} symbol(s) produced no usable result:")
        for ticker in result.skipped:
            print(f"  {ticker}")
    else:
        print("\nAll symbols resolved.")
    print(f"\n{result.scanned} of {len(NSE_TICKERS)} symbols evaluated successfully.")
    return len(result.skipped)


def main() -> int:
    parser = argparse.ArgumentParser(description="Daily NSE breakout scan and report")
    parser.add_argument("--force", action="store_true", help="ignore the trading-day check")
    parser.add_argument("--dry-run", action="store_true", help="do not send anything")
    parser.add_argument("--validate", action="store_true", help="list unresolvable symbols and exit")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if args.validate:
        validate_symbols()
        return 0

    now = datetime.now(IST)
    run_time = now.strftime("%d-%m-%Y %H:%M")

    if not args.force and not is_trading_day(now):
        log.info("%s is not an NSE trading day - nothing to send.", now.strftime("%d-%m-%Y"))
        return 0

    result = advanced_stock_scanner(NSE_TICKERS)

    excel_path = report.write_excel(result, OUTPUT_DIR / "Final_Breakout_List.xlsx")
    subject = report.subject(result, run_time)
    html = report.html_body(result, run_time)
    text = report.text_summary(result, run_time)

    print(subject)
    print()
    print(text)

    if args.dry_run:
        log.info("Dry run - nothing delivered.")
        return 0

    emailed = notify.send_email(subject, html, text, attachment=excel_path)
    whatsapped = notify.send_whatsapp(text)

    if not (emailed or whatsapped):
        log.error(
            "No delivery channel is configured. Set the SMTP_* / EMAIL_TO secrets "
            "for email, or the CallMeBot / Twilio secrets for WhatsApp."
        )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
