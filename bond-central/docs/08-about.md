# 8. About Us Screen

Route: `#/about`

## User input fields

None — this is a static content screen with no forms, filters, or search.

## Data fields required to render

| Field | Required? | Type |
|---|---|---|
| Heading ("Welcome to National Stock Exchange") | Required | String |
| Intro/mission paragraph | Required | Rich text |
| Sign-off block (name/title, e.g. "Founder & CSO") | Required | String |
| Info cards (×5): each needs — | | |
| &nbsp;&nbsp;Card title | Required | String |
| &nbsp;&nbsp;Card description | Required | String |
| &nbsp;&nbsp;Card accent color | Optional | String — falls back to a default palette |
