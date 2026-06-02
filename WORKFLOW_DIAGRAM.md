# NSE Good Gold EGR — Complete Workflow Diagram

## Phase 1: REGISTRATION (Depositor → DP verification)

```
┌─────────────────────────────────────────────────────────────────┐
│ DEPOSITOR Registration                                          │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 1. Fill details: Name, PAN, Aadhaar, Mobile, Email       │  │
│ │ 2. Demat Account: DP ID, BO ID, Broker Name, UCC        │  │
│ │ 3. Bank Account: Account #, IFSC, for settlement        │  │
│ └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│ ┌─ NSDL INTERVENTION #1: REGISTRATION ─────────────────────┐  │
│ │ API: DAN API → Verify DP ID + Client from 100s brokers  │  │
│ │ API: PAN/DOB → Fetch demat account from 4 RTA (NSDL)   │  │
│ │ Verify: Demat exists? BO ID matches? Active account?   │  │
│ │ Result: ✅ PASS → Proceed | ❌ FAIL → Reject           │  │
│ └────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│ ✅ Registration Complete → Ready for EGR Creation              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: DEPOSIT WORKFLOW (3 paths, single app flow)

```
┌────────────────────────────────────────────────────────────────┐
│ DEPOSITOR: EGR Creation Screen                                │
│ "Where is your gold?" → Radio buttons:                        │
│  ○ From me (home pickup or walk-in)                          │
│  ○ In-vault same (already in Sequel, same vault)            │
│  ○ In-vault different (Sequel vault, want to move)         │
│  ○ Other vault (non-Sequel custody, transfer in)           │
│  ○ Refiner (direct from Parker/Augmont)                     │
└────────────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
 FROM ME          IN-VAULT SAME/DIFF        REFINER DIRECT
 ┌──────────┐    ┌──────────────────┐    ┌─────────────────┐
 │ Home pin │    │ Internal transfer │    │ Direct shipment │
 │ or       │    │ No physical move  │    │ Refiner → Vault │
 │ Walk-in  │    │ Just demat credit │    │ Courier tracked │
 └──────────┘    └──────────────────┘    └─────────────────┘
    ↓                   ↓                       ↓
 SEQUEL PICKUP   NSDL DEMAND      REFINER CONFIRMATION
 or COLLECTION   REQUEST API       via RTA
```

---

## Phase 3: NSDL INTERVENTION #2: REFINER → RTA → INTIMATION

```
┌─────────────────────────────────────────────────────────────────┐
│ REFINER receives gold from:                                    │
│  • Collection Centre (after assay)                             │
│  • Direct shipment (if from me or in-vault)                   │
├─────────────────────────────────────────────────────────────────┤
│ REFINER WORKFLOW:                                              │
│ 1. Confirm receipt in app                                      │
│ 2. Convert to standard bars (if needed)                       │
│ 3. Create packing slip with bar numbers & weight             │
│ 4. Send to Vault Manager (Sequel)                            │
│                           ↓                                     │
│ NSDL RTA INTIMATION:                                           │
│ Refiner notifies NSDL RTA of:                                 │
│  • Bar numbers, weight, purity                                │
│  • Destination: Vault Manager & location                      │
│  • Customer: DP ID, BO ID, Demat Account                     │
│ (Refiner submits Form 45 + docs to NSDL)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: NSDL INTERVENTION #3: VAULT MANAGER CONFIRMATION & EGR CREATION

