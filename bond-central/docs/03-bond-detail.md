# 3. Bond / ISIN Detail Screen

Route: `#/bond/:isin`

## Required input to load the screen

| Field | Required? | Type | Notes |
|---|---|---|---|
| ISIN | Required | String | Passed via route/selection from Explore; screen cannot render without it |
| Search box (re-search another ISIN/issuer) | Optional | Text | |

## Issue Details card

| Field | Required? | Type |
|---|---|---|
| ISIN | Required | String |
| Issuer Name | Required | String |
| Instrument Type | Required | String |
| Security Type | Required | String |
| Issue Amount | Required | Decimal (Cr) |
| Outstanding Amount | Required | Decimal (Cr) |
| Issue Date | Required | Date |
| Maturity Date | Required | Date |
| Coupon Rate | Required | Decimal (%) |
| Coupon Frequency | Required | Enum (Annual/Semi-Annual/Quarterly) |
| Day Count Convention | Required | String |
| Mode of Issue | Required | Enum (Public/Private Placement) |
| Face Value | Required | Decimal |
| Issue Price | Required | Decimal |
| Listed On | Required | String (exchange) |
| Call Date | Optional | Date | Blank ("—") if not callable |
| Put Date | Optional | Date | Blank ("—") if not puttable |
| Listing Date | Required | Date |
| Last Cash Flow date | Required | Date |
| Next Cash Flow Date | Required | Date |
| Taxation | Required | String |
| Guaranteed | Required | Enum (Yes/No) |
| Interest Record Date | Required | Date |
| Security Description | Required | Enum (Secured/Unsecured) |

## Primary Market Details card

| Field | Required? | Type |
|---|---|---|
| Fresh Issue / Re-Issue | Required | Enum |
| Amount raised (Rs. in Crs) | Required | Decimal |
| Principal Record Date | Required | Date |
| Manner of Allotment | Optional | String |
| Type of Bidding (Coupon/Price/Spread) | Optional | String |
| Type of Book Bidding (Open/Closed) | Optional | Enum |
| No. of successful Bidders/QIBs | Optional | Integer |
| Base Issue Size (Cr) | Required | Decimal |
| Green Shoe Option (Cr) | Optional | Decimal |
| Anchor Portion (Cr) | Optional | Decimal |
| No. of Anchor Investors | Optional | Integer |
| Trade Suspension Date | Optional | Date |

## Rating Details card (repeats per agency)

| Field | Required? | Type |
|---|---|---|
| Rating Agency name (CRISIL / ICRA / CARE / …) | Required | String |
| Current Rating | Required | String |
| Rating Date | Required | Date |
| Rating history link ("See More") | Optional | URL/action |

## Cash Flow Schedule table

| Field | Required? | Type |
|---|---|---|
| Record Date | Required | Date |
| Payment Date | Required | Date |
| Interest / Redemption amount | Required | Decimal |
| Payment Type | Required | Enum (Interest/Principal) |
| Default Status | Required | String ("-" if none) |
| Net / Issue view toggle | Required | Enum |

## Price / Yield chart

| Field | Required? | Type | Notes |
|---|---|---|---|
| Source (NSE/BSE) | Required | Enum | Toggle, default NSE |
| Metric (Price/Yield) | Required | Enum | Toggle, default Price |
| Date range (1M/3M/6M/1Y/2Y) | Required | Enum | Default 6M |
| View (Chart/Table) | Required | Enum | Default Chart |
| Time-series points: date + value per benchmark series | Required | Array of {date, value} | e.g. Gov 3yr / Gov 5yr / Gov 10yr / Yield-Price series |
