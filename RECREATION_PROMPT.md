# NSE Good Gold EGR PWA — Complete Recreation Prompt

> Copy everything below this line and paste as your first message to rebuild the entire app from scratch.

---

## MASTER RECREATION PROMPT

Build a **production-ready single-file Progressive Web App (PWA)** called **NSE Good Gold EGR** — a platform for digitising physical household gold into NSE Electronic Gold Receipts (EGRs). The entire app must live in one self-contained `index.html` file (~300KB) with React 18 and all CSS inlined — no external dependencies at runtime.

---

## TECH STACK

- **React 18.2** (minified, inlined directly in `<script>` tag — no CDN)
- **React-DOM 18.2** (same, inlined)
- **Pure CSS** with CSS custom properties (no Tailwind, no MUI)
- **localStorage** as client-side database (no backend)
- **Service Worker** (`sw.js`) — network-first for HTML, cache-first for static assets
- **PWA manifest** (`manifest.json`) — installable on mobile
- Deploy to **Cloudflare Pages** + **GitHub Pages** simultaneously via `deploy.sh`

---

## COLOUR SYSTEM (CSS custom properties)

```css
--navy: #0F2C59;  --gold: #D4AF37;  --cobalt: #1D4ED8;  --cobaltL: #EFF6FF;
--green: #16A34A; --greenL: #DCFCE7; --greenD: #065F46;
--amber: #D97706; --ambL: #FEF3C7;  --orange: #EA580C;
--red: #DC2626;   --redD: #991B1B;
--ink: #111827;   --ink2: #374151;  --ink3: #6B7280;
--border: #D1D5DB; --border2: #E5E7EB;
--paper: #F9FAFB; --paper2: #F3F4F6;
--font: "Segoe UI", Arial, sans-serif;  --mono: "Courier New", monospace;
```

---

## ISIN MASTER DATA (14 ISINs — official NSE)

3 denomination types per ISIN (confirmed with domain expert Gouri sir):
- `deposit`: physical gold in — **minimum 1g**
- `creating`: EGR ISIN creation — **minimum 1g**
- `tradeable`: tradeable on NSE — **minimum 100mg** (SEBI 1/10 rule)
- `pickup`: Sequel logistics pickup — **minimum 1g**

```javascript
const ISIN_MASTER = [
  // 100mg — tradeable only (below 1g deposit/create min)
  {id:"G100mg995", label:"Gold 100mg 995", isin:"ING995NS0040", grams:0.1,   purity:995, phase1:true,  deposit:false, creating:false, tradeable:true,  pickup:false},
  {id:"G100mg999", label:"Gold 100mg 999", isin:"ING999NS0046", grams:0.1,   purity:999, phase1:true,  deposit:false, creating:false, tradeable:true,  pickup:false},
  // 1g — all tiers (minimum deposit & creation unit)
  {id:"G1g995",    label:"Gold 1g 995",    isin:"ING995NS0032", grams:1,     purity:995, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  {id:"G1g999",    label:"Gold 1g 999",    isin:"ING999NS0038", grams:1,     purity:999, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  // 10g
  {id:"G10g995",   label:"Gold 10g 995",   isin:"ING995NS0024", grams:10,    purity:995, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  {id:"G10g999",   label:"Gold 10g 999",   isin:"ING999NS0020", grams:10,    purity:999, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  // 100g
  {id:"G100g995",  label:"Gold 100g 995",  isin:"ING995NS0016", grams:100,   purity:995, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  {id:"G100g999",  label:"Gold 100g 999",  isin:"ING999NS0012", grams:100,   purity:999, phase1:true,  deposit:true,  creating:true,  tradeable:true,  pickup:true},
  // 1kg — deposit + create only (not single-unit tradeable)
  {id:"G1kg995",   label:"Gold 1kg 995",   isin:"ING995NS0057", grams:1000,  purity:995, phase1:false, deposit:true,  creating:true,  tradeable:false, pickup:true},
  {id:"G1kg999",   label:"Gold 1kg 999",   isin:"ING999NS0053", grams:1000,  purity:999, phase1:false, deposit:true,  creating:true,  tradeable:false, pickup:true},
  // sub-100mg — disabled (not in current SEBI scope)
  {id:"G10mg995",  label:"Gold 10mg 995",  isin:"ING995NS0065", grams:0.01,  purity:995, phase1:false, deposit:false, creating:false, tradeable:false, pickup:false},
  {id:"G10mg999",  label:"Gold 10mg 999",  isin:"ING999NS0061", grams:0.01,  purity:999, phase1:false, deposit:false, creating:false, tradeable:false, pickup:false},
  {id:"G1mg995",   label:"Gold 1mg 995",   isin:"ING995NS0073", grams:0.001, purity:995, phase1:false, deposit:false, creating:false, tradeable:false, pickup:false},
  {id:"G1mg999",   label:"Gold 1mg 999",   isin:"ING999NS0079", grams:0.001, purity:999, phase1:false, deposit:false, creating:false, tradeable:false, pickup:false},
];
```

