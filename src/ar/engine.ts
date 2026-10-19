import ledger from "@/data/ledger.json";
import { round2 } from "@/ar/format";

export type Period = "june" | "july";

export type Customer = {
  name: string;
  open: number;
  current: number;
  d0: number;
  d31: number;
  d61: number;
  d90: number;
  overdue: number;
};

export type ForecastRow = {
  customer: string;
  openBalance: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  august: number;
  september: number;
  beyond: number;
};

export type BankReceipt = {
  serial: number;
  date: string;
  customer: string;
  match: string;
  invoice: string;
  amount: number;
  status: string;
  confidence: string;
  bucket: string;
  reference: string;
  instruction: string;
  openBalance: number;
};

export type Txn = {
  customer: string | null;
  transactionType: string | null;
  date: string | null;
  documentNumber: string | null;
  dueDate: string | null;
  age: number | null;
  openBalance: number;
  category: string;
};

export type NoteType =
  | "call_outcome"
  | "payment_commitment"
  | "followup_scheduled"
  | "dispute"
  | "general";

export type FollowUp = {
  id: string;
  customer: string;
  noteType: NoteType;
  content: string;
  promisedDate: string;
  promisedAmount: string;
  nextFollowUp: string;
  createdAt: number;
};

type JuneRaw = {
  n: string;
  o: number;
  c: number;
  a: number;
  b: number;
  d: number;
  g: number;
  v: number;
};

const june: Customer[] = (ledger.june as JuneRaw[]).map((c) => ({
  name: c.n,
  open: c.o,
  current: c.c,
  d0: c.a,
  d31: c.b,
  d61: c.d,
  d90: c.g,
  overdue: c.v,
}));

const july: Customer[] = (ledger.july as JuneRaw[]).map((c) => ({
  name: c.n,
  open: c.o,
  current: c.c,
  d0: c.a,
  d31: c.b,
  d61: c.d,
  d90: c.g,
  overdue: c.v,
}));

export const forecasts: ForecastRow[] = ledger.forecasts.map((c) => ({
  customer: c.n,
  openBalance: c.o,
  week1: c.w1,
  week2: c.w2,
  week3: c.w3,
  week4: c.w4,
  august: c.aug,
  september: c.sep,
  beyond: c.bey,
}));

export const bank: BankReceipt[] = ledger.bank.map((b) => ({
  serial: b.s,
  date: b.dt,
  customer: b.cu,
  match: b.m,
  invoice: b.inv,
  amount: b.amt,
  status: b.st,
  confidence: b.cf,
  bucket: b.bk,
  reference: b.ref,
  instruction: b.ins,
  openBalance: b.open,
}));

export const transactions: Txn[] = ledger.tx.map((t) => ({
  customer: t.n,
  transactionType: t.ty,
  date: t.dt,
  documentNumber: t.doc,
  dueDate: t.due,
  age: t.age,
  openBalance: t.amt,
  category: t.cat || "Review Required",
}));

export const books = {
  openingAR: ledger.kpis.totalAR,
  julyAR: ledger.kpis.julyTotalAR,
  collections: ledger.kpis.totalCollections,
  creditNotes: ledger.creditNotes,
  invoices: ledger.kpis.numInvoices,
  dso: ledger.kpis.dso,
};

export function customersFor(period: Period) {
  return period === "june" ? june : july;
}

export function snapshot(period: Period) {
  const rows = customersFor(period);
  const total = round2(rows.reduce((s, r) => s + r.open, 0));
  const current = round2(rows.reduce((s, r) => s + r.current, 0));
  const overdue = round2(rows.reduce((s, r) => s + r.overdue, 0));
  const over90 = round2(rows.reduce((s, r) => s + r.d90, 0));
  const d0 = round2(rows.reduce((s, r) => s + r.d0, 0));
  const d31 = round2(rows.reduce((s, r) => s + r.d31, 0));
  const d61 = round2(rows.reduce((s, r) => s + r.d61, 0));
  return {
    total,
    current,
    overdue,
    over90,
    d0,
    d31,
    d61,
    customers: rows.length,
    overduePct: total ? round2((overdue / total) * 100) : 0,
    currentPct: total ? round2((current / total) * 100) : 0,
    over90Pct: total ? round2((over90 / total) * 100) : 0,
    buckets: [
      { bucket: "Current", value: current },
      { bucket: "0–30", value: d0 },
      { bucket: "31–60", value: d31 },
      { bucket: "61–90", value: d61 },
      { bucket: "90+", value: over90 },
    ],
  };
}

