# 5. Compare Screen

Route: `#/compare?a=ISIN_A&b=ISIN_B`

## User input fields

| Field | Required? | Type | Notes |
|---|---|---|---|
| Bond A (ISIN/issuer selection) | **Required** | Dropdown/typeahead | Comparison cannot render with fewer than 2 bonds selected |
| Bond B (ISIN/issuer selection) | **Required** | Dropdown/typeahead | |
| Additional bond(s) search ("+ Search...") | Optional | Text | Adds more columns to the comparison |

## Comparison table fields (per selected bond)

| Field | Required? | Type |
|---|---|---|
| Security Type | Required | String |
| Issue Date | Required | Date |
| Call Date | Optional | Date |
| Maturity Date | Required | Date |
| Put Date | Optional | Date |
| Instrument Type | Required | String |
| Outstanding Amount | Required | Decimal (Cr) |
| Coupon Rate | Required | Decimal (%) |
| Taxation | Required | String |
| Secured Type | Required | Enum (Secured/Unsecured) |
| Issuer Category | Required | String (e.g. Bank, NBFC, PSU) |
| Industry | Required | String |
| Sector | Required | String |

## Price / Yield comparison chart

| Field | Required? | Type | Notes |
|---|---|---|---|
| Metric toggle (Price/Yield) | Required | Enum | Default Price |
| Date range (1M/3M/6M/1Y/2Y) | Required | Enum | Default 6M |
| Time-series points per selected bond: date + value | Required | Array of {date, value} | One series per bond in the comparison |
