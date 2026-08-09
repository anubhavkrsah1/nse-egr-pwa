"""Offline tests for the delivery layer and the trading-day check.

No network and no real credentials are used: the HTTP client and the Yahoo
download are stubbed out.

Run with:  python test_notify.py
"""

from __future__ import annotations

import os
import sys
from datetime import datetime
from unittest import mock
from zoneinfo import ZoneInfo

import pandas as pd

import notify
import run_daily
import scan

IST = ZoneInfo("Asia/Kolkata")

# Every variable the delivery layer reads, so each test starts from a clean slate.
ALL_VARS = [
    "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_TO", "EMAIL_FROM",
    "CALLMEBOT_PHONE", "CALLMEBOT_APIKEY",
    "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "TWILIO_WHATSAPP_TO",
]


def clean_env(**overrides: str):
    env = {var: "" for var in ALL_VARS}
    env.update(overrides)
    return mock.patch.dict(os.environ, env, clear=False)


def check(name: str, condition: bool) -> bool:
    print(f"  {'PASS' if condition else 'FAIL'}  {name}")
    return bool(condition)


def index_frame(last_date: str) -> pd.DataFrame:
    index = pd.bdate_range(end=last_date, periods=10)
    return pd.DataFrame({"Close": range(10)}, index=index)


def main() -> int:
    ok = True

    print("Unconfigured channels are skipped, not errors")
    with clean_env():
        ok &= check("email skipped when unconfigured",
                    notify.send_email("s", "<p>h</p>", "t") is False)
        ok &= check("whatsapp skipped when unconfigured",
                    notify.send_whatsapp("t") is False)

    print("\nWhatsApp via CallMeBot")
    with clean_env(CALLMEBOT_PHONE="+919876543210", CALLMEBOT_APIKEY="123456"):
        with mock.patch.object(notify.requests, "get") as get:
            ok &= check("returns True", notify.send_whatsapp("hello") is True)
            params = get.call_args.kwargs["params"]
            ok &= check("phone forwarded", params["phone"] == "+919876543210")
            ok &= check("api key forwarded", params["apikey"] == "123456")
            ok &= check("body forwarded", params["text"] == "hello")

    print("\nWhatsApp via Twilio")
    with clean_env(
        TWILIO_ACCOUNT_SID="AC123", TWILIO_AUTH_TOKEN="tok",
        TWILIO_WHATSAPP_FROM="whatsapp:+14155238886",
        TWILIO_WHATSAPP_TO="whatsapp:+919876543210",
    ):
        with mock.patch.object(notify.requests, "post") as post:
            ok &= check("returns True", notify.send_whatsapp("hello") is True)
            ok &= check("posts to the account's message endpoint",
                        "AC123/Messages.json" in post.call_args.args[0])
            ok &= check("body forwarded", post.call_args.kwargs["data"]["Body"] == "hello")

    print("\nCallMeBot wins when both providers are configured")
    with clean_env(
        CALLMEBOT_PHONE="+91", CALLMEBOT_APIKEY="k",
        TWILIO_ACCOUNT_SID="AC123", TWILIO_AUTH_TOKEN="tok",
        TWILIO_WHATSAPP_FROM="whatsapp:+1", TWILIO_WHATSAPP_TO="whatsapp:+91",
    ):
        with mock.patch.object(notify.requests, "get") as get, \
             mock.patch.object(notify.requests, "post") as post:
            notify.send_whatsapp("hello")
            ok &= check("callmebot called", get.called)
            ok &= check("twilio not called as a fallback", not post.called)

    print("\nLong messages are truncated")
    with clean_env(CALLMEBOT_PHONE="+91", CALLMEBOT_APIKEY="k"):
        with mock.patch.object(notify.requests, "get") as get:
            notify.send_whatsapp("x" * 5000)
            body = get.call_args.kwargs["params"]["text"]
            ok &= check("kept under the character limit",
                        len(body) <= notify.WHATSAPP_CHAR_LIMIT)
            ok &= check("truncation is marked", body.endswith("(truncated)"))

    print("\nTrading-day check")
    thursday = datetime(2026, 8, 6, 14, 0, tzinfo=IST)
    saturday = datetime(2026, 8, 8, 14, 0, tzinfo=IST)

    with mock.patch.object(run_daily.yf, "download", return_value=index_frame("2026-08-06")):
        ok &= check("open when the index printed today's bar", run_daily.is_trading_day(thursday))

    with mock.patch.object(run_daily.yf, "download", return_value=index_frame("2026-08-05")):
        ok &= check("holiday when the newest bar is older",
                    not run_daily.is_trading_day(thursday))

    with mock.patch.object(run_daily.yf, "download", return_value=index_frame("2026-08-07")):
        ok &= check("weekend rejected without a lookup", not run_daily.is_trading_day(saturday))

    with mock.patch.object(run_daily.yf, "download", side_effect=OSError("network down")):
        ok &= check("assumes open if the index lookup fails",
                    run_daily.is_trading_day(thursday))

    with mock.patch.object(run_daily.yf, "download", return_value=pd.DataFrame()):
        ok &= check("assumes open if the index returns nothing",
                    run_daily.is_trading_day(thursday))

    print("\nDaily run exit codes")
    empty_scan = scan.ScanResult(pd.DataFrame(columns=scan.COLUMNS), 0, [], None)

    with clean_env(), \
         mock.patch.object(run_daily, "is_trading_day", return_value=True), \
         mock.patch.object(run_daily, "advanced_stock_scanner", return_value=empty_scan), \
         mock.patch.object(sys, "argv", ["run_daily.py"]):
        ok &= check("exits non-zero when no channel is configured", run_daily.main() == 1)

    with clean_env(), \
         mock.patch.object(run_daily, "is_trading_day", return_value=False), \
         mock.patch.object(run_daily, "advanced_stock_scanner") as scanner, \
         mock.patch.object(sys, "argv", ["run_daily.py"]):
        ok &= check("exits zero on a market holiday", run_daily.main() == 0)
        ok &= check("does not scan on a market holiday", not scanner.called)

    with clean_env(SMTP_HOST="h", SMTP_USER="u", SMTP_PASS="p", EMAIL_TO="a@b.com"), \
         mock.patch.object(run_daily, "is_trading_day", return_value=False), \
         mock.patch.object(run_daily, "advanced_stock_scanner", return_value=empty_scan), \
         mock.patch.object(notify.smtplib, "SMTP_SSL") as smtp, \
         mock.patch.object(sys, "argv", ["run_daily.py", "--force"]):
        ok &= check("--force overrides the holiday check", run_daily.main() == 0)
        ok &= check("--force still delivers the report", smtp.called)

    with clean_env(SMTP_HOST="h", SMTP_USER="u", SMTP_PASS="p", EMAIL_TO="a@b.com"), \
         mock.patch.object(run_daily, "is_trading_day", return_value=True), \
         mock.patch.object(run_daily, "advanced_stock_scanner", return_value=empty_scan), \
         mock.patch.object(notify.smtplib, "SMTP_SSL") as smtp, \
         mock.patch.object(sys, "argv", ["run_daily.py", "--dry-run"]):
        ok &= check("--dry-run exits zero", run_daily.main() == 0)
        ok &= check("--dry-run sends nothing", not smtp.called)

    print("\nAll tests passed." if ok else "\nSome tests FAILED.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
