// ================================================================
// NSE Good Gold EGR — Database (IndexedDB)
// All app data is stored locally — works offline, no server needed
// ================================================================

const DB_NAME = "NSE_EGR_DB";
const DB_VERSION = 1;

const STORES = {
  users:        { keyPath: "id", autoIncrement: true },
  egrRequests:  { keyPath: "id", autoIncrement: true },
  pouches:      { keyPath: "id", autoIncrement: true },
  pickupJobs:   { keyPath: "id", autoIncrement: true },
  assayRecords: { keyPath: "id", autoIncrement: true },
  vaultEntries: { keyPath: "id", autoIncrement: true },
  dpInstructions:{ keyPath: "id", autoIncrement: true },
  notifications:{ keyPath: "id", autoIncrement: true },
  charges:      { keyPath: "id", autoIncrement: true },
};

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      Object.entries(STORES).forEach(([name, opts]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, opts);
          // indexes for fast lookup
          if (name === "egrRequests") {
            store.createIndex("status", "status", { unique: false });
            store.createIndex("customerId", "customerId", { unique: false });
          }
          if (name === "pouches") {
            store.createIndex("requestId", "requestId", { unique: false });
            store.createIndex("pouchNumber", "pouchNumber", { unique: true });
          }
          if (name === "notifications") {
            store.createIndex("userId", "userId", { unique: false });
            store.createIndex("read", "read", { unique: false });
          }
          if (name === "pickupJobs") {
            store.createIndex("executiveId", "executiveId", { unique: false });
            store.createIndex("status", "status", { unique: false });
          }
        }
      });
    };
  });
}

// ---- generic CRUD ----
async function add(storeName, record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).add({ ...record, createdAt: Date.now() });
    req.onsuccess = () => resolve(req.result);  // returns new id
    req.onerror = () => reject(req.error);
  });
}

