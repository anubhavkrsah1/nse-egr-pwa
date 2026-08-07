/* Bond Central — mock/sample data layer.
   In production these arrays would be replaced by API responses (see /docs for the
   field contract each screen expects). */

const ISSUERS = [
  { name: "Spandana Sphoorty Financial Ltd.", cin: "L65929TG2003PLC040648", lei: "335800439ZGPM8K12680",
    rating: "AAA", industry: "Finance", sector: "Financial Services", type: "NBFC",
    activeIsins: 28, outstanding: 5318.75,
    address: "PLOT NO. 79, CARE CRYSTAL, VINAYAK NAGAR COLONY, GACHIBOWLI, HYDERABAD - 500032",
    compliance: "—" },
  { name: "LIC Housing Finance Ltd.", cin: "L65922MH1989PLC052257", lei: "335800Q7ABCD1234EF56",
    rating: "AAA", industry: "Finance", sector: "Financial Services", type: "HFC",
    activeIsins: 42, outstanding: 18420.30,
    address: "131, BOMBAY MUTUAL BUILDING, DR. D N ROAD, FORT, MUMBAI - 400001",
    compliance: "—" },
  { name: "Future Enterprises Ltd. - DVR", cin: "L99999MH1987PLC099999", lei: "335800F1XYZ9988LM12",
    rating: "AA+", industry: "Retail", sector: "Consumer Discretionary", type: "Corporate",
    activeIsins: 11, outstanding: 2140.00,
    address: "247 PARK, LBS MARG, VIKHROLI (WEST), MUMBAI - 400083", compliance: "—" },
  { name: "Future Enterprises Ltd.", cin: "L99999MH1987PLC099998", lei: "335800F2XYZ9988LM13",
    rating: "AA", industry: "Retail", sector: "Consumer Discretionary", type: "Corporate",
    activeIsins: 9, outstanding: 1870.00,
    address: "247 PARK, LBS MARG, VIKHROLI (WEST), MUMBAI - 400083", compliance: "—" },
  { name: "Vidur Infrastructure Pvt. Ltd.", cin: "U45400DL2011PTC219876", lei: "335800V1INF4455GH67",
    rating: "A+", industry: "Infrastructure", sector: "Industrials", type: "Corporate",
    activeIsins: 5, outstanding: 640.00,
    address: "PLOT 21, SECTOR 44, GURUGRAM - 122003", compliance: "—" },
  { name: "Reliance Brands Ltd.", cin: "U18101MH2007PLC169581", lei: "335800R1BRND2233CD45",
    rating: "AAA", industry: "Retail", sector: "Consumer Discretionary", type: "Corporate",
    activeIsins: 15, outstanding: 3200.00,
    address: "3RD FLOOR, MAKER CHAMBERS IV, NARIMAN POINT, MUMBAI - 400021", compliance: "—" },
  { name: "Hero Fincorp Ltd.", cin: "U74899DL1991PLC046774", lei: "335800H1FNC6677EF89",
    rating: "AA+", industry: "Finance", sector: "Financial Services", type: "NBFC",
    activeIsins: 19, outstanding: 6100.00,
    address: "34, COMMUNITY CENTRE, BASANT LOK, VASANT VIHAR, NEW DELHI - 110057", compliance: "—" },
  { name: "Adani Green Technology Ltd.", cin: "U40106GJ2015PLC083986", lei: "335800A1GRN8899IJ01",
    rating: "AA", industry: "Energy", sector: "Energy", type: "Corporate",
    activeIsins: 7, outstanding: 4500.00,
    address: "ADANI CORPORATE HOUSE, SHANTIGRAM, AHMEDABAD - 382421", compliance: "—" },
  { name: "Dabur India Ltd.", cin: "L24230DL1975PLC007908", lei: "335800D1DBR3344KL23",
    rating: "AAA", industry: "FMCG", sector: "Consumer Staples", type: "Corporate",
    activeIsins: 4, outstanding: 900.00,
    address: "8/3 ASAF ALI ROAD, NEW DELHI - 110002", compliance: "—" },
];

