"""Turn a ScanResult into the artefacts we deliver: an Excel file, an HTML
email body and a short plain-text summary suitable for WhatsApp.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from scan import ScanResult

# WhatsApp messages get unwieldy past a screenful; cap the list and say so.
WHATSAPP_MAX_ROWS = 25


def write_excel(result: ScanResult, path: str | Path) -> Path | None:
    """Write the breakout table to .xlsx. Returns None when there is nothing to write."""
    if result.breakouts.empty:
        return None

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    result.breakouts.to_excel(path, index=False, sheet_name="Breakouts")
    return path


def _as_of_text(result: ScanResult) -> str:
    if result.as_of is None:
        return "unknown"
    return pd.Timestamp(result.as_of).strftime("%d-%m-%Y")


def subject(result: ScanResult, run_time: str) -> str:
    count = len(result.breakouts)
    if count == 0:
        return f"NSE Breakout Scan {run_time} - no qualifying stocks"
    return f"NSE Breakout Scan {run_time} - {count} breakout stock{'s' if count != 1 else ''}"


def html_body(result: ScanResult, run_time: str) -> str:
    """Full HTML email: the breakout table plus a short run summary."""
    header = (
        "<h2 style='margin:0 0 4px'>CAR + 30/50/200 DMA Breakout Scan</h2>"
        f"<p style='margin:0 0 16px;color:#555'>Run at {run_time} IST &middot; "
        f"prices as of {_as_of_text(result)} &middot; {result.scanned} symbols evaluated</p>"
    )

    if result.breakouts.empty:
        table = (
            "<p style='padding:12px;background:#fff4f4;border-left:4px solid #d33'>"
            "No stock cleared all four conditions today.</p>"
        )
    else:
        table = result.breakouts.to_html(
            index=False,
            border=0,
            justify="left",
            classes="scan",
        )

    criteria = (
        "<h3 style='margin:24px 0 6px'>Conditions applied</h3>"
        "<ol style='margin:0;padding-left:20px;color:#333'>"
        "<li>CMP above the 30 DMA</li>"
        "<li>CMP above the 50 DMA</li>"
        "<li>CMP above the 200 DMA</li>"
        "<li>CAR rising on each of the last 10 sessions "
        "(CAR = running average of closes since the 52-week high)</li>"
        "</ol>"
        "<p style='margin:12px 0 0;color:#555'>Sorted by distance from the 200 DMA, "
        "ascending - earliest-stage breakouts first.</p>"
    )

    skipped_note = ""
    if result.skipped:
        names = ", ".join(t.replace(".NS", "") for t in result.skipped)
        skipped_note = (
            "<p style='margin:16px 0 0;color:#888;font-size:12px'>"
            f"Skipped ({len(result.skipped)} - no data, under 200 sessions of history, "
            f"or a 52-week high newer than 10 sessions): {names}</p>"
        )

    style = """
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
             font-size: 14px; color: #111; }
      table.scan { border-collapse: collapse; width: 100%; max-width: 900px; }
      table.scan th { background: #12321f; color: #fff; text-align: left;
                      padding: 8px 10px; font-weight: 600; white-space: nowrap; }
      table.scan td { padding: 7px 10px; border-bottom: 1px solid #e6e6e6;
                      white-space: nowrap; }
      table.scan tr:nth-child(even) td { background: #fafafa; }
    </style>
    """

    disclaimer = (
        "<p style='margin:24px 0 0;color:#999;font-size:12px'>"
        "Automated technical screen for personal research. Not investment advice.</p>"
    )

    return f"<html><head>{style}</head><body>{header}{table}{criteria}{skipped_note}{disclaimer}</body></html>"


def text_summary(result: ScanResult, run_time: str) -> str:
    """Compact plain-text version - used for WhatsApp and as the email fallback part."""
    lines = [f"*NSE Breakout Scan* {run_time} IST"]
    lines.append(f"Prices as of {_as_of_text(result)} | {result.scanned} symbols evaluated")
    lines.append("")

    if result.breakouts.empty:
        lines.append("No stock cleared all four conditions today.")
        return "\n".join(lines)

    lines.append(f"{len(result.breakouts)} breakout stock(s), nearest to 200 DMA first:")
    lines.append("")

    shown = result.breakouts.head(WHATSAPP_MAX_ROWS)
    for _, row in shown.iterrows():
        lines.append(
            f"{row['Stock']}  Rs {row['CMP']}  ({row['200 DMA Dist %']}% over 200 DMA)"
        )

    remaining = len(result.breakouts) - len(shown)
    if remaining > 0:
        lines.append(f"...and {remaining} more - see the email for the full table.")

    return "\n".join(lines)
