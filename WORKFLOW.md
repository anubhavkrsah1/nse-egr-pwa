# NSE Good Gold EGR — Complete Workflow Diagram

## Phase Overview (6 Phases)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    NSE GOOD GOLD EGR DEPOSIT WORKFLOW                               │
│                           (Residential gold)                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   DEPOSITOR  │
                         │   (KYC+     │
                         │  Gold+      │
                         │  DRN)       │
                         └──────┬───────┘
                                │
                    ┌───────────┴──────────────┐
                    │                          │
              ┌─────▼─────┐          ┌────────▼────────┐
              │ FROM ME    │          │  FROM REFINER   │
              │ (gold@home)│          │  (empanelled)   │
              └─────┬─────┘          └────────┬────────┘
                    │                          │
        ┌───────────┴──────────────┬───────────┴─────────────────┐
        │                          │                             │
        │  Step 1: Collect         │  Step 1: Receive            │
        │  (50 km serviceable)     │  (Refiner's own gold)       │
        │  Via Sequel              │                             │
        │                          │                             │
        └───────────┬──────────────┴─────────────────────────────┘
                    │
                    │ (All paths converge)
                    │
        ┌───────────▼─────────────┐
        │  Step 2: ASSAY (Refiner)│
        │  - Purity test          │
        │  - Weight verify        │
        │  - Issue Packing List   │
        │  - Certify: ✅ GOLD95+  │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────────────────┐
        │  Step 3: REFINE (if <95% purity)    │
        │  - Heat treat            │
        │  - Assign denominations  │
        │  - Parker/Augmont/GGC    │
        │  - Issue cert: 95.0% ✓   │
        └───────────┬─────────────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │  Step 4: VAULT             │
        │  - Assign ISIN+serial      │
        │  - Store in locker         │
        │  - Issue receipt           │
        │  - Bar No. matches         │
        │  - Vault Mgr sign-off      │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │  Step 5: DP ENTRY (eDPAM)    │
        │  - Credit demat account     │
        │  - (Zerodha/Grow/Motilal)   │
        │  - ISIN-wise units          │
        │  - SMS notification         │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │  Step 6: NSDL REGISTRATION   │
        │  - EGR approval             │
        │  - Registry update          │
        │  - Transferable status      │
        │  - ISIN live                │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │  ✅ LIVE EGR                │
        │  - Tradeable on NSE         │
        │  - Monthly vaulting charges │
        │  - Insurance active         │
        │  - Can extinguish anytime   │
        └──────────────────────────────┘
```

---

## Actor Roles & Responsibilities

| Role | Responsibility | Checklist |
|------|---|---|
| **Depositor** | KYC, submit gold, pay charges, manage docs | ✓ AADHAAR+PAN (Indiv) or PAN+CIN+GSTIN (Co) |
| **Collection Centre / Sequel** | Pickup gold (50km), weigh, package | ✓ Photo proof, AWB, temp receipt |
| **Refiner** | Assay, heat-treat, certify purity, generate packing list | ✓ Assay cert ≥95%, packing list, denom |
| **Vault Manager** | Receive gold, store in locker, issue receipt | ✓ Bar number match, Aadhaar verification |
| **DP (Broker)** | Enter DRN in eDPAM, credit demat account | ✓ ISIN+qty credited, margin blocked |
| **NSDL** | Register EGR, activate ISIN, maintain registry | ✓ Approval, live status, transferable |

---

## Document Flow (6 Mandatory)

| # | Document | Created By | Stage | Visible To |
|---|----------|-----------|-------|------------|
| 1️⃣ | **Form 45 & Deposit Letter** | Depositor | Start | All roles |
| 2️⃣ | **Gold Packing List** | Refiner | Assay complete | Refiner, Vault, NSDL |
| 3️⃣ | **Letter of Indemnity** | Depositor | Start | All roles |
| 4️⃣ | **Authorisation Letter** | Depositor | If rep delivers | Relevant roles |
| 5️⃣ | **Vault Acceptance Cert** | Vault Mgr | Vault confirms | Refiner, Vault, NSDL |
| 6️⃣ | **Settlement Confirmation** | DP/NSDL | Account credited | All roles |

---

## Charge Breakdown (Rate Card)

```
Deposit: 24.0g gold @ 999 purity

From Home Scenario:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Item                          Rate           Amount
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection                    ₹500           ₹500
Assay                         ₹300           ₹300
Refining (if needed)          ₹150/g         ₹0 (99.9%)
Vault Storage                 ₹25/g/month    ₹600 (annual)
Insurance                     0.15% p.a.     ₹36
Courier                       ₹200           ₹200
Demat Credit                  ₹100           ₹100
Processing Fee                ₹500           ₹500
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal                                     ₹2,236
GST (3%)                                     ₹67
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Charges                                ₹2,303
EGR Units Created                            2×GOLD10G999 + 4×GOLD1G999
═══════════════════════════════════════════════════════════
```

---

## System Integration Points

### 1. DAN API Registration
- **By**: NSDL
- **When**: Form 45 submitted
- **What**: Register depositor in DAN master
- **Fields**: PAN, AADHAAR, NAME, ADDRESS, BANK

### 2. Demand Request Tracker
- **By**: NSE/NSDL
- **When**: Weekly
- **What**: Monitor pending DRNs → Vault transfers
- **Action**: Escalate >7 days pending

### 3. Billing Dashboard
- **By**: NSE Finance
- **When**: Monthly
- **What**: Invoice depositors for vaulting/insurance
- **Output**: Bill PDF, email to demat email

### 4. Out-of-Pocket Expenses
- **By**: DP/Refiner
- **When**: Claim submission
- **What**: Recover excess weights, purity loss
- **Example**: Gold loss >5g → claim ₹5k recovery

### 5. RTA Intimation
- **By**: DP → RTA (Registrar)
- **When**: After DP credit
- **What**: Notify RTA of new ISIN holders
- **Data**: ISIN, holder name, qty, DP code

### 6. Brinks Address
- **By**: Logistics partner
- **When**: Pickup scheduled
- **What**: Confirm pickup time & address
- **Via**: SMS + email confirmation

### 7. Extinguish GST
- **By**: Depositor + Refiner
- **When**: EGR extinguish request
- **What**: Calculate 3% GST on gold value
- **Payment**: Depositor pays before gold release

---

## NSDL Intervention Checkpoints

```
Form 45 Submission
         │
         ├─→ [NSDL CHECK 1: PAN/AADHAAR verification]
         │   │ ✓ Pass → Continue
         │   └ ✗ Reject → Email & SMS to depositor
         │
Assay Complete → Refiner generates Packing List
         │
         ├─→ [NSDL CHECK 2: Purity ≥95.0%?]
         │   │ ✓ Yes → Approve denomination
         │   └ ✗ No → Hold, request resample
         │
DP Entry (eDPAM)
         │
         ├─→ [NSDL CHECK 3: Demat limit check]
         │   │ ✓ Within limit → Activate ISIN
         │   └ ✗ Exceeds limit → Queue for next day
         │
EGR LIVE & TRANSFERABLE
```

---

## Monthly Operations

### Vaulting Charge Cycle
```
1st of month:
  └─ NSE calculates vaulting for all EGRs
  └─ DP invoices depositors
  └─ Charged before T+1 of next month
  
If no payment:
  └─ EGR frozen (not tradeable)
  └─ SMS reminder sent
  └─ Email escalation after 3 days
```

### Insurance Premium
```
Annual insurance: 0.15% of gold value
  └─ Monthly deduction: 0.0125%
  └─ Deducted with vaulting
  └─ If gold value drops → credit refund
```

---

## Extinguish Path (Irreversible)

```
Depositor clicks "Extinguish"
         │
         ├─→ Confirm: Cannot undo
         │
         ├─→ DP confirms request
         │
         ├─→ Refiner schedules release
         │
         ├─→ Calculate GST: 3% × gold weight × rate
         │   Example: 24g × ₹7000 = ₹168,000
         │   GST = ₹5,040
         │
         ├─→ Depositor pays GST
         │
         ├─→ Vault releases gold to refiner
         │
         ├─→ Refiner ships to depositor / address
         │
         ├─→ NSDL marks EGR as extinguished
         │
         └─→ ✅ FINAL (no recovery)
```

---

## Key Dates & SLAs

| Phase | Actor | SLA | Alert |
|-------|-------|-----|-------|
| Collection | Sequel | Same day | >4 hours = SMS |
| Assay | Refiner | T+1 | >2 days = escalate |
| Vault | Vault Mgr | T+2 | >3 days = hold |
| DP Entry | Broker | T+3 | >4 days = freeze |
| NSDL Approval | NSDL | T+5 | >7 days = reject |
| Monthly Charges | NSE | 1st of month | Auto-freeze if unpaid |

---

## Error Scenarios

### Scenario 1: Purity < 95%
```
Refiner assays gold
└─ Purity = 92.5% (below 95% threshold)
└─ Send to resampling
└─ If still <95% → Reject, return to depositor
└─ Refund all charges except refining
```

### Scenario 2: Bar Number Mismatch
```
Vault receives packing list with Bar# "B001"
└─ Physical gold has Bar# "B002"
└─ Vault rejects batch
└─ Inform refiner → audit trail
└─ Hold gold, contact depositor
```

### Scenario 3: DRN Pending >7 Days
```
Form 45 submitted → DRN generated
└─ After 7 days: no DP entry
└─ NSE escalates to DP
└─ SMS to depositor: "Your EGR is delayed"
└─ Refund collection charges if >14 days
```

---

## Data Storage (localStorage + API)

```javascript
// Depositor Account
{
  panNo: "XXXXX1234A",
  aadharNo: "XXXX-XXXX-1234",
  kyc: { verified: true, date: "2024-05-15" },
  egreList: [
    { 
      id: "EGR20240519001",
      isin: "INE950H01028",  // GOLD10G999
      quantity: 2,
      status: "LIVE",
      createdDate: "2024-05-19",
      goldenAtVault: "Mumbai-West",
      documents: [ ... ],
      monthlyCharges: [ ... ]
    }
  ]
}
```

---

## Admin Controls (Rate Card)

```javascript
RATE_CARDS = {
  collection: 500,           // ₹500 per deposit
  assay: 300,                // ₹300 per assay
  refining: 150,             // ₹150 per gram refining
  vaulting: 25,              // ₹25 per gram per month
  insurance: 0.15,           // 0.15% per annum
  courier: 200,              // ₹200 per shipment
  dematCredit: 100,          // ₹100 per demat credit
  extinguish: 200,           // ₹200 per extinguish
  gst: 0.03,                 // 3% GST
  processingFee: 500         // ₹500 flat processing
}
```

---

## Deployment Status

- ✅ **Single-file PWA** (366 KB, self-contained)
- ✅ **Service Worker caching** (network-first HTML, cache-first assets)
- ✅ **Cloudflare Pages** (instant global CDN)
- ✅ **GitHub Pages** (git push auto-deploy)
- ✅ **Admin portal** (ISIN, Disclaimers, Rate Cards)
- ✅ **KYC registration** (Individual + Company)
- ✅ **Document access control** (role-based visibility)
- ✅ **Form 45 wizard** (3-step with T&C pagination)
- 🔄 **Monthly billing** (not yet wired)
- 🔄 **Out-of-pocket expense tracking** (backlog)

---

**Last Updated**: 2026-06-02  
**Version**: 3.0 (Rate Cards + Consolidated Documents)
