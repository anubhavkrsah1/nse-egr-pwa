# 2. Explore Screen (Bond Listing + Filters)

Route: `#/explore`

## User input fields (search & filter panel)

| Field | Required? | Type | Notes |
|---|---|---|---|
| Search (ISIN / Issuer / keyword) | Optional | Text | |
| Issuer | Optional | Text / typeahead | Free-text match against issuer name |
| Instrument Type | Optional | Multi-select checkboxes | Convertible Debentures, Corporate Bond, Foreign Currency Bond, Infrastructure Bond |
| Coupon Rate — Fixed, From | Optional | Decimal | Lower bound; pairs with "To" |
| Coupon Rate — Fixed, To | Optional | Decimal | Upper bound |
| Coupon Rate — Floating | Optional | Text search | Separate search for floating-rate instruments |
| Sector | Optional | Text / typeahead | |
| Issue Date — From / To | Optional | Date range | |
| Maturity Date — From / To | Optional | Date range | |
| Items per page | Optional (has default) | Enum (10/15/25/50) | |
| Sort column + direction | Optional (has default) | Enum | Any column header is sortable |

At least one filter combination must resolve to a valid query, but **no single
filter field is mandatory** — the default (no filters) returns the full universe.

## Data fields required per table row

| Field | Required? | Type | Notes |
|---|---|---|---|
| ISIN | Required | String | Primary key; links to Bond Detail |
| Issuer | Required | String | Links to Issuer Detail |
| Bond Type | Required | String | e.g. Non-Convertible Debentures |
| Coupon | Required | Decimal (%) | |
| Maturity Date | Required | Date | |
| Secured Type | Required | Enum (Secured / Unsecured) | Rendered as a pill |
| Ratings | Required | String | Latest composite/agency rating |
| Last Traded Price | Required | Decimal | |
| Last Traded Yield | Required | Decimal (%) | |
| Sector | Optional | String | Used for filtering, not shown by default in the visible columns but needed to support the Sector filter |

## Pagination / result metadata

| Field | Required? | Type |
|---|---|---|
| Total item count | Required | Integer |
| Current page | Required | Integer |
| Items per page | Required | Integer |

## Export actions

| Action | Required fields |
|---|---|
| Download .csv | Full result set (all rows matching current filters, all listed columns) |
| Download .pdf | Same as above, formatted for print |
| Add Column | List of optional/available columns not shown by default (e.g. Issue Date, Face Value) |