ISIN state is persisted in `localStorage("egr_isin_state")`. Each ISIN has 6 admin-togglable flags: `enabled`, `deposit`, `creating`, `tradeable`, `pickup`, `delivery`, `extinguish`.

---

## 6 MANDATORY DOCUMENTS (exact workflow mapping)

```javascript
const DOC_MASTER = [
  {
    id: "form45",
    name: "DR Form 45 (EGR Deposit Request)",
    requiredBy: "NSDL",   // ONLY NSDL requires it
    filledBy: ["depositor","refiner","nsdl","vault"],  // multiple stages
    generatedAt: "deposit_start",
    stage: "Depositor fills Sections A+B+D at start; Refiner adds Section F; Assayer adds Section G; Vault fills Section H; DP fills Section C; NSDL approves",
    sentTo: ["nsdl","dp","vault","refiner"]
  },
  {
    id: "releaseTransfer",
    name: "Release & Transfer Letter (Vault-to-Vault)",
    requiredBy: "vault",
    filledBy: ["depositor"],
    generatedAt: "after_refiner",
    stage: "Depositor fills after gold reaches Refiner — vault-to-vault transfers only",
    sentTo: ["vault"]
  },
  {
    id: "depositLetter",
    name: "Deposit Letter",
    requiredBy: "vault",
    filledBy: ["depositor"],
    generatedAt: "after_refiner",
    stage: "Depositor fills after gold reaches Refiner",
    sentTo: ["vault","refiner"]
  },
  {
    id: "packingList",
    name: "Packing List & Purity Certificate",
    requiredBy: "vault",
    filledBy: ["depositor","refiner"],
    generatedAt: "after_refiner",
    stage: "Refiner generates after assay; Depositor co-signs",
    sentTo: ["vault","nsdl"]
  },
  {
    id: "indemnityLetter",
    name: "Letter of Indemnity",
    requiredBy: "vault",
    filledBy: ["depositor"],
    generatedAt: "after_refiner",
    stage: "Depositor fills after gold reaches Refiner",
    sentTo: ["vault","refiner"]
  },
  {
    id: "authLetter",
    name: "Authorisation Letter",
    requiredBy: "vault",
    filledBy: ["depositor"],
    generatedAt: "if_representative",
    stage: "Depositor fills only if gold delivered by authorised representative",
    sentTo: ["vault","collection"]
  },
];
```

**Role visibility**: Refiner, Vault Manager, NSDL — always see ALL 6 docs (AUTO, no toggle needed).
Depositor can grant optional access to: Collection Centre, Assayer, DP.

---

## FORM 45 — 4-STEP WIZARD (role-coloured fields)

Each field colour-coded by who fills it at that stage:
- 🔵 Blue (`#1D4ED8`) = Depositor
- 🟢 Green (`#16A34A`) = DP/Broker
- 🟠 Amber (`#B45309`) = Refiner
- 🟣 Purple (`#6D28D9`) = Assayer
- 🟡 Yellow (`#D97706`) = Vault Manager

**Step 0 — Depositor + DP**
- Section A (Depositor): Date, DP ID, Client ID, PAN, Aadhaar, Mobile, Holder names (Sole/First/Second/Third)
- Section B (Depositor): Deposit Unit selection (min 1g radio buttons), Trading Unit (min 100mg)
- **Denomination Split Calculator**: After selecting deposit unit, depositor splits into trading denominations. e.g. 11g → 10g×1 + 1g×1. Live validation: total must equal deposit weight. Counter buttons (−/+) per denomination with max units enforced.
- Section C (DP): Broker name, Account no., VMID (read-only PAN/Aadhaar from Section A)
- Section D (Depositor): Accreditation — radios from admin-configured refiner list (Parker Precious Metals LLP, Augmont Enterprise, Gujarat Gold Centre + LBMA if admin enabled)
- Section E (DP): ISIN table with deposit ☑ and trading ☑ tick columns

