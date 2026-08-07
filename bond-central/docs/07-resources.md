# 7. Resources Screen

Route: `#/resources`

## User input fields

| Field | Required? | Type | Notes |
|---|---|---|---|
| Search ("Type Name or Category") | Optional | Text | |
| Tab filter (All / Reports / Articles) | Required (has default) | Tab selection | Default: All |

## Data fields required per resource item

| Field | Required? | Type |
|---|---|---|
| Title | Required | String |
| Type | Required | Enum (Article/Report) — determines which section it appears in |
| Publish date | Required | Date |
| File / document link | Required | URL (PDF) |
| Thumbnail/icon | Optional | Image — defaults to a generic PDF icon if absent |