async function put(storeName, record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).put({ ...record, updatedAt: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).index(indexName).getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function remove(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function count(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---- domain helpers ----
function genId(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase();
}

function ts() { return new Date().toLocaleString("en-IN"); }

// ---- seed demo data if empty ----
async function seedIfEmpty() {
  const n = await count("users");
  if (n > 0) return;

  // demo customer
  await add("users", {
    role: "customer", name: "Anoop Kumar", mobile: "+91 98765 43210",
    pan: "ABCDE1234F", dpId: "IN302324", boId: "1234567890123456",
    ucc: "NSEAB1234", email: "anoop@email.com", pin: "400053", city: "Mumbai"
  });
  // pickup executives
  await add("users", { role: "pickup", name: "Raju Nair",   id_code: "PKP-041", vehicle: "Bike · MH02-AB-4101", city: "Mumbai" });
  await add("users", { role: "pickup", name: "Suresh Iyer", id_code: "PKP-042", vehicle: "Bike · MH02-CD-8823", city: "Mumbai" });
  // CC staff
  await add("users", { role: "collection", name: "CC Staff — Andheri W", centre: "NSE Good Gold — Andheri West" });
  // assayer
  await add("users", { role: "assayer", name: "Assayer #AS-MH-0231", centre: "Andheri W" });
  // refiner
  await add("users", { role: "refiner", name: "Parker Precious Metals LLP" });
  // vault
  await add("users", { role: "vault", name: "Sequel Logistics · SEEPZ", vmId: "VM010013" });
  // dp
  await add("users", { role: "dp", name: "NSDL DP", dpId: "IN302324" });
  // admin
  await add("users", { role: "admin", name: "NSE EGR Admin" });

  // demo EGR request already in progress
  const reqId = await add("egrRequests", {
    requestRef: "EGR-REQ-20240318-001",
    customerId: 1,
    customerName: "Anoop Kumar",
    source: "pickup",
    channel: "Sequel home pickup",
    pin: "400053",
    city: "Mumbai",
    address: "12 Lokhandwala Complex, Andheri W",
    date: "Tue 18 Mar",
    slot: "11:30 am",
    goldForm: "bar",
    ownerDecl: true,
    status: "EGR_CREDITED",
    purity: "999",
    denomination: "2×GOLD10G999 + 4×GOLD1G999",
    assayedWeight: 24.0,
    egrId: "EGR20240321001",
    isin: "ING999300015",
    totalUnits: 50,
  });

  // demo pouch
  await add("pouches", {
    pouchNumber: "EGR-PCH-2034",
    requestId: reqId,
    executiveId: 2,
    status: "DELIVERED_TO_CC",
    pouchPhoto: "pouch_AK_2034.jpg",
    goldPhoto: "gold_direct_AK_2034.jpg",
    selfiePhoto: "selfie_AK_2034.jpg",
    otpVerified: true,
  });

  // demo pickup job
  await add("pickupJobs", {
    requestId: reqId,
    requestRef: "EGR-REQ-20240318-001",
    executiveId: 2,
    executiveName: "Raju Nair",
    customerName: "Anoop Kumar",
    address: "12 Lokhandwala Complex, Andheri W",
    pin: "400053",
    status: "COMPLETED",
    otpVerified: true,
    pouchNumber: "EGR-PCH-2034",
  });

  // notifications
  const notifs = [
    { userId: 1, icon: "✨", title: "EGR credited!", body: "24g (2×GOLD10G999 + 4×GOLD1G999) credited to demat. ID EGR20240321001.", read: false },
    { userId: 1, icon: "🏦", title: "Gold in vault", body: "Sequel Logistics SEEPZ — secure custody confirmed.", read: false },
    { userId: 1, icon: "🔬", title: "Refining complete", body: "Final 24.0g at 999 purity — matches approved assay.", read: false },
  ];
  for (const n of notifs) await add("notifications", { ...n, time: ts() });

  console.log("[EGR-DB] Seed data inserted");
}

// ================================================================
// EGR Request domain functions
// ================================================================
const EGR = {
  async createRequest(data) {
    const ref = genId("EGR-REQ");
    const id = await add("egrRequests", { ...data, requestRef: ref, status: "INITIATED" });
    await EGR.addNotification(data.customerId, "📅", "Request created", `Ref ${ref} — ${data.channel}.`);
    return { id, ref };
  },

  async updateStatus(requestId, status, extra = {}) {
    const req = await get("egrRequests", requestId);
    if (!req) return;
    await put("egrRequests", { ...req, ...extra, status });
  },

  async getByCustomer(customerId) {
    return getByIndex("egrRequests", "customerId", customerId);
  },

  async getAll() { return getAll("egrRequests"); },

  async createPickupJob(requestId, executiveId, executiveName, customerData) {
    const id = await add("pickupJobs", {
      requestId, executiveId, executiveName,
      customerName: customerData.name,
      address: customerData.address,
      pin: customerData.pin,
      status: "ASSIGNED",
    });
    await EGR.updateStatus(requestId, "PICKUP_ASSIGNED", { assignedExecutive: executiveName });
    return id;
  },

  async completePickup(jobId, pouchData) {
    const job = await get("pickupJobs", jobId);
    if (!job) return;
    await put("pickupJobs", { ...job, ...pouchData, status: "COMPLETED" });
    // create pouch record
    const pouchId = await add("pouches", {
      pouchNumber: pouchData.pouchNumber,
      requestId: job.requestId,
      executiveId: job.executiveId,
      status: "AT_CC",
      ...pouchData,
    });
    await EGR.updateStatus(job.requestId, "POUCH_AT_CC", { pouchId, pouchNumber: pouchData.pouchNumber });
    return pouchId;
  },

  async submitAssay(requestId, assayData) {
    const id = await add("assayRecords", { requestId, ...assayData, status: "PENDING_APPROVAL" });
    await EGR.updateStatus(requestId, "AWAITING_CUSTOMER_APPROVAL", { assayRecordId: id });
    return id;
  },

  async customerApproveAssay(requestId, split, purity) {
    await EGR.updateStatus(requestId, "APPROVED_TO_REFINER", { split, purity });
  },

  async refinerSubmit(requestId, refinerData) {
    const id = await add("vaultEntries", { requestId, ...refinerData, status: "REFINED" });
    await EGR.updateStatus(requestId, "REFINED", { refinerRecordId: id });
    return id;
  },

  async vaultConfirm(requestId, vaultData) {
    const req = await get("egrRequests", requestId);
    await put("egrRequests", { ...req, ...vaultData, status: "IN_VAULT" });
  },

  async dpCreditEGR(requestId, dpData) {
    const id = await add("dpInstructions", { requestId, ...dpData, status: "CREDITED" });
    await EGR.updateStatus(requestId, "EGR_CREDITED", { dpInstructionId: id, egrId: dpData.egrId });
    return id;
  },

  async addNotification(userId, icon, title, body) {
    return add("notifications", { userId, icon, title, body, read: false, time: ts() });
  },

  async getNotifications(userId) {
    return getByIndex("notifications", "userId", userId);
  },

  async markNotifRead(notifId) {
    const n = await get("notifications", notifId);
    if (n) await put("notifications", { ...n, read: true });
  },

  // stats for admin/dashboard
  async getStats() {
    const reqs = await getAll("egrRequests");
    const notifs = await getAll("notifications");
    const pouches = await getAll("pouches");
    return {
      totalRequests: reqs.length,
      byStatus: reqs.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {}),
      unreadNotifs: notifs.filter(n => !n.read).length,
      totalPouches: pouches.length,
    };
  },
};

// initialise on load
openDB().then(seedIfEmpty).catch(console.error);

window.EGR_DB = { openDB, add, put, get, getAll, getByIndex, remove, count, EGR, genId, ts };