**Step 1 — Refiner + Assayer + Vault**
- Section F (Refiner): Purity (999/995 select), Total bars, Bar No. from/to, Weight in figures + words
- Section G (Assayer): Denomination received, Purity result, Verifier name
- Section H (Vault Manager): Denomination received, Purity confirmed, Vault Seal No., VMID, Received date
- InfoBox: "Vault Manager: bars >100g must have bar number recorded in Section F"

**Step 2 — T&C pagination**
- 15 clauses loaded from `localStorage("egr_disclaimers")` via `getForm45TC()`
- Prev/Next navigation with counter "§N / 15"
- "I Agree to all T&C" button only appears on last clause
- On agree: show OTP/Digital signature table for all 3 holders

**Step 3 — Authorisation**
- DP Participant Authorisation section (certifies form complete)
- Vault Manager Acknowledgement (detachable): "We acknowledge receipt of X bars of Yg gold (purity) from [holder] having Demat ID..."
- Seal No., Date, Vault Manager Stamp & Signature (OTP/Digital)
- Success state: "✅ Form 45 Complete — DRN will be generated by DP in eDPAM"
- Footer: Print + Download buttons always visible

---

## 3-TIER DENOMINATION MATRIX (Admin configurable)

```
Tier 1: DEPOSIT      min 1g    (physical gold accepted)
Tier 2: EGR CREATE   min 1g    (ISINs created in demat)
Tier 3: TRADING      min 100mg (tradeable on NSE — SEBI 1/10 of 1g)
```

Admin `AdminDenomMatrix` component:
- Confirmed minimums banner (from domain expert)
- 3 separate tier grids (each showing all denominations as clickable cards)
- Cards below minimum are locked/greyed and show "(below min)"
- SEBI badge on 100mg in trading tier
- Split calculator: select a deposit unit → shows EGR create options AND trading options
- Summary table: all deposit units → allowed create units, allowed trade units
- Persisted to `localStorage("DENOM_MATRIX3")`
- Reset to confirmed minimums button

---

## ADMIN PORTAL — 12 TABS

`["Roles","Approvals","Users","Mail","Trades","Orders","ISINs","Disclaimers","Rate Cards","Accreditation","SEBI Rules","Denom Matrix"]`

### Tab 6: ISINs (`AdminISINs`)
2 flag groups per ISIN row:
- **Denomination type** (colour-coded buttons): Deposit (blue), EGR Create (green), Trading (purple)
- **Operational** (grey buttons): Pickup, Delivery, Extinguish
- Toggle switch for enabled/disabled (disabling auto-clears all flags)
- Grouped by gram weight (100mg → 1g → 10g → 100g → 1kg)
- Confirmed minimums banner at top

### Tab 7: Disclaimers (`AdminDisclaimers`)
- Editable textarea per T&C clause (§1–§15 for Form 45)
- Additional: `assay_disclaimer`, `extinguish_warning`
- Save to `localStorage("egr_disclaimers")` — live, no redeploy

### Tab 8: Rate Cards (`AdminRateCards`)
10 configurable charge fields saved to `localStorage("RATE_CARDS")`:
```javascript
{ collection:500, assay:300, refining:150, vaulting:25, insurance:0.15,
  courier:200, dematCredit:100, extinguish:200, gst:0.03, processingFee:500 }
```

### Tab 9: Accreditation (`AdminAccreditation`)
- NSE Empanelled Refiners: Parker Precious Metals LLP, Augmont Enterprise (India) Pvt Ltd, Gujarat Gold Centre Pvt Ltd — each enable/disable toggle
- LBMA toggle (global + per-refiner)
- Add custom refiners (NSE or LBMA type)
- Saved to `localStorage("ACCREDITATION")` — feeds Form 45 Section D radios

### Tab 10: SEBI Rules (`AdminSEBIRules`)
- Denomination ratio: preset buttons `1/1000` `1/100` `1/10` `1/1` + custom numerator/denominator
- SEBI Circular Reference (editable text)
- Effective Date picker
- Min deposit grams, Max ISIN per demat, Margin block %, Settlement cycle (T+0/T+1/T+2)
- Saved to `localStorage("SEBI_RULES")`

