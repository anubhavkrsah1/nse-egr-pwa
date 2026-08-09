"""CAR + 30/50/200 DMA breakout scanner for NSE stocks.

Strategy (all four conditions must hold for a stock to qualify):

  1. CMP > 30 DMA
  2. CMP > 50 DMA
  3. CMP > 200 DMA
  4. CAR (cumulative average of closes since the 52-week high) has risen on
     every one of the last 10 sessions.

Qualifying stocks are returned sorted by distance from the 200 DMA, ascending,
so the ones closest to their long-term average - the earliest-stage breakouts -
appear first.
"""

from __future__ import annotations

import logging
import warnings
from dataclasses import dataclass
from datetime import datetime

import pandas as pd
import yfinance as yf

# Yahoo Finance logs a red error line for every delisted or renamed symbol.
# We handle those cases ourselves, so silence the noise.
logging.getLogger("yfinance").setLevel(logging.CRITICAL)
warnings.filterwarnings("ignore")

log = logging.getLogger(__name__)

# 200 DMA needs 200 sessions; two years of data leaves comfortable headroom.
HISTORY_PERIOD = "2y"
MIN_SESSIONS = 200
# ~252 trading sessions in a year - the window used for the 52-week high.
SESSIONS_PER_YEAR = 252
# Number of consecutive rising CAR sessions required.
CAR_LOOKBACK = 10
# Yahoo throttles very large multi-symbol requests, so fetch in chunks.
BATCH_SIZE = 40

COLUMNS = [
    "Date",
    "Stock",
    "CMP",
    "30 DMA",
    "50 DMA",
    "200 DMA",
    "200 DMA Dist %",
    "CAR Status",
    "Action",
]

BREAKOUT = "Positive Breakout"
AVOID = "Avoid/Hold"


@dataclass
class ScanResult:
    """Everything a single scan produces, ready to be reported."""

    breakouts: pd.DataFrame  # qualifying stocks only
    scanned: int  # symbols with usable price history
    skipped: list[str]  # symbols that returned no / insufficient data
    as_of: pd.Timestamp | None  # date of the most recent bar seen


def _download(tickers: list[str]) -> dict[str, pd.DataFrame]:
    """Fetch daily history for every ticker, batching to stay under Yahoo's limits.

    Returns a symbol -> OHLCV frame mapping, omitting symbols that came back empty.
    """
    frames: dict[str, pd.DataFrame] = {}

    for start in range(0, len(tickers), BATCH_SIZE):
        batch = tickers[start : start + BATCH_SIZE]
        raw = yf.download(
            batch,
            period=HISTORY_PERIOD,
            interval="1d",
            group_by="ticker",
            auto_adjust=False,  # keep raw closes so CMP matches the screen price
            progress=False,
            threads=True,
        )

        if raw is None or raw.empty:
            continue

        for ticker in batch:
            if isinstance(raw.columns, pd.MultiIndex):
                if ticker not in raw.columns.get_level_values(0):
                    continue
                frame = raw[ticker]
            else:
                # yfinance flattens the columns when a batch has a single symbol.
                frame = raw

            frame = frame.dropna(subset=["Close"])
            if not frame.empty:
                frames[ticker] = frame

    return frames


def _evaluate(ticker: str, data: pd.DataFrame, today: str) -> dict | None:
    """Run the strategy against one stock. Returns a result row, or None if unusable."""
    if len(data) < MIN_SESSIONS:
        return None

    close = data["Close"].squeeze()

    # Latest value of each moving average.
    dma_30 = close.rolling(window=30).mean().iloc[-1]
    dma_50 = close.rolling(window=50).mean().iloc[-1]
    dma_200 = close.rolling(window=200).mean().iloc[-1]
    cmp_ = close.iloc[-1]

    if pd.isna(dma_200) or dma_200 == 0:
        return None

    # How far above (or below) its long-term average the stock is trading.
    dist_200_dma = ((cmp_ - dma_200) / dma_200) * 100

    # Date of the highest high over the last year.
    high_date = data["High"].squeeze().tail(SESSIONS_PER_YEAR).idxmax()

    # CAR = running average of every close since that high was printed.
    car_data = close.loc[high_date:]
    if len(car_data) < CAR_LOOKBACK:
        # The high is too recent for a 10-session CAR trend to exist yet.
        return None

    last_car = car_data.expanding().mean().tail(CAR_LOOKBACK)
    car_status = "Positive" if last_car.is_monotonic_increasing else "Negative"

    passes = (
        cmp_ > dma_30
        and cmp_ > dma_50
        and cmp_ > dma_200
        and car_status == "Positive"
    )

    return {
        "Date": today,
        "Stock": ticker.replace(".NS", ""),
        "CMP": round(float(cmp_), 2),
        "30 DMA": round(float(dma_30), 2),
        "50 DMA": round(float(dma_50), 2),
        "200 DMA": round(float(dma_200), 2),
        "200 DMA Dist %": round(float(dist_200_dma), 2),
        "CAR Status": car_status,
        "Action": BREAKOUT if passes else AVOID,
    }


def advanced_stock_scanner(ticker_list: list[str]) -> ScanResult:
    """Scan every ticker and return only the stocks that clear all four conditions."""
    today = datetime.now().strftime("%d-%m-%Y")
    log.info("Scanning %d symbols...", len(ticker_list))

    frames = _download(ticker_list)

    rows: list[dict] = []
    skipped: list[str] = []
    as_of: pd.Timestamp | None = None

    for ticker in ticker_list:
        data = frames.get(ticker)
        if data is None or data.empty:
            skipped.append(ticker)
            continue

        last_bar = data.index[-1]
        if as_of is None or last_bar > as_of:
            as_of = last_bar

        try:
            row = _evaluate(ticker, data, today)
        except Exception:  # a single bad symbol must never abort the scan
            log.exception("Failed to evaluate %s", ticker)
            row = None

        if row is None:
            skipped.append(ticker)
            continue

        rows.append(row)

    evaluated = pd.DataFrame(rows, columns=COLUMNS)
    breakouts = evaluated[evaluated["Action"] == BREAKOUT] if not evaluated.empty else evaluated

    if not breakouts.empty:
        breakouts = breakouts.sort_values(by="200 DMA Dist %", ascending=True).reset_index(drop=True)

    log.info(
        "Evaluated %d symbols, %d breakouts, %d skipped",
        len(rows), len(breakouts), len(skipped),
    )

    return ScanResult(
        breakouts=breakouts,
        scanned=len(rows),
        skipped=skipped,
        as_of=as_of,
    )


if __name__ == "__main__":
    from tickers import NSE_TICKERS

    logging.basicConfig(level=logging.INFO, format="%(message)s")
    result = advanced_stock_scanner(NSE_TICKERS)

    print("\n--- FINAL LIST: POSITIVE BREAKOUT STOCKS ONLY ---")
    if result.breakouts.empty:
        print("No stock cleared all conditions today.")
    else:
        print(result.breakouts.to_string(index=False))
