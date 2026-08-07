/* Bond Central — SPA shell, router and page renderers.
   Vanilla JS, hash-based routing, Chart.js for the visualisations. */

const NAV_ITEMS = [
  { href: "#/home", label: "Home", match: ["home", ""] },
  { href: "#/explore", label: "Explore", match: ["explore", "bond", "issuer"] },
  { href: "#/compare", label: "Compare", match: ["compare"] },
  { href: "#/market-activity", label: "Market Activity", match: ["market-activity"] },
  { href: "#/resources", label: "Resources", match: ["resources"] },
  { href: "#/about", label: "About Us", match: ["about"] },
];

const charts = {};
function paintChart(canvasId, config) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(el.getContext("2d"), config);
}

function fmtNum(n) { return Number(n).toLocaleString("en-IN"); }
function fmtDate(iso) {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
}
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "badge-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------------- shell ---------------- */
function renderShell() {
  document.getElementById("header-slot").innerHTML = `
    <a class="skip-link" href="javascript:void(0)" onclick="document.getElementById('app').setAttribute('tabindex','-1');document.getElementById('app').focus();">Skip to content</a>
    <header class="site-header">
      <a href="#/home" class="brand"><span class="dot"></span> NSE<br/></a>
      <nav class="main-nav" id="main-nav"></nav>
      <div class="powered-by">Powered by<br/><strong>Bond Central</strong></div>
    </header>`;
  document.getElementById("footer-slot").innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <h5>NSE</h5>
          <p>Find quick solutions and helpful tips for using Bond Central. We've compiled answers to the most frequently asked questions right here.</p>
        </div>
        <div><h5>About</h5><a href="#/about">Our story</a><a href="#/about">Careers</a><a href="#/resources">Blog</a><a href="#/about">Contact Us</a></div>
        <div><h5>Resources</h5><a href="#/resources">Help Center</a><a href="#/resources">API Documentation</a><a href="#/resources">Community</a><a href="#/resources">Partners</a></div>
        <div><h5>Products</h5><a href="#/explore">For Personal</a><a href="#/explore">For Business</a><a href="#/explore">Payment Solutions</a><a href="#/explore">Integrations</a></div>
        <div><h5>Support</h5><a href="#/about">Customer Support</a><a href="#/about">FAQ</a><a href="#/about">Report a Problem</a><a href="#/about">Security &amp; Privacy</a></div>
      </div>
      <div class="footer-bottom">
        <div class="links"><span>Privacy Policy</span><span>Cookie Policy</span><span>Legal</span></div>
        <div>2026 NSE Bond Central</div>
        <div class="social"><span>X</span><span>in</span><span>f</span><span>ig</span></div>
      </div>
    </footer>`;
}

function highlightNav(section) {
  const nav = document.getElementById("main-nav");
  nav.innerHTML = NAV_ITEMS.map(
    (it) => `<a href="${it.href}" class="${it.match.includes(section) ? "active" : ""}">${it.label}</a>`
  ).join("");
}

/* ---------------- router ---------------- */
function parseHash() {
  const raw = (location.hash || "#/home").replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query || "");
  return { section: parts[0] || "home", parts, params };
}

function router() {
  const { section, parts, params } = parseHash();
  highlightNav(section);
  const app = document.getElementById("app");
  window.scrollTo(0, 0);
  switch (section) {
    case "home": return renderHome(app);
    case "explore": return renderExplore(app, params);
    case "bond": return renderBondDetail(app, decodeURIComponent(parts[1] || ""));
    case "issuer": return renderIssuerDetail(app, decodeURIComponent(parts[1] || ""));
    case "compare": return renderCompare(app, params);
    case "market-activity": return renderMarketActivity(app);
    case "resources": return renderResources(app);
    case "about": return renderAbout(app);
    default: return renderHome(app);
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => { renderShell(); router(); });

/* ================= HOME ================= */
function renderHome(app) {
  app.innerHTML = `
    <section class="dark-band">
      <div class="hero">
        <h1><span class="accent">Discover</span> Listed Corporate Bonds on <span class="accent">Bond Central</span></h1>
        <p class="subtitle">Your Gateway to Investment Opportunities!</p>
        <div class="search-row">
          <div class="search-box">
            <input id="home-search" type="text" placeholder="Search ISIN, Issuer and more..." />
          </div>
          <button class="btn-orange" id="home-search-btn">Search</button>
        </div>
      </div>
      <div class="stat-panel">
        <h4>Listed Corporate Bond Details</h4>
        <div class="stat-cards">
          <div class="stat-card"><div class="label">Total No. of Issuers</div><div class="value">${fmtNum(HOME_STATS.totalIssuers)}</div></div>
          <div class="stat-card"><div class="label">Total No. of ISINs</div><div class="value">${fmtNum(HOME_STATS.totalIsins)}</div></div>
          <div class="stat-card"><div class="label">Total value : Outstanding Bonds (in Cr)</div><div class="value">${fmtNum(HOME_STATS.totalOutstandingCr)}</div></div>
        </div>
        <div class="stat-source">Source : NSE , BSE , NSDL , CDSL</div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">CORPORATE BOND <span class="accent">ISSUANCE</span></div>
      <div class="card">
        <div class="chart-card-head">
          <h3>Monthly Issuance</h3>
          <select class="select-pill" id="issuance-period">
            <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
          </select>
        </div>
        <div class="legend-row">
          <span><i style="background:#d64545"></i>Corporate Bond</span>
          <span><i style="background:#f7941d"></i>Government Bond</span>
          <span><i style="background:#0d1b4c"></i>CP</span>
        </div>
        <canvas id="chart-issuance" height="90"></canvas>
      </div>
    </section>

    <section class="section dark-section" style="padding-top:0;">
      <div class="section-title">MARKET ACTIVITY <a class="link-more" href="#/market-activity">&rsaquo;</a></div>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Total ISIN traded</div><div class="kpi-value">${MARKET_ACTIVITY_STATS.isinTraded}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Issuer Traded</div><div class="kpi-value">${MARKET_ACTIVITY_STATS.issuerTraded}</div></div>
        <div class="kpi-card"><div class="kpi-label">% of Total Outstanding Traded</div><div class="kpi-value">${MARKET_ACTIVITY_STATS.pctOutstandingTraded}</div></div>
      </div>
    </section>
  `;

  const series = monthlyIssuanceSeries();
  paintChart("chart-issuance", {
    type: "bar",
    data: {
      labels: series.map((s) => s.month + "'25"),
      datasets: [
        { label: "Corporate Bond", data: series.map((s) => s.corporateBond), backgroundColor: "#d64545", stack: "s" },
        { label: "Government Bond", data: series.map((s) => s.governmentBond), backgroundColor: "#f7941d", stack: "s" },
        { label: "CP", data: series.map((s) => s.cp), backgroundColor: "#0d1b4c", stack: "s" },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, title: { display: true, text: "Amount in Rs.Cr" } } },
    },
  });

  document.getElementById("home-search-btn").addEventListener("click", () => {
    const q = document.getElementById("home-search").value.trim();
    location.hash = "#/explore" + (q ? `?q=${encodeURIComponent(q)}` : "");
  });
  document.getElementById("home-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("home-search-btn").click();
  });
}

/* ================= EXPLORE (listing) ================= */
let exploreState = { page: 1, perPage: 15, sortKey: "isin", sortDir: 1, q: "", instrumentTypes: new Set(), couponFrom: "", couponTo: "", sector: "", issuer: "" };

function renderExplore(app, params) {
  if (params.get("q") !== null) exploreState.q = params.get("q");
  if (params.get("issuer")) exploreState.issuer = decodeURIComponent(params.get("issuer"));

  app.innerHTML = `
    <section class="explore-toolbar">
      <div class="search-box" style="max-width:100%;">
        <input id="explore-search" type="text" placeholder="Search ISIN, Issuer and more..." value="${escapeHtml(exploreState.q)}" />
      </div>
    </section>
    <div class="explore-body">
      <aside class="filters-panel">
        <h4>&#9660; Filters <span style="cursor:pointer;color:var(--muted);font-weight:400;">&laquo;</span></h4>

        <details class="filter-group" open>
          <summary>Issuer</summary>
          <input class="mini-search" id="f-issuer" placeholder="Search issuer..." value="${escapeHtml(exploreState.issuer)}" />
        </details>

        <details class="filter-group" open>
          <summary>Instrument Type</summary>
          ${["Convertible Debentures", "Corporate Bond", "Foreign Currency Bond", "Infrastructure Bond"].map((t) => `
            <label class="filter-opt"><input type="checkbox" class="f-instrument" value="${t}" ${exploreState.instrumentTypes.has(t) ? "checked" : ""}/> ${t}</label>
          `).join("")}
        </details>

        <details class="filter-group" open>
          <summary>Coupon Rate</summary>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:6px;">Fixed</div>
          <div class="range-row">
            <input id="f-coupon-from" placeholder="From" value="${exploreState.couponFrom}" />
            <input id="f-coupon-to" placeholder="To" value="${exploreState.couponTo}" />
          </div>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:8px;">Floating</div>
          <input class="mini-search" placeholder="Search..." />
        </details>

        <details class="filter-group">
          <summary>Sector</summary>
          <input class="mini-search" id="f-sector" placeholder="Search sector..." value="${escapeHtml(exploreState.sector)}" />
        </details>

        <details class="filter-group">
          <summary>Issue Date</summary>
          <div class="range-row"><input placeholder="From" /><input placeholder="To" /></div>
        </details>

        <details class="filter-group">
          <summary>Maturity Date</summary>
          <div class="range-row"><input placeholder="From" /><input placeholder="To" /></div>
        </details>

        <div class="filters-actions">
          <button class="btn-outline" id="f-reset">Reset</button>
          <button class="btn-orange" id="f-submit">Submit</button>
        </div>
      </aside>

      <div class="results-panel">
        <div class="results-toolbar">
          <button class="btn-outline" id="add-column">+ Add Column</button>
          <button class="btn-outline" id="dl-csv">&#8595; Download.csv</button>
          <button class="btn-outline" id="dl-pdf">&#8595; Download.pdf</button>
        </div>
        <div class="table-wrap">
          <table class="bond-table">
            <thead><tr>
              <th data-k="isin">ISIN</th><th data-k="issuer">Issuer</th><th data-k="bondType">Bond Type</th>
              <th data-k="coupon">Coupon</th><th data-k="maturityDate">Maturity Date</th><th data-k="securedType">Secured Type</th>
              <th data-k="rating">Ratings</th><th data-k="lastTradedPrice">Last Traded Price</th><th data-k="lastTradedYield">Last Traded Yield</th>
            </tr></thead>
            <tbody id="explore-tbody"></tbody>
          </table>
        </div>
        <div class="pagination" id="explore-pagination"></div>
      </div>
    </div>
  `;

  document.getElementById("explore-search").addEventListener("input", (e) => { exploreState.q = e.target.value; exploreState.page = 1; renderExploreTable(); });
  document.getElementById("f-issuer").addEventListener("input", (e) => { exploreState.issuer = e.target.value; });
  document.getElementById("f-sector").addEventListener("input", (e) => { exploreState.sector = e.target.value; });
  document.getElementById("f-coupon-from").addEventListener("input", (e) => { exploreState.couponFrom = e.target.value; });
  document.getElementById("f-coupon-to").addEventListener("input", (e) => { exploreState.couponTo = e.target.value; });
  document.querySelectorAll(".f-instrument").forEach((cb) => cb.addEventListener("change", (e) => {
    if (e.target.checked) exploreState.instrumentTypes.add(e.target.value); else exploreState.instrumentTypes.delete(e.target.value);
  }));
  document.getElementById("f-submit").addEventListener("click", () => { exploreState.page = 1; renderExploreTable(); toast("Filters applied"); });
  document.getElementById("f-reset").addEventListener("click", () => {
    exploreState = { page: 1, perPage: 15, sortKey: "isin", sortDir: 1, q: "", instrumentTypes: new Set(), couponFrom: "", couponTo: "", sector: "", issuer: "" };
    renderExplore(app, new URLSearchParams());
  });
  document.getElementById("add-column").addEventListener("click", () => toast("Column picker — demo only"));
  document.getElementById("dl-csv").addEventListener("click", () => downloadCsv(filteredBonds()));
  document.getElementById("dl-pdf").addEventListener("click", () => toast("PDF export — demo only"));
  document.querySelectorAll("table.bond-table thead th").forEach((th) => th.addEventListener("click", () => {
    const k = th.dataset.k;
    if (exploreState.sortKey === k) exploreState.sortDir *= -1; else { exploreState.sortKey = k; exploreState.sortDir = 1; }
    renderExploreTable();
  }));

  renderExploreTable();
}

function filteredBonds() {
  let rows = BONDS.slice();
  const q = exploreState.q.trim().toLowerCase();
  if (q) rows = rows.filter((b) => b.isin.toLowerCase().includes(q) || b.issuer.toLowerCase().includes(q));
  if (exploreState.issuer.trim()) rows = rows.filter((b) => b.issuer.toLowerCase().includes(exploreState.issuer.trim().toLowerCase()));
  if (exploreState.sector.trim()) {
    rows = rows.filter((b) => {
      const iss = getIssuerByName(b.issuer);
      return iss && iss.sector.toLowerCase().includes(exploreState.sector.trim().toLowerCase());
    });
  }
  if (exploreState.instrumentTypes.size) rows = rows.filter((b) => exploreState.instrumentTypes.has(b.bondType));
  if (exploreState.couponFrom) rows = rows.filter((b) => b.coupon >= Number(exploreState.couponFrom));
  if (exploreState.couponTo) rows = rows.filter((b) => b.coupon <= Number(exploreState.couponTo));
  rows.sort((a, b) => {
    const va = a[exploreState.sortKey], vb = b[exploreState.sortKey];
    if (va < vb) return -1 * exploreState.sortDir;
    if (va > vb) return 1 * exploreState.sortDir;
    return 0;
  });
  return rows;
}

function renderExploreTable() {
  const rows = filteredBonds();
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / exploreState.perPage));
  exploreState.page = Math.min(exploreState.page, totalPages);
  const start = (exploreState.page - 1) * exploreState.perPage;
  const pageRows = rows.slice(start, start + exploreState.perPage);

  const tbody = document.getElementById("explore-tbody");
  tbody.innerHTML = pageRows.length ? pageRows.map((b) => `
    <tr data-isin="${b.isin}">
      <td><span class="isin-link">${b.isin}</span></td>
      <td>${b.issuer}</td>
      <td>${b.bondType}</td>
      <td>${b.coupon.toFixed(2)}%</td>
      <td>${fmtDate(b.maturityDate)}</td>
      <td><span class="pill ${b.securityDescription === "Secured" ? "secured" : "unsecured"}">${b.securityDescription}</span></td>
      <td>${b.rating}</td>
      <td>${b.lastTradedPrice.toFixed(2)}</td>
      <td>${b.lastTradedYield.toFixed(2)}%</td>
    </tr>
  `).join("") : `<tr><td colspan="9" class="empty-state">No bonds match the current filters.</td></tr>`;

  tbody.querySelectorAll("tr[data-isin]").forEach((tr) => tr.addEventListener("click", () => {
    location.hash = `#/bond/${encodeURIComponent(tr.dataset.isin)}`;
  }));

  const pag = document.getElementById("explore-pagination");
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + exploreState.perPage, total);
  let btns = "";
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - exploreState.page) <= 1) {
      btns += `<button data-p="${p}" class="${p === exploreState.page ? "active" : ""}">${p}</button>`;
    } else if (btns.slice(-3) !== "...") {
      btns += `<span>...</span>`;
    }
  }
  pag.innerHTML = `
    <button id="pg-prev" ${exploreState.page === 1 ? "disabled" : ""}>&lsaquo;</button>
    ${btns}
    <button id="pg-next" ${exploreState.page === totalPages ? "disabled" : ""}>&rsaquo;</button>
    <select id="pg-size" class="select-pill" style="background:#fff;color:var(--ink);border:1px solid var(--line);">
      ${[10, 15, 25, 50].map((n) => `<option value="${n}" ${n === exploreState.perPage ? "selected" : ""}>${n} / page</option>`).join("")}
    </select>
    <span class="spacer"></span>
    <span>Items per page: ${from}–${to} of ${total} items</span>
  `;
  document.getElementById("pg-prev").addEventListener("click", () => { exploreState.page--; renderExploreTable(); });
  document.getElementById("pg-next").addEventListener("click", () => { exploreState.page++; renderExploreTable(); });
  document.getElementById("pg-size").addEventListener("change", (e) => { exploreState.perPage = Number(e.target.value); exploreState.page = 1; renderExploreTable(); });
  pag.querySelectorAll("button[data-p]").forEach((b) => b.addEventListener("click", () => { exploreState.page = Number(b.dataset.p); renderExploreTable(); }));
}