### Tab 11: Denom Matrix (`AdminDenomMatrix`) — see section above

---

## VAULT MASTER (8 locations)

```javascript
const VAULT_MASTER = [
  {id:"MUM-W",  name:"Sequel Mumbai West",   city:"Mumbai",    zone:"West",  pin:["400053","400058","400047","400049","400050"], status:"open",  vmid:"VM010013"},
  {id:"MUM-E",  name:"Sequel Mumbai East",    city:"Mumbai",    zone:"East",  pin:["400097","400071","400060"], status:"open",  vmid:"VM010014"},
  {id:"DEL",    name:"Sequel Delhi NCR",       city:"Delhi",     zone:"North", pin:["110001","110020","110030"], status:"open",  vmid:"VM010015"},
  {id:"BLR",    name:"Sequel Bengaluru",       city:"Bengaluru", zone:"South", pin:["560001","560040","560068"], status:"open",  vmid:"VM010016"},
  {id:"CHN",    name:"Sequel Chennai",         city:"Chennai",   zone:"South", pin:["600001","600040"], status:"open",  vmid:"VM010017"},
  {id:"AHM",    name:"Sequel Ahmedabad",       city:"Ahmedabad", zone:"West",  pin:["380009","380015"], status:"open",  vmid:"VM010018"},
  {id:"KOL",    name:"Sequel Kolkata",         city:"Kolkata",   zone:"East",  pin:["700001","700020"], status:"soon",  vmid:"VM010019"},
  {id:"HYD",    name:"Sequel Hyderabad",       city:"Hyderabad", zone:"South", pin:["500001","500032"], status:"soon",  vmid:"VM010020"},
];
```

`nearestVault(pincode)` — matches first 3 digits of pin against vault pin list, returns nearest.

---

## KYC REGISTRATION — 3-STEP WIZARD

**Step 0**: Entity type — "Individual" or "Company"

**Step 1 (Individual)**: Aadhaar, PAN, Full name, Mobile, Email, Address
**Step 1 (Company)**: PAN, CIN (21-char), GSTIN (15-char), Company name, Authorised signatory, Email, Address

**Step 2**: Demat account details + Bank account

**Step 3**: OTP verification (6-digit, simulated) — success → KYC Verified badge

Stored in `localStorage("egr_user")`

---

## ROLE SCREENS (Operational portals)

Each role screen uses `RolePanel` wrapper with NavBar + role Badge.

### Depositor screens:
- `Home` — EGR balance card, quick actions grid, notifications
- `CreateEGR` — source selection (from me / from refiner / in-vault), vault picker with nearest auto-select
- `Track` — stepper timeline T+0 to T+10
- `Extinguish` — quantity selector with **live GST breakdown**:
  - Gold value (qty × grams × ₹7000/g)
  - GST 3% on gold value (from rate card)
  - Extinguish charge (from rate card)
  - GST 3% on extinguish charge
  - **Total Due** (red, must pay before vault release)
- `MyDocs` — 6 documents per EGR with role access toggles (AUTO for Refiner/Vault/NSDL; checkbox for Collection/Assayer/DP)
- `Payment` — charges breakdown
- `WorkflowDiagram` — toggle slider: "🥇 Gold Flow" vs "📊 Data Flow"

### Operator screens:
- `Collection` — receive gold, photo upload, weight entry
- `Assayer` — purity assessment, Form 45 Section G
- `Refiner` — 4 tabs (Incoming/Refining/Certified/Documents), denomination assignment
- `Vault` — 3 tabs (Inbound/In custody/Extinguish), bar number verification
- `DP` (Broker) — eDPAM entry, DRN generation, demat credit
- `NSDLScreen` — 4 tabs (EGR Issuance/ISIN Registry/DP Communications/Reconciliation)
- `Admin` — 12-tab admin console

---

## SERVICE WORKER (`sw.js`)

```javascript
const CACHE = "nse-egr-v4";
const ALWAYS_NETWORK = ["/", "/index.html"];  // network-first, fallback to cache
const STATIC_ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

// Strategy:
// ALWAYS_NETWORK → try network, on fail serve cache
// STATIC_ASSETS → cache-first
// Fonts → network-first with cache fallback
// skipWaiting() on install + message listener for SKIP_WAITING from UI
```

