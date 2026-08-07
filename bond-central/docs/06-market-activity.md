# 6. Market Activity Screen

Route: `#/market-activity`

## User input fields

| Field | Required? | Type | Notes |
|---|---|---|---|
| Mode (Aggregate Trading Activity / Average Daily Trading Activity) | Required (has default) | Toggle | Default: Aggregate |
| Dimension (Instrument Type / Issuer / Sector / Issuer Category) | Required (has default) | Tab selection | Default: Instrument Type |
| Search within dimension list | Optional | Text | Filters the checklist below |
| Item selection checklist | Required — at least 1 checked | Multi-select checkboxes | Drives which series appear on the chart |
| Period (Quarterly/Monthly) | Required (has default) | Enum | Default: Quarterly |
| View (Chart/Table) | Required (has default) | Enum | Default: Chart |
| Rating Scale (for Top 5 table, e.g. AAA/AA+/AA/A+) | Required (has default) | Enum | |

## Summary chart data (per selected dimension)

| Field | Required? | Type | Notes |
|---|---|---|---|
| Category name (instrument/issuer/sector/issuer-category label) | Required | String | Legend + series key |
| Period label (quarter/month) | Required | String | X-axis category |
| Traded value | Required | Decimal (Cr) | Stacked bar segment per category |

## Top 5 Traded Issuer Rating-wise table

| Field | Required? | Type |
|---|---|---|
| Issuer name | Required | String |
| Traded Value | Required | Decimal |
| Outstanding Amount | Required | Decimal |
| Traded Value % of Outstanding Amount | Required | Decimal (%) |