export function rollForward() {
  const openingAR = books.openingAR;
  const collections = books.collections;
  const creditNotes = books.creditNotes;
  const reportedClosing = books.julyAR;
  const invoicesIssued = round2(reportedClosing - openingAR + collections + creditNotes);
  const calculatedClosing = round2(openingAR + invoicesIssued - creditNotes - collections);
  const difference = round2(calculatedClosing - reportedClosing);
  return {
    openingAR,
    invoicesIssued,
    creditNotes,
    collections,
    adjustments: 0,
    calculatedClosing,
    reportedClosing,
    difference,
    tolerance: 1000,
    status: Math.abs(difference) < 1000 ? "GO" : "NO-GO",
  };
}

export function categoryBreakdown() {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const key = t.category || "Review Required";
    map.set(key, (map.get(key) ?? 0) + Math.abs(t.openBalance));
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
}

export type Assignment = Customer & {
  score: number;
  priority: "Critical" | "High" | "Medium" | "Watch";
  action: string;
};

export function assignments(): Assignment[] {
  const rows = june;
  const maxBalance = Math.max(...rows.map((s) => s.open), 1);
  return rows
    .map((cust) => {
      const balanceScore = (cust.open / maxBalance) * 40;
      const overdueRatio = cust.overdue / (cust.open || 1);
      const ageScore = overdueRatio * 30;
      const concentrationScore = (cust.d90 / (cust.open || 1)) * 15;
      const trendScore = 15 * (cust.overdue > 0 ? 0.5 : 0);
      const score = Math.min(100, Math.round(balanceScore + ageScore + concentrationScore + trendScore));
      let priority: Assignment["priority"] = "Watch";
      let action = "Monitor — no overdue balance";
      if (score >= 75) {
        priority = "Critical";
        action = "Call and email today";
      } else if (score >= 50) {
        priority = "High";
        action = "Weekly reminder and call";
      } else if (score >= 25) {
        priority = "Medium";
        action = "Statement and diary follow-up";
      }
      return { ...cust, score, priority, action };
    })
    .sort((a, b) => b.score - a.score || b.overdue - a.overdue);
}

export type ExceptionRow = {
  type: string;
  severity: "High" | "Medium";
  description: string;
  customer: string;
  document: string;
  amount: number;
};

export function exceptions(allocated: number[]): ExceptionRow[] {
  const rows: ExceptionRow[] = [];
  for (const b of bank) {
    if (allocated.includes(b.serial)) continue;
    if (b.status.toLowerCase().includes("search required")) {
      rows.push({
        type: "Unmatched receipt",
        severity: "High",
        description: `${b.customer} needs a NetSuite invoice search before allocation`,
        customer: b.match || b.customer,
        document: b.reference,
        amount: b.amount,
      });
    }
  }
  for (const t of transactions) {
    if (t.customer === "- No Customer/Project -") {
      rows.push({
        type: "Missing customer",
        severity: "High",
        description: "Transaction has no customer assigned",
        customer: "—",
        document: t.documentNumber ?? "",
        amount: t.openBalance,
      });
    } else if (t.category === "Review Required") {
      rows.push({
        type: "Unknown category",
        severity: "Medium",
        description: "Document prefix is not mapped to an entity",
        customer: t.customer ?? "—",
        document: t.documentNumber ?? "",
        amount: t.openBalance,
      });
    }
  }
  return rows;
}

const cashPeriods = [
  { key: "week1", label: "01–07 Jul", endDate: "2026-07-07" },
  { key: "week2", label: "08–14 Jul", endDate: "2026-07-14" },
  { key: "week3", label: "15–21 Jul", endDate: "2026-07-21" },
  { key: "week4", label: "22–31 Jul", endDate: "2026-07-31" },
  { key: "august", label: "August", endDate: "2026-08-31" },
  { key: "september", label: "September", endDate: "2026-09-30" },
  { key: "beyond", label: "Beyond Sep", endDate: "" },
] as const;