```
┌─────────────────────────────────────────────────────────────────┐
│ VAULT MANAGER (Sequel) receives gold                           │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 1. Scan bar numbers, weigh, verify purity               │  │
│ │ 2. Cross-check against Refiner's packing slip           │  │
│ │ 3. Upload Form 45, Packing List, all 9 documents       │  │
│ │ 4. Take photo of gold receipt                           │  │
│ └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│ ┌─ NSDL INTERVENTION #3: EGR CREATION REQUEST ─────────────┐  │
│ │ VAULT MANAGER clicks: "Confirm & Create EGR"            │  │
│ │  ↓ System sends:                                         │  │
│ │  • Bar numbers, weight, purity (validated)             │  │
│ │  • Depositor: DP ID, BO ID, Demat Account             │  │
│ │  • Denominations to issue (100mg, 1g, 10g, etc.)       │  │
│ │  ↓ NSDL chooses:                                        │  │
│ │  ✅ CREATE EGR → Issue ISIN, units to demat            │  │
│ │  ❌ REJECT → Return gold to refiner (with reason)      │  │
│ └────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│ DAILY DATA DUMP TO NSDL (Excel → API):                        │
│ • Vault Manager confirms all gold received & stored          │
│ • List: Depositor name, demat, gold qty, denominations      │
│ • NSDL creates EGR, credits to DP/Demat                      │
│                           ↓                                     │
│ DP RECEIVES DEMAND REQUEST (via DP system):                   │
│ • API pulls: "Create EGR for 50g 999 purity → 5×10g units"  │
│ • DP Checker reviews & confirms                              │
│ • EGR credited to client's demat account (T+1)              │
│ • Customer gets notification: "EGR live in your account"     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: BILLING (End of Month, Broker-wise)

```
┌─────────────────────────────────────────────────────────────────┐
│ BILLING SYSTEM (NSDL → Broker)                                │
│                                                                 │
│ 3 Components:                                                   │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ 1. VAULTING & INSURANCE CHARGES                         │   │
│ │    • Per EGR created: X % on quantity held              │   │
│ │    • Daily accrual: qty × rate / 365                   │   │
│ │    • Example: 50g @ 0.5% = 2.5 paisa/day             │   │
│ │    • Broker invoiced: 50g × rate × days               │   │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ 2. OUT-OF-POCKET EXPENSES (Recoverable)                │   │
│ │    a) COURIER CHARGES                                   │   │
│ │       • Collection → Assay → Refiner → Vault            │   │
│ │       • Tracked per shipment leg (3 charges)            │   │
│ │       • Bill broker (DP) per customer assignment        │   │
│ │    b) ASSAYER CHARGES                                   │   │
│ │       • Per EGR created (qty-based)                    │   │
│ │       • Rate card agreed with assayer                   │   │
│ │       • Recover via broker/DP                           │   │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ 3. EGR MAKING CHARGES                                   │   │
│ │    • Flat fee per EGR issued (e.g., ₹500)             │   │
│ │    • Count: EGRs created in month                       │   │
│ │    • Broker invoiced once per customer per month        │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ INVOICE GENERATION:                                             │
│  Broker-wise, line items for each customer:                   │
│  • Vaulting: 50g @ ₹5/month = ₹250                          │
│  • Courier: 3 legs @ ₹200 = ₹600                            │
│  • Assayer: 1 EGR @ ₹350 = ₹350                            │
│  • EGR Making: 1 unit @ ₹500 = ₹500                        │
│  ────────────────────────────                                │
│  TOTAL: ₹1,700 (recovered via broker UCC)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 6: EXTINGUISH (Withdraw Gold)

```
┌─────────────────────────────────────────────────────────────────┐
│ DEPOSITOR: "I want to withdraw my gold"                       │
│                           ↓                                     │
│ 1. Depositor selects EGRs to extinguish (qty & denominations) │
│ 2. System calculates: GST @ 3%                                │
│ 3. Depositor pays 3% GST (online via DP)                     │
│                           ↓                                     │
│ 4. VAULT MANAGER: Receives extinguish request                │
│    • Prepares physical gold (re-bars if needed)              │
│    • Packs for delivery to nominated address                 │
│    • Arranges insured courier                                │
│                           ↓                                     │
│ 5. DEPOSITOR: Receives gold at home address                  │
│    • Physical gold in sealed package with GST cert          │
│    • EGR deleted from demat (T+1)                           │
│                           ↓                                     │
│ ✅ EXTINGUISH COMPLETE                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## NSDL Intervention Points Summary

```
┌──────────────────────────────┐
│ NSDL HAS 3 CHECKPOINTS:      │
├──────────────────────────────┤
│ #1 REGISTRATION              │
│    • Verify Broker/BO ID     │
│    • Validate demat account  │
│    • Confirm with RTA        │
├──────────────────────────────┤
│ #2 REFINER INTIMATION        │
│    • RTA notified of details │
│    • Bar numbers registered  │
│    • Forwarding to vault     │
├──────────────────────────────┤
│ #3 VAULT CONFIRMATION        │
│    • Gold received verified  │
│    • Denominations allocated │
│    • EGR creation approved   │
│    • Credit to demat T+1     │
└──────────────────────────────┘
```

---

## APP INTERFACES TO BUILD

| Interface | Who Uses | Purpose | Current Status |
|-----------|----------|---------|-----------------|
| **DAN API Integration** | NSDL (via app) | Verify DP ID + Client | ❌ Needed |
| **Demand Request Tracker** | DP Operations | Track EGR creation requests | ❌ Needed |
| **Billing Dashboard** | NSDL Admin | Generate broker invoices | ❌ Needed |
| **Out-of-Pocket Expenses** | Accounting | Recover courier + assayer fees | ❌ Needed |
| **Vault Confirmation Flow** | Vault Manager | Approve/Reject EGR creation | ✅ Built |
| **Extinguish GST** | Payment | 3% GST collection before extinguish | ❌ Needed |
| **Depositor Address DB** | Brinks API | Fetch address for pickup/delivery | ❌ Needed |
| **RTA Intimation** | NSDL-RTA | Refiner → RTA → NSDL flow | ❌ Needed |

---

## Current Implementation Status

✅ **Phase 1-3 (Core Workflow):** Implemented
- Registration with KYC (Aadhaar + PAN)
- Deposit paths (home pickup, walk-in, in-vault)
- Vault Manager confirmation
- Form 45 + 9 documents

🔄 **Phase 4-6 (Operations & Billing):** To be added
- DAN API integration
- Demand request tracking
- Broker-wise billing engine
- Out-of-pocket expenses recovery
- Brinks address integration
- Extinguish GST calculation
