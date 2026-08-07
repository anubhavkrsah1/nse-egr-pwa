# 4. Issuer Detail Screen

Route: `#/issuer/:name`

## Required input to load the screen

| Field | Required? | Type | Notes |
|---|---|---|---|
| Issuer identifier (name or issuer ID) | Required | String | Passed via route/selection; screen cannot render without it |
| Search box (jump to another issuer) | Optional | Text | |

## Issuer Detail card

| Field | Required? | Type |
|---|---|---|
| Issuer Rating | Required | String |
| Total Active ISINs | Required | Integer |
| Total Amount Outstanding (in Crs) | Required | Decimal |
| CIN | Required | String |
| Industry | Required | String |
| Sector | Required | String |
| LEI Code | Optional | String |
| Type of Issuer | Required | String (e.g. NBFC, HFC, Corporate) |
| Registered Office | Required | String (address) |
| Address of Issuer | Required | String (address) |
| Name of Compliance Officer / Company Secretary | Optional | String |

## Quarterly Issuance chart

| Field | Required? | Type | Notes |
|---|---|---|---|
| Period label (quarter/month) | Required | String |
| Corporate Bond amount | Required | Decimal | Stacked series |
| Government Bond amount | Required | Decimal | Stacked series |
| CP amount | Optional | Decimal | Stacked series |
| CD amount | Optional | Decimal | Stacked series |
| Period selector (Quarterly/Monthly) | Required | Enum |
| View toggle (Table/Chart) | Required | Enum |

## Market Activity chart (issuer-scoped)

| Field | Required? | Type |
|---|---|---|
| Period label | Required | String |
| Total market activity value | Required | Decimal |
| Issuer Trading Activity value | Required | Decimal |
| Period selector (Monthly/Quarterly) | Required | Enum |

## ISINs from this Issuer table

| Field | Required? | Type |
|---|---|---|
| ISIN | Required | String — links to Bond Detail |
| Bond Type | Required | String |
| Coupon | Required | Decimal (%) |
| Maturity Date | Required | Date |
| Rating | Required | String |