function seedRandom(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const BOND_TYPES = ["Non-Convertible Debentures", "Convertible Debentures", "Corporate Bond", "Infrastructure Bond"];
const SECURED_TYPES = ["Secured", "Unsecured"];
const RATINGS = ["AAA", "AA+", "AA", "A+", "A"];

const BONDS = (() => {
  const rnd = seedRandom(42);
  const list = [];
  let n = 0;
  ISSUERS.forEach((iss, iIdx) => {
    const count = 4 + Math.floor(rnd() * 4);
    for (let i = 0; i < count; i++) {
      n++;
      const coupon = (7 + rnd() * 4).toFixed(2);
      const year = 2025 + Math.floor(rnd() * 6);
      const month = Math.floor(rnd() * 12);
      const day = 1 + Math.floor(rnd() * 28);
      const maturity = new Date(Date.UTC(year, month, day));
      const isin = `INE${(100 + iIdx).toString()}${String.fromCharCode(65 + (n % 26))}0${(7000 + n).toString().slice(-4)}`;
      list.push({
        isin,
        issuer: iss.name,
        bondType: BOND_TYPES[n % BOND_TYPES.length],
        coupon: Number(coupon),
        maturityDate: maturity.toISOString().slice(0, 10),
        securedType: SECURED_TYPES[n % 2 === 0 ? 0 : 0],
        rating: RATINGS[(iIdx + i) % RATINGS.length],
        lastTradedPrice: Number((95 + rnd() * 10).toFixed(2)),
        lastTradedYield: Number((7 + rnd() * 3).toFixed(2)),
        instrumentType: ["Corporate Bond", "Commercial Paper", "Certificate of Deposit", "Government Sector"][n % 4],
        issueDate: new Date(Date.UTC(year - 2, month, day)).toISOString().slice(0, 10),
        faceValue: 1000,
        issuePrice: Number((98 + rnd() * 3).toFixed(2)),
        issueAmount: Math.round(500 + rnd() * 2000),
        outstandingAmount: Math.round(500 + rnd() * 2000),
        modeOfIssue: n % 3 === 0 ? "Private Placement" : "Public",
        listedOn: "NSE",
        listingDate: new Date(Date.UTC(year - 2, month, day + 5)).toISOString().slice(0, 10),
        taxation: "Taxable",
        securityDescription: n % 2 === 0 ? "Secured" : "Unsecured",
        couponFreq: ["Annual", "Semi-Annual", "Quarterly"][n % 3],
        dayCount: "Actual / Actual",
        callDate: "—",
        putDate: "—",
        lastCashFlow: new Date(Date.UTC(year - 1, month, day)).toISOString().slice(0, 10),
        nextCashFlowDate: new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10),
        interestRecordDate: new Date(Date.UTC(year, month, day - 12)).toISOString().slice(0, 10),
        guaranteed: "No",
        securityType: "NCD",
      });
    }
  });
  return list;
})();

function getIssuerByName(name) {
  return ISSUERS.find((i) => i.name === name);
}

function getBondsByIssuer(name) {
  return BONDS.filter((b) => b.issuer === name);
}

function getBondByIsin(isin) {
  return BONDS.find((b) => b.isin === isin);
}

const MONTHS_12 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthlyIssuanceSeries() {
  const rnd = seedRandom(7);
  return MONTHS_12.map((m) => ({
    month: m,
    corporateBond: Math.round(20 + rnd() * 40),
    governmentBond: Math.round(5 + rnd() * 15),
    cp: Math.round(2 + rnd() * 8),
    cd: Math.round(1 + rnd() * 5),
  }));
}

function quarterlySeries(seed) {
  const rnd = seedRandom(seed);
  return ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
    q,
    corporateBond: Math.round(20 + rnd() * 40),
    commercialPaper: Math.round(5 + rnd() * 15),
    cd: Math.round(2 + rnd() * 10),
    government: Math.round(3 + rnd() * 8),
  }));
}

function priceYieldSeries(seed) {
  const rnd = seedRandom(seed);
  return MONTHS_12.slice(0, 6).map((m) => ({
    month: m,
    gsec3y: Number((6.8 + rnd() * 0.6).toFixed(2)),
    gsec5y: Number((7.0 + rnd() * 0.6).toFixed(2)),
    gsec10y: Number((7.2 + rnd() * 0.6).toFixed(2)),
    yieldPrice: Number((7.5 + rnd() * 1.2).toFixed(2)),
  }));
}

function cashFlowSchedule(bond) {
  const rnd = seedRandom(bond.isin.length * 13);
  const rows = [];
  const base = new Date(bond.issueDate);
  for (let i = 1; i <= 6; i++) {
    const recordDate = new Date(base); recordDate.setMonth(recordDate.getMonth() + i * 6 - 1);
    const paymentDate = new Date(recordDate); paymentDate.setDate(paymentDate.getDate() + 18);
    rows.push({
      recordDate: recordDate.toISOString().slice(0, 10).split("-").reverse().join("-"),
      paymentDate: paymentDate.toISOString().slice(0, 10).split("-").reverse().join("-"),
      amount: i === 6 ? bond.faceValue : Number((bond.faceValue * bond.coupon / 100 / 2).toFixed(2)),
      paymentType: i === 6 ? "Principal" : "Interest",
      defaultStatus: "-",
    });
  }
  return rows;
}

const HOME_STATS = { totalIssuers: 686, totalIsins: 6935, totalOutstandingCr: 54011 };
const MARKET_ACTIVITY_STATS = { isinTraded: "380 (5.5%)", issuerTraded: "140 (20.5%)", pctOutstandingTraded: "16,200 Crs. (30%)" };

const RESOURCES = (() => {
  const items = [];
  for (let i = 0; i < 12; i++) {
    items.push({
      title: "Bond Concept on Passive and Active Funds",
      type: i < 3 ? "Article" : "Report",
      date: "29 Jul 2024",
    });
  }
  return items;
})();
