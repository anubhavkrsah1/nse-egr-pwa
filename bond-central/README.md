# Bond Central — Interactive Prototype

A static, client-side prototype of the NSE **Bond Central** website, built from the
`Bond_Central_Website_UI.pdf` mockups. Zero build step, zero external CDN calls —
everything (including Chart.js) is vendored locally so it can run entirely offline
and deploys as-is to Cloudflare Pages.

## Screens implemented

| Screen | Route | Notes |
|---|---|---|
| Home | `#/home` | Hero search, stat panel, monthly issuance chart, market-activity KPIs |
| Explore (listing) | `#/explore` | Search, sidebar filters (issuer, instrument type, coupon range, sector), sortable/paginated table, CSV export |
| Bond / ISIN detail | `#/bond/:isin` | Issue Details, Primary Market Details, Rating Details, Cash Flow Schedule, price/yield chart |
| Issuer detail | `#/issuer/:name` | Issuer profile, quarterly issuance chart, market-activity chart, ISIN list |
| Compare | `#/compare?a=ISIN&b=ISIN` | Side-by-side bond comparison table + overlaid price/yield chart |
| Market Activity | `#/market-activity` | Aggregate / Average toggle, Instrument Type / Issuer / Sector / Issuer Category dimension, stacked chart, top-5 table |
| Resources | `#/resources` | Search + Articles/Reports tabs and grid |
| About Us | `#/about` | Static info cards |

Routing is hash-based and fully client-side — no server config or build step is
required, so it deploys as plain static files.

## Data

All bond/issuer/chart data in `assets/js/data.js` is **seeded sample data**, shaped
to match the fields shown in the PDF mockups. Swap the functions in that file for
real API calls to go live — see `docs/` for the exact field contract each screen
needs.

## Run locally

```bash
cd bond-central
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to Cloudflare Pages (pages.dev)

**Option A — dedicated Pages project for Bond Central (recommended)**

1. In the Cloudflare dashboard: Workers & Pages → Create → Pages → connect to
   the `anubhavkrsah1/nse-egr-pwa` GitHub repo.
2. Set **Build output directory** to `bond-central`. No build command needed.
3. Deploy — Cloudflare will give you a `https://<project-name>.pages.dev` URL.

Or via Wrangler CLI (requires `wrangler login` once):

```bash
cd bond-central
npx wrangler pages deploy . --project-name=bond-central
```

**Option B — sub-path of the existing `nse-egr-pwa` Pages project**

If the existing project keeps deploying the whole repo from `/`, Bond Central is
simply reachable at `https://nse-egr-pwa.pages.dev/bond-central/` once this
branch/PR is merged and picked up by that project's build — no extra config
needed since this folder is entirely self-contained and doesn't touch the
existing EGR app files at the repo root.

## Docs

See [`docs/`](./docs) for the required-fields specification for every screen —
useful as the API/data contract once this prototype is wired to a real backend.