function downloadCsv(rows) {
  const headers = ["ISIN", "Issuer", "Bond Type", "Coupon", "Maturity Date", "Secured Type", "Ratings", "Last Traded Price", "Last Traded Yield"];
  const csv = [headers.join(",")].concat(rows.map((b) => [b.isin, `"${b.issuer}"`, b.bondType, b.coupon, b.maturityDate, b.securityDescription, b.rating, b.lastTradedPrice, b.lastTradedYield].join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bond-central-export.csv";
  a.click();
}

function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ================= BOND DETAIL ================= */
function renderBondDetail(app, isin) {
  const b = getBondByIsin(isin);
  if (!b) { app.innerHTML = `<div class="empty-state">Bond ${escapeHtml(isin)} not found. <a href="#/explore">Back to Explore</a></div>`; return; }
  const issuer = getIssuerByName(b.issuer);
  const cashflows = cashFlowSchedule(b);

  app.innerHTML = `
    <section class="detail-header">
      <a class="back" href="#/explore">&lsaquo; Back to results</a>
      <div class="detail-title-row">
        <div>
          <h2>${b.issuer} - ${b.bondType} - ${b.coupon.toFixed(2)}% - ${fmtDate(b.maturityDate)} <span class="pill secured" style="margin-left:6px;">${b.securityDescription}</span></h2>
          <div class="meta">Last Traded: ${b.lastTradedPrice.toFixed(2)} / ${b.lastTradedYield.toFixed(2)}% &nbsp;|&nbsp; Next Coupon Date: ${fmtDate(b.nextCashFlowDate)} &nbsp;|&nbsp; Source: NSE, BSE, NSDL, CDSL</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <span class="meta">ISIN <strong style="color:#fff;">${b.isin}</strong></span>
          <button class="docs-btn" id="related-docs">Related Documents &#9662;</button>
        </div>
      </div>
    </section>

    <div class="detail-body">
      <div class="info-card">
        <h3>Issue Details</h3>
        <div class="info-grid">
          ${infoField("ISIN", b.isin)}${infoField("Issuer Name", b.issuer)}${infoField("Instrument Type", b.instrumentType)}
          ${infoField("Security Type", b.securityType)}${infoField("Issue Amount", fmtNum(b.issueAmount) + " Cr")}${infoField("Outstanding Amount", fmtNum(b.outstandingAmount) + " Cr")}
          ${infoField("Issue Date", fmtDate(b.issueDate))}${infoField("Maturity Date", fmtDate(b.maturityDate))}${infoField("Coupon Rate", b.coupon.toFixed(2) + "%")}
          ${infoField("Coupon Frequency", b.couponFreq)}${infoField("Day Count", b.dayCount)}${infoField("Mode of Issue", b.modeOfIssue)}
          ${infoField("Face Value", fmtNum(b.faceValue))}${infoField("Issue Price", b.issuePrice.toFixed(2))}${infoField("Listed On", b.listedOn)}
          ${infoField("Call Date", b.callDate)}${infoField("Put Date", b.putDate)}${infoField("Listing Date", fmtDate(b.listingDate))}
          ${infoField("Last Cash Flow", fmtDate(b.lastCashFlow))}${infoField("Next Cash Flow Date", fmtDate(b.nextCashFlowDate))}${infoField("Taxation", b.taxation)}
          ${infoField("Guaranteed", b.guaranteed)}${infoField("Interest Record Date", fmtDate(b.interestRecordDate))}${infoField("Security Description", b.securityDescription)}
        </div>
      </div>

      <div class="info-card">
        <h3>Primary Market Details</h3>
        <div class="info-grid">
          ${infoField("Fresh Issue / Re-Issue", "Fresh")}${infoField("Amount raised (Rs. in Crs)", fmtNum(b.issueAmount))}${infoField("Principal Record Date", fmtDate(b.issueDate))}
          ${infoField("Manner of Allotment", "-")}${infoField("Type of Bidding (Coupon/Price/Spread)", "-")}${infoField("Type of Book Bidding (Open/Closed)", "-")}
          ${infoField("No. of successful Bidders/QIBs", "-")}${infoField("Base Issue Size(Cr)", fmtNum(Math.round(b.issueAmount * 0.5)))}${infoField("Green Shoe Option (Cr)", fmtNum(Math.round(b.issueAmount * 0.5)))}
          ${infoField("Type of Bidding", "-")}${infoField("Anchor Portion (Cr)", "-")}${infoField("No. of Anchor Investors", "-")}
          ${infoField("Trade Suspension Date", "-")}${infoField("", "")}${infoField("", "")}
        </div>
      </div>

      <div class="info-card">
        <h3>Rating Details</h3>
        ${["CRISL", "ICRA", "CARE"].map((agency) => `
          <div class="rating-row">
            <div class="agency">${agency}</div>
            <div>Current rating <strong>${b.rating}</strong></div>
            <div>${fmtDate("2025-01-31")}</div>
            <div class="see-more">See More...</div>
          </div>
        `).join("")}
      </div>

      <div class="info-card">
        <div class="flex-between" style="padding:10px 16px 0;">
          <h3 style="background:none;color:var(--navy-900);padding:0;">Cash Flow Schedule</h3>
          <div class="toggle-group" id="cf-toggle">
            <button class="active" data-v="net">Net</button>
            <button data-v="issue">Issue</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="simple-table">
            <thead><tr><th>Record Date</th><th>Payment Date</th><th>Interest / Redemption</th><th>Payment Type</th><th>Default Status</th></tr></thead>
            <tbody>
              ${cashflows.map((c) => `<tr><td>${c.recordDate}</td><td>${c.paymentDate}</td><td>${c.amount.toFixed(2)}</td><td>${c.paymentType}</td><td>${c.defaultStatus}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div style="padding:10px 16px;"><a href="#" style="color:var(--blue-accent);font-size:0.8rem;font-weight:600;">See More...</a></div>
      </div>

      <div class="info-card" style="padding:16px;">
        <div class="flex-between">
          <div class="toggle-group" id="pv-src"><button class="active" data-v="nse">NSE</button><button data-v="bse">BSE</button></div>
          <div class="toggle-group" id="pv-metric"><button class="active" data-v="price">Price</button><button data-v="yield">Yield</button></div>
          <div class="range-toggle" id="pv-range">
            ${["1M", "3M", "6M", "1Y", "2Y"].map((r, i) => `<button class="${i === 2 ? "active" : ""}" data-v="${r}">${r}</button>`).join("")}
          </div>
          <div class="toggle-group"><button class="active">Chart</button><button>Table</button></div>
        </div>
        <canvas id="chart-priceyield" height="90" style="margin-top:10px;"></canvas>
      </div>
    </div>
  `;

  const series = priceYieldSeries(isin.length * 3);
  paintChart("chart-priceyield", {
    type: "line",
    data: {
      labels: series.map((s) => s.month + "'25"),
      datasets: [
        { label: "Gov 3yr", data: series.map((s) => s.gsec3y), borderColor: "#2b4fd8", tension: 0.35, pointRadius: 0 },
        { label: "Gov 5yr", data: series.map((s) => s.gsec5y), borderColor: "#f7941d", tension: 0.35, pointRadius: 0 },
        { label: "Gov 10yr", data: series.map((s) => s.gsec10y), borderColor: "#d64545", tension: 0.35, pointRadius: 0 },
      ],
    },
    options: { responsive: true, plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { title: { display: true, text: "Yield(%)" } } } },
  });

  document.querySelectorAll("#cf-toggle button, #pv-src button, #pv-metric button, #pv-range button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.target.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });
  document.getElementById("related-docs").addEventListener("click", () => toast("Offer document, term sheet & rating letters — demo only"));

  if (issuer) {
    const issuerLink = document.createElement("div");
    issuerLink.innerHTML = `<div style="max-width:1180px;margin:-4px auto 20px;padding:0 32px;"><a href="#/issuer/${encodeURIComponent(b.issuer)}" style="color:var(--blue-accent);font-weight:700;font-size:0.85rem;">View issuer profile: ${b.issuer} &rsaquo;</a></div>`;
    document.querySelector(".detail-body").insertAdjacentElement("afterend", issuerLink);
  }
}

function infoField(k, v) {
  return `<div class="field"><div class="k">${k}</div><div class="v">${v === "" || v === undefined ? "&nbsp;" : v}</div></div>`;
}

/* ================= ISSUER DETAIL ================= */
function renderIssuerDetail(app, name) {
  const issuer = getIssuerByName(name);
  if (!issuer) { app.innerHTML = `<div class="empty-state">Issuer ${escapeHtml(name)} not found. <a href="#/explore">Back to Explore</a></div>`; return; }
  const bonds = getBondsByIssuer(name);

  app.innerHTML = `
    <section class="detail-header">
      <a class="back" href="#/explore">&lsaquo; Back</a>
      <div class="detail-title-row"><h2>${issuer.name}</h2></div>
    </section>
    <div class="detail-body">
      <div class="info-card">
        <h3>Issuer Detail</h3>
        <div class="info-grid">
          ${infoField("Issuer Rating", issuer.rating)}${infoField("Total Active ISINs", issuer.activeIsins)}${infoField("Total Amount Outstanding (In Crs.)", fmtNum(issuer.outstanding))}
          ${infoField("CIN", issuer.cin)}${infoField("Industry", issuer.industry)}${infoField("Sector", issuer.sector)}
          ${infoField("LEI Code", issuer.lei)}${infoField("Type of Issuer", issuer.type)}${infoField("Registered Office", issuer.address)}
          ${infoField("Address of Issuer", issuer.address)}${infoField("Name of Compliance Officer/ Company Secretary", issuer.compliance)}${infoField("", "")}
        </div>
      </div>

      <div class="info-card" style="padding:16px;">
        <div class="chart-card-head"><h3 style="background:none;color:var(--navy-900);padding:0;">Quarterly Issuance ( Jan - Mar )</h3>
          <div style="display:flex;gap:8px;"><select class="select-pill">
            <option>Quarterly</option><option>Monthly</option></select>
            <div class="toggle-group"><button>Table</button><button class="active">Chart</button></div>
          </div>
        </div>
        <div class="legend-row">
          <span><i style="background:#d64545"></i>Corporate Bond</span><span><i style="background:#f7941d"></i>Government Bond</span>
          <span><i style="background:#0d1b4c"></i>CP</span><span><i style="background:#2b4fd8"></i>CD</span>
        </div>
        <canvas id="chart-issuer-issuance" height="90"></canvas>
      </div>

      <div class="info-card" style="padding:16px;">
        <div class="chart-card-head"><h3 style="background:none;color:var(--navy-900);padding:0;">Market Activity</h3>
          <select class="select-pill">
            <option>Monthly</option><option>Quarterly</option></select>
        </div>
        <div class="legend-row"><span><i style="background:#f7941d"></i>Total market activity</span><span><i style="background:#d64545"></i>Issuer Trading Activity</span></div>
        <canvas id="chart-issuer-activity" height="90"></canvas>
      </div>

      <div class="info-card">
        <h3>ISINs from this Issuer (${bonds.length})</h3>
        <div class="table-wrap">
          <table class="simple-table">
            <thead><tr><th>ISIN</th><th>Bond Type</th><th>Coupon</th><th>Maturity Date</th><th>Rating</th></tr></thead>
            <tbody>${bonds.map((b) => `<tr class="isin-row" data-isin="${b.isin}" style="cursor:pointer;"><td class="isin-link">${b.isin}</td><td>${b.bondType}</td><td>${b.coupon.toFixed(2)}%</td><td>${fmtDate(b.maturityDate)}</td><td>${b.rating}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll(".isin-row").forEach((tr) => tr.addEventListener("click", () => { location.hash = `#/bond/${encodeURIComponent(tr.dataset.isin)}`; }));

  const q = quarterlySeries(name.length * 5);
  paintChart("chart-issuer-issuance", {
    type: "bar",
    data: { labels: q.map((s) => s.q + "'25"), datasets: [
      { label: "Corporate Bond", data: q.map((s) => s.corporateBond), backgroundColor: "#d64545", stack: "s" },
      { label: "Government Bond", data: q.map((s) => s.government), backgroundColor: "#f7941d", stack: "s" },
      { label: "CP", data: q.map((s) => s.commercialPaper), backgroundColor: "#0d1b4c", stack: "s" },
    ]},
    options: { plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, title: { display: true, text: "Amount in Cr." } } } },
  });

  const m = monthlyIssuanceSeries();
  paintChart("chart-issuer-activity", {
    type: "line",
    data: { labels: m.map((s) => s.month + "'25"), datasets: [
      { label: "Total market activity", data: m.map((s) => s.corporateBond + s.governmentBond), borderColor: "#f7941d", tension: 0.3, pointRadius: 0 },
      { label: "Issuer Trading Activity", data: m.map((s) => s.corporateBond), borderColor: "#d64545", tension: 0.3, pointRadius: 0 },
    ]},
    options: { plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: "Amount in Cr." } } } },
  });
}