Update banner: `showUpdateBanner()` — green "🚀 New version available — tap to update" bar.
Triple-layer detection: `reg.waiting`, `updatefound` event, `controllerchange` event.

---

## DISCLAIMERS DEFAULTS

```javascript
const DISCLAIMERS_DEFAULTS = {
  form45_1: "The applicant/depositor hereby confirms that the physical gold submitted for creation of EGR(s) is genuine, legally owned...",
  form45_2: "The request for conversion of physical gold into EGR(s) shall be subject to verification, assaying, validation, and approval by the DP, Vault Manager, Assayer, Refinery, Depository, Clearing Corporation, and the Exchange.",
  // ... §3 through §15 covering: free from lien, vault procedures, EGR irreversibility,
  //     depositor bears charges, discrepancy → rejection, DP entry into eDPAM,
  //     EGR credit only after full workflow, no liability for force majeure,
  //     EGR creation is irreversible post Vault Manager acceptance,
  //     gold must be LBMA or NSE empanelled refiner, bar numbers >100g mandatory,
  //     auth letter mandatory if rep delivers, SEBI/NSE jurisdiction for disputes
  assay_disclaimer: "Assay results are based on standard industry testing methods. Purity discrepancies >0.5% trigger rejection...",
  extinguish_warning: "Once gold is deposited for EGR, physical return in the same form is NOT possible. Extinguish is irreversible post Vault Manager acceptance.",
};
```

---

## NAVIGATION STRUCTURE

**Bottom tab bar** (`BTab`): Home · EGRs · Track · Certificate · Notifications

**Sidebar** (hamburger menu) — grouped sections:
```
Depositor: Login, Register, Home, Workflow, EGR Creation, Track, Notifications,
           Review/Recall, Charges, Extinguish, My Documents

Documents: Form 45 & Deposit Letter, Gold Packing List, Letter of Indemnity,
           Authorisation Letter, Pickup & Vault Letter, Release & Transfer

Operators: Collection Centre, Assayer, Refiner, Vault Manager, DP/Broker,
           NSDL, WhatsApp Bot

Admin: Admin Console
```

**Route map** — all screens rendered as `{screen: ReactElement}` object, switched by `go(screenName)` state.

---

## WORKFLOW — 6 PHASES (Home Deposit)

```
Phase 1: Collection (T+0)     — Sequel pickup, weigh, package, AWB
Phase 2: Assay (T+1–2)        — Refiner assays purity ≥95% check
Phase 3: Refining (T+2–4)     — Heat treat if 92–99%, certify 995/999
Phase 4: Vaulting (T+4–6)     — Vault receives, bar# verify, Aadhaar verify
Phase 5: DP Entry (T+6–7)     — eDPAM DRN entry, demat credit
Phase 6: NSDL Approval (T+7–10) — 3 checkpoints → ISIN LIVE
```

**NSDL 3 checkpoints**:
1. PAN + Aadhaar verified in NSDL master
2. Purity ≥95%, bar numbers unique
3. Demat limit OK, DP balance sufficient

---

## UTILITY COMPONENTS

```javascript
// Primitive UI components (all take children + style prop):
NavBar({title, onBack, right})       // sticky top bar with back arrow
Scroll({children})                   // scrollable content area
Card({tone, children})               // white rounded card (tones: teal, amber, dark)
Btn({kind, sm, onClick})             // button (kinds: cobalt, green, teal, amber, orange, out, red)
Badge({c})                           // pill badge (colours: green, red, amber, blue, gold)
InfoBox({tone})                      // info/warning/success box
Sec({style})                         // section heading
Row({k, v, last})                    // key-value row
Field({label, value, readOnly})      // form field with label
Tabs({tabs, active, onChange})       // tab bar
PhotoUpload({label, done, onCapture}) // camera capture button
```

---

## HELPER FUNCTIONS

```javascript
loadISINState()       // loads from localStorage, merges with ISIN_MASTER defaults
saveISINState(state)  // persists ISIN flag state
enabledISINs()        // returns enabled ISINs only
nearestVault(pin)     // returns vault by pin prefix match
loadDisclaimers()     // loads from localStorage, falls back to DISCLAIMERS_DEFAULTS
saveDisclaimers(d)    // persists disclaimer edits
getForm45TC()         // returns array of 15 T&C strings (from localStorage)
loadAccredRefiners()  // loads admin-configured refiners for Form 45 Section D
canViewDoc(role, depositId, docType)      // returns true if role can see document
grantDocAccess(depositId, docType, role)  // grants access, persists to localStorage
revokeDocAccess(depositId, docType, role) // revokes, persists
fmtINR(n)             // formats number as ₹1,23,456
printDoc()            // window.print()
downloadDoc(name)     // triggers browser download of current doc page
```

