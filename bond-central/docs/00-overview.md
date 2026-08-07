# Bond Central — Required Fields by Screen

This folder documents the **field contract** for every screen in the Bond Central
prototype: which fields the user must fill in (forms/filters) and which fields
the screen requires from the data source (API/database) to render correctly.

Legend used in every table:

- **Required** — the screen cannot render correctly, or the action cannot be
  submitted, without this field.
- **Optional** — enhances the screen but can be blank/omitted.
- **Derived** — calculated from other fields, not stored/entered directly.

| # | Screen | File |
|---|---|---|
| 1 | Home | [01-home.md](./01-home.md) |
| 2 | Explore (bond listing + filters) | [02-explore.md](./02-explore.md) |
| 3 | Bond / ISIN Detail | [03-bond-detail.md](./03-bond-detail.md) |
| 4 | Issuer Detail | [04-issuer-detail.md](./04-issuer-detail.md) |
| 5 | Compare | [05-compare.md](./05-compare.md) |
| 6 | Market Activity | [06-market-activity.md](./06-market-activity.md) |
| 7 | Resources | [07-resources.md](./07-resources.md) |
| 8 | About Us | [08-about.md](./08-about.md) |

Source: `Bond_Central_Website_UI.pdf` (11-page NSE Bond Central UI mockup).