/* ================= COMPARE ================= */
function renderCompare(app, params) {
  const allBonds = BONDS;
  const left = params.get("a") ? getBondByIsin(params.get("a")) : allBonds[0];
  const right = params.get("b") ? getBondByIsin(params.get("b")) : allBonds[1];

  const rows = [
    ["Security Type", (b) => b.securityType],
    ["Issue date", (b) => fmtDate(b.issueDate)],
    ["Call Date", (b) => b.callDate],
    ["Maturity Date", (b) => fmtDate(b.maturityDate)],
    ["Put Date", (b) => b.putDate],
    ["Instrument Type", (b) => b.bondType],
    ["Outstanding Amount", (b) => fmtNum(b.outstandingAmount) + " Cr"],
    ["Coupon Rate", (b) => b.coupon.toFixed(2) + "%"],
    ["Taxation", (b) => b.taxation],
    ["Secured Type", (b) => b.securityDescription],
    ["Issuer Category", (b) => getIssuerByName(b.issuer)?.type || "-"],
    ["Industry", (b) => getIssuerByName(b.issuer)?.industry || "-"],
    ["Sector", (b) => getIssuerByName(b.issuer)?.sector || "-"],
  ];

  app.innerHTML = `
    <section class="dark-band" style="padding-top:20px;">
      <table class="compare-table">
        <tr><th>Compare</th>
          <td><div class="compare-slot"><select id="cmp-a">${allBonds.map((b) => `<option value="${b.isin}" ${b === left ? "selected" : ""}>${b.issuer} - ${b.bondType}</option>`).join("")}</select></div></td>
          <td><div class="compare-slot"><select id="cmp-b">${allBonds.map((b) => `<option value="${b.isin}" ${b === right ? "selected" : ""}>${b.issuer} - ${b.bondType}</option>`).join("")}</select></div></td>
          <td><input class="compare-search" placeholder="Search..." id="cmp-add" /></td>
        </tr>
        ${rows.map(([label, fn]) => `<tr><th>${label}</th><td>${fn(left)}</td><td>${fn(right)}</td><td></td></tr>`).join("")}
      </table>
    </section>
    <section class="section" style="padding-top:20px;">
      <div class="card">
        <div class="flex-between">
          <div class="toggle-group"><button class="active">Price</button><button>Yield</button></div>
          <div class="range-toggle">${["1M", "3M", "6M", "1Y", "2Y"].map((r, i) => `<button class="${i === 2 ? "active" : ""}">${r}</button>`).join("")}</div>
        </div>
        <div class="legend-row">
          <span><i style="background:#f7941d"></i>${left.issuer} - ${left.bondType} - ${left.coupon}% - ${fmtDate(left.maturityDate)}</span>
          <span><i style="background:#d64545"></i>${right.issuer} - ${right.bondType} - ${right.coupon}% - ${fmtDate(right.maturityDate)}</span>
        </div>
        <canvas id="chart-compare" height="90"></canvas>
      </div>
    </section>
  `;

  const s1 = priceYieldSeries(left.isin.length * 2);
  const s2 = priceYieldSeries(right.isin.length * 4);
  paintChart("chart-compare", {
    type: "line",
    data: {
      labels: s1.map((s) => s.month + "'25"),
      datasets: [
        { label: left.issuer, data: s1.map((s) => s.yieldPrice), borderColor: "#f7941d", tension: 0.35, pointRadius: 0 },
        { label: right.issuer, data: s2.map((s) => s.yieldPrice), borderColor: "#d64545", tension: 0.35, pointRadius: 0 },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: "Amount in Cr." } } } },
  });

  const sync = () => {
    const a = document.getElementById("cmp-a").value, b = document.getElementById("cmp-b").value;
    location.hash = `#/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
  };
  document.getElementById("cmp-a").addEventListener("change", sync);
  document.getElementById("cmp-b").addEventListener("change", sync);
}

/* ================= MARKET ACTIVITY ================= */
let maState = { mode: "aggregate", dim: "instrument", period: "Quarterly", view: "chart" };
const MA_DIMS = {
  instrument: { label: "Instrument Type", items: ["Corporate Bond", "Commercial Paper", "Certificate of Deposit", "Government Sector"] },
  issuer: { label: "Issuer", items: ["NHPC Ltd.", "Future Enterprises - DVR", "Future Enterprises Ltd.", "Vidur Infrastructure Pvt Ltd."] },
  sector: { label: "Sector", items: ["Commodities", "Consumer Discretionary", "Diversified", "Energy"] },
  category: { label: "Issuer Category", items: ["PSU", "Private", "Bank", "NBFC"] },
};

function renderMarketActivity(app) {
  const dim = MA_DIMS[maState.dim];
  app.innerHTML = `
    <section class="section">
      <div class="ma-tabs">
        <button id="tab-agg" class="${maState.mode === "aggregate" ? "active" : ""}">Aggregate Trading Activity</button>
        <button id="tab-avg" class="${maState.mode === "average" ? "active" : ""}">Average Daily Trading Activity</button>
      </div>
      <div class="ma-grid">
        <div>
          <div class="card">
            <h3 style="margin:0 0 10px;font-size:0.92rem;">Summary</h3>
            <div class="ma-subtabs">
              ${Object.entries(MA_DIMS).map(([k, v]) => `<span data-dim="${k}" class="${maState.dim === k ? "active" : ""}">${v.label}</span>`).join("")}
            </div>
            <input class="mini-search" id="ma-search" placeholder="Search ${dim.label.toLowerCase()}..." />
            <div id="ma-checklist" style="margin-top:8px;"></div>
          </div>
        </div>
        <div class="card">
          <div class="chart-card-head">
            <h3>${maState.mode === "aggregate" ? "Aggregate" : "Average Daily"} Traded Value (Cr)${maState.dim === "sector" ? " - Current Quarter (Jan - Mar)" : ""}</h3>
            <div style="display:flex;gap:8px;">
              <select class="select-pill" id="ma-period"><option ${maState.period === "Quarterly" ? "selected" : ""}>Quarterly</option><option ${maState.period === "Monthly" ? "selected" : ""}>Monthly</option></select>
              <div class="toggle-group" id="ma-viewtoggle"><button class="${maState.view === "chart" ? "active" : ""}" data-v="chart">Chart</button><button class="${maState.view === "table" ? "active" : ""}" data-v="table">Table</button></div>
            </div>
          </div>
          <div class="legend-row" id="ma-legend"></div>
          <div id="ma-chart-holder"><canvas id="chart-ma" height="120"></canvas></div>
          <div id="ma-table-holder" style="display:none;"></div>
        </div>
      </div>

      <div class="card mt-16">
        <div class="flex-between">
          <h3 style="margin:0;font-size:0.92rem;">Top 5 Traded Issuer Rating-wise</h3>
          <select class="select-pill" id="rating-scale" style="background:var(--navy-900);"><option>AAA</option><option>AA+</option><option>AA</option><option>A+</option></select>
        </div>
        <table class="simple-table mt-16">
          <thead><tr><th>Issuer</th><th>Traded Value</th><th>Outstanding Amt.</th><th>Traded Value % of Outstanding Amt.</th></tr></thead>
          <tbody>
            ${["Reliance Brands Ltd.", "Hero Fincorp Ltd.", "Adani Green Technology Ltd.", "Dabur India Ltd.", "Adani Green Technology Ltd."].map((n) => `
              <tr><td>${n}</td><td>1,09,00.00</td><td>1,09,00.00</td><td>2.7</td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("tab-agg").addEventListener("click", () => { maState.mode = "aggregate"; renderMarketActivity(app); });
  document.getElementById("tab-avg").addEventListener("click", () => { maState.mode = "average"; renderMarketActivity(app); });
  document.querySelectorAll(".ma-subtabs span").forEach((s) => s.addEventListener("click", () => { maState.dim = s.dataset.dim; renderMarketActivity(app); }));
  document.getElementById("ma-period").addEventListener("change", (e) => { maState.period = e.target.value; renderMarketActivityChart(); });
  document.querySelectorAll("#ma-viewtoggle button").forEach((b) => b.addEventListener("click", () => {
    maState.view = b.dataset.v;
    document.querySelectorAll("#ma-viewtoggle button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    document.getElementById("ma-chart-holder").style.display = maState.view === "chart" ? "" : "none";
    document.getElementById("ma-table-holder").style.display = maState.view === "table" ? "" : "none";
    renderMarketActivityChart();
  }));

  renderMaChecklist();
  renderMarketActivityChart();
}

function renderMaChecklist() {
  const dim = MA_DIMS[maState.dim];
  const holder = document.getElementById("ma-checklist");
  holder.innerHTML = dim.items.map((it) => `<label class="checklist-item"><input type="checkbox" checked class="ma-item-cb" value="${it}" /> ${it}</label>`).join("");
  document.getElementById("ma-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    holder.querySelectorAll(".checklist-item").forEach((l) => { l.style.display = l.textContent.toLowerCase().includes(q) ? "" : "none"; });
  });
  holder.querySelectorAll(".ma-item-cb").forEach((cb) => cb.addEventListener("change", renderMarketActivityChart));
}

function renderMarketActivityChart() {
  const dim = MA_DIMS[maState.dim];
  const checked = Array.from(document.querySelectorAll(".ma-item-cb:checked")).map((c) => c.value);
  const active = checked.length ? checked : dim.items;
  const colors = ["#0d1b4c", "#d64545", "#f7941d", "#2b4fd8"];
  const labels = maState.period === "Quarterly" ? ["Q1", "Q2", "Q3", "Q4"] : MONTHS_12;
  const legend = document.getElementById("ma-legend");
  legend.innerHTML = active.map((n, i) => `<span><i style="background:${colors[i % colors.length]}"></i>${n}</span>`).join("");

  const datasets = active.map((name, i) => {
    const rnd = seedRandom(name.length * 31 + i);
    return {
      label: name,
      data: labels.map(() => Math.round((maState.mode === "average" ? 2 : 20) + rnd() * (maState.mode === "average" ? 8 : 40))),
      backgroundColor: colors[i % colors.length],
      stack: "s",
    };
  });

  if (maState.view === "chart") {
    paintChart("chart-ma", {
      type: "bar",
      data: { labels, datasets },
      options: { plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true } } },
    });
  } else {
    const holder = document.getElementById("ma-table-holder");
    holder.innerHTML = `<table class="simple-table"><thead><tr><th>${dim.label}</th>${labels.map((l) => `<th>${l}</th>`).join("")}</tr></thead>
      <tbody>${datasets.map((d) => `<tr><td>${d.label}</td>${d.data.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
}

/* ================= RESOURCES ================= */
let resState = { tab: "All", q: "" };
function renderResources(app) {
  const items = RESOURCES.filter((r) => (resState.tab === "All" || r.type === resState.tab.slice(0, -1)) && r.title.toLowerCase().includes(resState.q.toLowerCase()));
  const articles = items.filter((r) => r.type === "Article");
  const reports = items.filter((r) => r.type === "Report");

  app.innerHTML = `
    <section class="section">
      <div class="card">
        <div class="flex-between">
          <h3 style="margin:0;">All you need to know about Bond Central</h3>
          <div class="resources-search"><input id="res-search" placeholder="Type Name or Category" value="${escapeHtml(resState.q)}" /></div>
        </div>
        <div class="resource-tabs">
          ${["All", "Reports", "Articles"].map((t) => `<span data-t="${t}" class="${resState.tab === t ? "active" : ""}">${t}</span>`).join("")}
        </div>
        ${resState.tab !== "Reports" ? resourceGroup("Articles", articles) : ""}
        ${resState.tab !== "Articles" ? resourceGroup("Reports", reports) : ""}
      </div>
    </section>
  `;
  document.getElementById("res-search").addEventListener("input", (e) => { resState.q = e.target.value; renderResources(app); });
  document.querySelectorAll(".resource-tabs span").forEach((s) => s.addEventListener("click", () => { resState.tab = s.dataset.t; renderResources(app); }));
  document.querySelectorAll(".resource-item").forEach((el) => el.addEventListener("click", () => toast("Opening document preview — demo only")));
}
function resourceGroup(title, items) {
  if (!items.length) return "";
  return `<h4 style="color:var(--navy-900);font-size:0.85rem;margin:14px 0 10px;">${title}</h4>
    <div class="resource-grid">
      ${items.map((r) => `<div class="resource-item"><div class="pdf-icon">PDF</div><div><div class="title">${r.title}</div><div class="date">${r.date}</div></div></div>`).join("")}
    </div>`;
}

/* ================= ABOUT ================= */
function renderAbout(app) {
  app.innerHTML = `
    <section class="dark-band">
      <div class="about-hero">
        <span class="dot" style="width:52px;height:52px;display:inline-block;"></span>
        <h1>Welcome to National Stock Exchange</h1>
        <p>At Bond Central, we transform ideas into dynamic experiences. Our adventure started with a clear purpose to enable businesses with innovative technology that streamlines processes and drives growth.<br/>
        Let's create something extraordinary together.<br/>Thank you for choosing Bond Central.<br/>Sincerely,<br/>Founder &amp; CEO, Bond Central Tech Solutions</p>
      </div>
      <div class="about-cards">
        <div class="about-card" style="background:#2b4fd8;"><h4>Our Expertise</h4><p>Our team excels in software development, design, and strategy. We have extensive experience in the digital landscape.</p></div>
        <div class="about-card" style="background:#1c8a6b;"><h4>Core Values</h4><p>Our culture is built on transparency and integrity. We welcome ideas and value feedback.</p></div>
        <div class="about-card" style="background:#6b3fd8;"><h4>Client-Centric Approach</h4><p>We value lasting relationships. We tailor solutions to meet unique needs.</p></div>
      </div>
      <div class="about-cards-row2">
        <div class="about-card" style="background:#3a3fd8;"><h4>Pioneering Innovation</h4><p>We relentlessly pursue innovation. Challenges drive us to redefine standards. Our products are intuitive and robust.</p></div>
        <div class="about-card" style="background:#2b4fd8;"><h4>Your Digital Transformation Partner</h4><p>We help you stay ahead in the market. Let's shape the future with innovation and dedication.</p></div>
      </div>
    </section>
  `;
}