---

## DEPLOYMENT FILES

**`sw.js`**: Service worker (separate file, ~80 lines)
**`manifest.json`**: PWA manifest — name, icons, theme_color: #0F2C59
**`_headers`**: Cloudflare/Netlify cache headers — no-cache for HTML, 1yr for icons
**`deploy.sh`**:
```bash
wrangler pages deploy . --project-name=nse-egr-pwa --branch=main
git add -A && git commit -m "deploy: $(date)" && git push origin main
```
URLs:
- `https://nse-egr-pwa.pages.dev`
- `https://anubhavkrsah1.github.io/nse-egr-pwa/`

---

## IMPORTANT PRODUCT DECISIONS

1. **Single file** — all JS inlined to avoid Cloudflare CDN timing issues with separate files
2. **Form 45 = Deposit Letter** — same document, just referenced by two names
3. **6 documents not 7** — Release & Transfer only for vault-to-vault (not normal deposit)
4. **Refiner / Vault / NSDL always see all docs** — hardcoded AUTO access, no depositor toggle needed
5. **3 denomination tiers** — Deposit ≥1g, EGR Create ≥1g, Trading ≥100mg (confirmed, may change via SEBI Rules admin tab)
6. **SEBI 1/10 rule** — current: 1/10 ratio; admin can change to 1/100 or 1/1000 without redeploy
7. **Extinguish GST = 3%** — applied on gold value AND on extinguish charge separately, shown in breakdown
8. **Disclaimers editable from admin** — so SEBI regulatory changes never require code changes
9. **Rate cards editable from admin** — collection, assay, refining, vaulting, insurance, courier, GST all configurable
10. **Accreditation from admin** — NSE empanelled refiners (Parker, Augmont, GGC) + optional LBMA, drives Form 45 Section D radios
11. **Nearest vault auto-selected** by pin code prefix match, depositor can override
12. **OTP/Digital signatures** throughout — no wet ink required
13. **NSDL screen** is separate from DP — NSDL = National Securities Depository (registry), DP = Depository Participant (broker like Zerodha)
14. **Vault Manager does Aadhaar verification** — not Collection Centre
15. **Bar numbers mandatory only for bars >100g**

---

## REGULATORY CONTEXT

- **SEBI EGR Circular** — SEBI/HO/MRD/MRD-POD-2/P/CIR/2021/0603 (effective 2021-11-28)
- **India DPDP Act 2023** — max penalty ₹250 crore; data fiduciary must not retain PII beyond purpose
- **SEBI 5-year retention** — all EGR documents and custody chain records
- **NSE Good Delivery Standard** — 99.5% (995) or 99.9% (999) purity
- **GST on extinguish** — 3% on gold value at time of withdrawal
- **3 NSE Empanelled Refiners** — Parker Precious Metals LLP, Augmont Enterprise (India) Pvt Ltd, Gujarat Gold Centre Pvt Ltd

---

## COMPLETE COMPONENT LIST (89 functions)

Admin, AdminAccreditation, AdminDenomMatrix, AdminDisclaimers, AdminISINs, AdminRateCards, AdminSEBIRules, App, Assayer, AuthLetter, BTab, Badge, Broker, Btn, Card, Cert, Collection, CreateEGR, DP, DepositLetter, DepositorDocuments, DocPrintBar, Extinguish, Field, FlowMap, Flyer, Form45, FormSelect, Grievance, Home, IndemnityLetter, InfoBox, Journeys, Live, Login, MyDocs, NSDLScreen, NavBar, Notifs, OtpModal, PackingList, Payment, PhotoUpload, Pickup, PickupVaultLetter, Refiner, Register, ReleaseTransferLetter, Review, RoleMap, RolePanel, Row, Scroll, Sec, Sidebar, Tabs, TermsModal, Track, Vault, WhatsApp, Wordmark, WorkflowDiagram

---

*Generated: 2026-06-10 | App version: 4.0 | 4726 lines | 283KB JS*