type PeriodKey = (typeof cashPeriods)[number]["key"];

function periodForDate(date: string): PeriodKey {
  if (date <= "2026-07-07") return "week1";
  if (date <= "2026-07-14") return "week2";
  if (date <= "2026-07-21") return "week3";
  if (date <= "2026-07-31") return "week4";
  if (date <= "2026-08-31") return "august";
  if (date <= "2026-09-30") return "september";
  return "beyond";
}

export function cashFlow(notes: FollowUp[]) {
  const latest = new Map<string, FollowUp>();
  for (const note of notes) {
    if (note.noteType !== "payment_commitment" || !note.promisedDate || !note.promisedAmount) continue;
    const existing = latest.get(note.customer);
    if (!existing || note.createdAt > existing.createdAt) latest.set(note.customer, note);
  }
  const overdue = new Map(june.map((c) => [c.name, c.overdue]));
  const details: Array<{
    customer: string;
    period: string;
    label: string;
    expectedDate: string;
    base: number;
    committed: number;
    expected: number;
    confidence: number;
    source: string;
  }> = [];

  for (const forecast of forecasts) {
    const commitment = latest.get(forecast.customer);
    const commitmentAmount = commitment
      ? Math.min(Math.max(0, Number(commitment.promisedAmount) || 0), Math.max(0, forecast.openBalance))
      : 0;
    const commitmentPeriod = commitment?.promisedDate ? periodForDate(commitment.promisedDate) : null;
    for (const period of cashPeriods) {
      const base = Math.max(0, forecast[period.key] ?? 0);
      const committed = commitmentPeriod === period.key ? commitmentAmount : 0;
      const expected = Math.max(base, committed);
      if (expected === 0 && committed === 0) continue;
      const source = committed >= base && committed > 0 ? "Payment commitment" : "Collection forecast";
      const confidence =
        committed > 0 ? 90 : period.key === "week1" || period.key === "week2" ? 80 : period.key === "week3" || period.key === "week4" ? 70 : period.key === "august" ? 60 : period.key === "september" ? 50 : 35;
      details.push({
        customer: forecast.customer,
        period: period.key,
        label: period.label,
        expectedDate: source === "Payment commitment" ? commitment?.promisedDate || period.endDate : period.endDate,
        base: round2(base),
        committed: round2(committed),
        expected: round2(expected),
        confidence,
        source,
      });
    }
  }

  let cumulative = 0;
  const periods = cashPeriods.map((period) => {
    const rows = details.filter((row) => row.period === period.key);
    const base = round2(rows.reduce((s, r) => s + r.base, 0));
    const committed = round2(rows.reduce((s, r) => s + r.committed, 0));
    const expected = round2(rows.reduce((s, r) => s + r.expected, 0));
    cumulative = round2(cumulative + expected);
    const confidence = expected
      ? Math.round(rows.reduce((s, r) => s + r.expected * r.confidence, 0) / expected)
      : 0;
    return { key: period.key, label: period.label, base, committed, expected, cumulative, confidence, customers: new Set(rows.map((r) => r.customer)).size };
  });

  const positiveOpen = round2(forecasts.reduce((s, f) => s + Math.max(0, f.openBalance), 0));
  const totalExpected = round2(periods.reduce((s, p) => s + p.expected, 0));
  const totalForecast = round2(periods.reduce((s, p) => s + p.base, 0));
  const totalCommitments = round2(periods.reduce((s, p) => s + p.committed, 0));
  return {
    periods,
    details: details.sort((a, b) => b.expected - a.expected),
    positiveOpen,
    totalExpected,
    totalForecast,
    totalCommitments,
    coverage: positiveOpen ? round2((totalExpected / positiveOpen) * 100) : 0,
    overdue: round2([...overdue.values()].reduce((s, n) => s + Math.max(0, n), 0)),
  };
}

const allowedTypes = new Set(["Invoice", "Journal", "Payment", "Credit Memo", "Deposit", "Cheque"]);

