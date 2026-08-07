# 1. Home Screen

Route: `#/home`

## User input fields

| Field | Required? | Type | Notes |
|---|---|---|---|
| Global search (ISIN / Issuer / keyword) | Optional | Text | Submitting routes to Explore pre-filtered by this text |

## Data fields required to render

### Listed Corporate Bond Details panel

| Field | Required? | Type |
|---|---|---|
| Total No. of Issuers | Required | Integer |
| Total No. of ISINs | Required | Integer |
| Total value: Outstanding Bonds (in Cr) | Required | Decimal |
| Source attribution (e.g. "NSE, BSE, NSDL, CDSL") | Required | Text |

### Corporate Bond Issuance chart (Monthly Issuance)

| Field | Required? | Type | Notes |
|---|---|---|---|
| Period label (month/quarter/year) | Required | String | X-axis category |
| Corporate Bond amount | Required | Decimal | Stacked series |
| Government Bond amount | Required | Decimal | Stacked series |
| Commercial Paper (CP) amount | Required | Decimal | Stacked series |
| Certificate of Deposit (CD) amount | Optional | Decimal | Stacked series, shown in some period views |
| Period granularity selector (Monthly/Quarterly/Yearly) | Required | Enum | Controls which aggregation is requested |

### Market Activity summary strip

| Field | Required? | Type | Notes |
|---|---|---|---|
| Total ISIN traded (count) | Required | Integer | |
| Total ISIN traded (% of universe) | Required | Decimal | Shown alongside count |
| Total Issuer Traded (count) | Required | Integer | |
| Total Issuer Traded (% of universe) | Required | Decimal | |
| % of Total Outstanding Traded (amount, Cr) | Required | Decimal | |
| % of Total Outstanding Traded (percentage) | Required | Decimal | |
