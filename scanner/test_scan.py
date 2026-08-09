"""Offline tests for the scanner: synthetic price series with known outcomes,
so the strategy logic and the report rendering can be verified without network
access to Yahoo Finance.

Run with:  python test_scan.py
"""

from __future__ import annotations

import sys
from unittest import mock

import numpy as np
import pandas as pd

import report
import scan

SESSIONS = 400


def _frame(closes: np.ndarray, highs: np.ndarray | None = None) -> pd.DataFrame:
    index = pd.bdate_range(end="2026-08-07", periods=len(closes))
    return pd.DataFrame(
        {
            "Open": closes,
            "High": closes if highs is None else highs,
            "Low": closes,
            "Close": closes,
            "Adj Close": closes,
            "Volume": np.full(len(closes), 1000),
        },
        index=index,
    )


def uptrend_after_early_high(peak: float = 300.0, recover_to: float = 295.0) -> pd.DataFrame:
    """52-week high sits early in the window, then price dips and rallies back.

    The recovery stops just short of the peak, so the high stays in the past and
    a 10-session CAR trend exists. CMP ends above all three DMAs and the running
    mean rises on every one of the final sessions, so this must qualify.
    """
    closes = np.concatenate([
        np.linspace(100, peak, 150),              # run-up to the 52-week high
        np.linspace(peak, peak / 2, 100),         # correction that drags the mean down
        np.linspace(peak / 2, recover_to, 150),   # recovery, stopping below the high
    ])
    return _frame(closes)


def downtrend() -> pd.DataFrame:
    """Steady decline - price sits below every DMA, so it must not qualify."""
    return _frame(np.linspace(300, 100, SESSIONS))


def at_the_high() -> pd.DataFrame:
    """A brand-new 52-week high: fewer than 10 sessions of CAR, so it is skipped."""
    closes = np.concatenate([np.linspace(100, 300, SESSIONS - 3), np.array([305, 310, 315])])
    return _frame(closes)


def too_short() -> pd.DataFrame:
    """Only 120 sessions - not enough history for a 200 DMA."""
    return _frame(np.linspace(100, 200, 120))


def check(name: str, condition: bool) -> bool:
    print(f"  {'PASS' if condition else 'FAIL'}  {name}")
    return condition


def main() -> int:
    frames = {
        "RALLY.NS": uptrend_after_early_high(),
        "FALLER.NS": downtrend(),
        "NEWHIGH.NS": at_the_high(),
        "SHORT.NS": too_short(),
    }
    tickers = list(frames)

    print("Strategy logic")
    with mock.patch.object(scan, "_download", return_value=frames):
        result = scan.advanced_stock_scanner(tickers)

    stocks = set(result.breakouts["Stock"])
    ok = True
    ok &= check("rallying stock is flagged as a breakout", "RALLY" in stocks)
    ok &= check("falling stock is not flagged", "FALLER" not in stocks)
    ok &= check("stock at a fresh high is skipped", "NEWHIGH.NS" in result.skipped)
    ok &= check("stock with <200 sessions is skipped", "SHORT.NS" in result.skipped)
    ok &= check("only breakout rows are returned",
                set(result.breakouts["Action"]) <= {scan.BREAKOUT})
    ok &= check("column order preserved", list(result.breakouts.columns) == scan.COLUMNS)

    rally = result.breakouts[result.breakouts["Stock"] == "RALLY"].iloc[0]
    ok &= check("CMP is above the 200 DMA", rally["CMP"] > rally["200 DMA"])
    ok &= check("CMP is above the 30 DMA", rally["CMP"] > rally["30 DMA"])
    ok &= check("distance from 200 DMA is positive", rally["200 DMA Dist %"] > 0)
    ok &= check("CAR status is Positive", rally["CAR Status"] == "Positive")

    print("\nSorting")
    # Different recovery strengths give each stock a different 200 DMA distance.
    many = {
        f"S{i}.NS": uptrend_after_early_high(recover_to=250.0 + 15 * i)
        for i in range(3)
    }
    with mock.patch.object(scan, "_download", return_value=many):
        sorted_result = scan.advanced_stock_scanner(list(many))
    distances = list(sorted_result.breakouts["200 DMA Dist %"])
    ok &= check("results ascend by distance from the 200 DMA", distances == sorted(distances))

    print("\nReporting")
    html = report.html_body(result, "07-08-2026 14:00")
    text = report.text_summary(result, "07-08-2026 14:00")
    ok &= check("HTML contains the breakout row", "RALLY" in html)
    ok &= check("HTML lists the skipped symbols", "SHORT" in html)
    ok &= check("text summary contains the breakout row", "RALLY" in text)
    ok &= check("subject reports the count", "1 breakout stock" in report.subject(result, "x"))

    empty = scan.ScanResult(pd.DataFrame(columns=scan.COLUMNS), 0, [], None)
    ok &= check("empty scan renders an HTML body",
                "No stock cleared" in report.html_body(empty, "x"))
    ok &= check("empty scan renders a text summary",
                "No stock cleared" in report.text_summary(empty, "x"))
    ok &= check("empty scan writes no Excel file",
                report.write_excel(empty, "/tmp/should-not-exist.xlsx") is None)

    print("\nExcel output")
    path = report.write_excel(result, scan_output := "/tmp/breakout-test.xlsx")
    ok &= check("Excel file written", path is not None and path.exists())
    if path:
        reloaded = pd.read_excel(scan_output)
        ok &= check("Excel round-trips every row", len(reloaded) == len(result.breakouts))

    print("\nAll tests passed." if ok else "\nSome tests FAILED.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