function parseIso(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export type ValidationStatus = "Valid" | "Warning" | "Error";

export type ValidationRow = {
  id: number;
  customer: string;
  type: string;
  document: string;
  date: string;
  due: string;
  age: number | null;
  amount: number;
  category: string;
  status: ValidationStatus;
  issues: string[];
};

export function invoiceValidation(): { rows: ValidationRow[]; valid: number; warning: number; error: number } {
  const asOf = parseIso("2026-06-30")!;
  const exact = new Map<string, number>();
  const docs = new Map<string, number>();
  for (const t of transactions) {
    if (!t.documentNumber) continue;
    const doc = t.documentNumber.trim().toUpperCase();
    docs.set(doc, (docs.get(doc) ?? 0) + 1);
    const key = [t.customer ?? "", doc, t.date ?? "", t.openBalance.toFixed(2)].join("|");
    exact.set(key, (exact.get(key) ?? 0) + 1);
  }
  const rows = transactions.map((t, index) => {
    const issues: { severity: "Error" | "Warning"; message: string }[] = [];
    const add = (severity: "Error" | "Warning", message: string) => issues.push({ severity, message });
    const customer = t.customer?.trim() ?? "";
    const document = t.documentNumber?.trim() ?? "";
    const type = t.transactionType?.trim() ?? "";
    const invoiceDate = parseIso(t.date);
    const dueDate = parseIso(t.dueDate);
    if (!customer || customer === "- No Customer/Project -") add("Error", "Customer is missing");
    if (!type || !allowedTypes.has(type)) add("Error", "Transaction type is unsupported");
    if (!document) add("Error", "Document number is missing");
    if (!invoiceDate) add("Error", "Transaction date is invalid");
    else if (invoiceDate > asOf) add("Error", "Transaction date is after 30 June 2026");
    if (type === "Invoice" && !dueDate) add("Error", "Invoice due date is missing");
    if (invoiceDate && dueDate && dueDate < invoiceDate) add("Error", "Due date is before the invoice date");
    if (!Number.isFinite(t.openBalance)) add("Error", "Open balance is not a number");
    else if (t.openBalance === 0) add("Warning", "Open balance is zero");
    if (type === "Invoice" && t.openBalance < 0) add("Warning", "Invoice has a negative balance");
    if (["Credit Memo", "Payment", "Deposit"].includes(type) && t.openBalance > 0) add("Warning", `${type} has a positive balance`);
    if (t.category === "Review Required") add("Warning", "Entity category needs review");
    if (document) {
      const doc = document.toUpperCase();
      const key = [t.customer ?? "", doc, t.date ?? "", t.openBalance.toFixed(2)].join("|");
      if ((exact.get(key) ?? 0) > 1) add("Error", "Exact duplicate");
      else if ((docs.get(doc) ?? 0) > 1) add("Warning", "Document number repeats");
    }
    if (invoiceDate && t.age !== null && Number.isFinite(t.age)) {
      const calculated = Math.floor((asOf.getTime() - invoiceDate.getTime()) / 86_400_000);
      if (Math.abs(calculated - t.age) > 7) add("Warning", `Age ${t.age} vs calculated ${calculated}`);
    }
    const status: ValidationStatus = issues.some((i) => i.severity === "Error") ? "Error" : issues.length ? "Warning" : "Valid";
    return {
      id: index + 1,
      customer: customer || "—",
      type: type || "—",
      document: document || "—",
      date: t.date || "—",
      due: t.dueDate || "—",
      age: t.age,
      amount: t.openBalance,
      category: t.category,
      status,
      issues: issues.map((i) => i.message),
    };
  });
  return {
    rows,
    valid: rows.filter((r) => r.status === "Valid").length,
    warning: rows.filter((r) => r.status === "Warning").length,
    error: rows.filter((r) => r.status === "Error").length,
  };
}

export function customerTx(name: string) {
  return transactions.filter((t) => t.customer === name);
}

export function findCustomer(name: string, period: Period) {
  return customersFor(period).find((c) => c.name === name) ?? june.find((c) => c.name === name) ?? july.find((c) => c.name === name);
}

export function includesQuery(value: string, query: string) {
  const q = query.trim().toLowerCase();
  return !q || value.toLowerCase().includes(q);
}
