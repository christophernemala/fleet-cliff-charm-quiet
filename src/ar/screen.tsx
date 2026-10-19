import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Menu,
  Search,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  assignments,
  bank,
  books,
  cashFlow,
  categoryBreakdown,
  customerTx,
  customersFor,
  exceptions,
  findCustomer,
  forecasts,
  includesQuery,
  invoiceValidation,
  rollForward,
  snapshot,
  transactions,
  type Customer,
  type NoteType,
} from "@/ar/engine";
import { money, moneyCompact, pct } from "@/ar/format";
import { NOTE_LABEL, useAr, type ViewId } from "@/ar/store";

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "aging", label: "AR aging", icon: BarChart3 },
  { id: "transactions", label: "Transactions", icon: FileText },
  { id: "roll", label: "Roll-forward", icon: Calculator },
  { id: "collections", label: "Collections", icon: CreditCard },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "cash", label: "Cash flow", icon: CircleDollarSign },
  { id: "validation", label: "Invoice check", icon: FileCheck2 },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
  { id: "overdue", label: "Top overdue", icon: ListOrdered },
  { id: "assignments", label: "Assignments", icon: UserCheck },
];

const PAGE = 12;
const validationReport = invoiceValidation();
const categories = categoryBreakdown().slice(0, 6);
const assignmentRows = assignments();
const close = rollForward();

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const esc = (cell: string) => `"${cell.replaceAll('"', '""')}"`;
  const body = [header, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function useFilteredCustomers() {
  const period = useAr((s) => s.period);
  const query = useAr((s) => s.query);
  return useMemo(
    () =>
      customersFor(period)
        .filter((row) => includesQuery(row.name, query))
        .sort((a, b) => b.overdue - a.overdue || b.open - a.open),
    [period, query],
  );
}

export function CommandCenter() {
  const view = useAr((s) => s.view);
  const setView = useAr((s) => s.setView);
  const period = useAr((s) => s.period);
  const setPeriod = useAr((s) => s.setPeriod);
  const query = useAr((s) => s.query);
  const setQuery = useAr((s) => s.setQuery);
  const customer = useAr((s) => s.customer);
  const noteCustomer = useAr((s) => s.noteCustomer);
  const toast = useAr((s) => s.toast);
  const flash = useAr((s) => s.flash);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-mist text-ink">
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-foundation/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-foundation text-card transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <p className="text-xl tracking-tight">
              converg<span className="font-bold text-alert">i</span>nt
            </p>
            <p className="text-xs text-card/60">AR command center</p>
          </div>
          <button type="button" className="rounded-lg p-2 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setOpen(false);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm ${active ? "bg-card/15 text-card" : "text-card/70 hover:bg-card/10"}`}
              >
                <Icon className={`size-4 ${active ? "text-tech" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-card/10 px-4 py-4">
          <p className="text-sm font-medium">Christopher N.</p>
          <p className="text-xs text-card/50">Collection lead · Middle East</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-line bg-card px-4">
          <button type="button" className="rounded-lg border border-line p-2 lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </button>
          <label className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers, documents, receipts"
              className="h-10 w-full rounded-lg border border-line bg-mist pr-3 pl-9 text-sm"
              aria-label="Search the books"
            />
          </label>
          <div className="ml-auto flex rounded-lg border border-line p-1" role="group" aria-label="Reporting period">
            <PeriodButton active={period === "june"} onClick={() => setPeriod("june")}>
              30 Jun
            </PeriodButton>
            <PeriodButton active={period === "july"} onClick={() => setPeriod("july")}>
              30 Jul
            </PeriodButton>
          </div>
        </header>
        <div className="border-b border-line bg-card px-4 py-2 md:hidden">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers"
            className="h-10 w-full rounded-lg border border-line bg-mist px-3 text-sm"
            aria-label="Search customers"
          />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {view === "dashboard" && <Dashboard />}
          {view === "aging" && <Aging />}
          {view === "transactions" && <Transactions />}
          {view === "roll" && <Roll />}
          {view === "collections" && <Collections />}
          {view === "forecast" && <Forecast />}
          {view === "cash" && <Cash />}
          {view === "validation" && <Validation />}
          {view === "exceptions" && <Exceptions />}
          {view === "overdue" && <Overdue />}
          {view === "assignments" && <Assignments />}
        </main>
      </div>
      {customer && <CustomerSheet />}
      {noteCustomer && <NoteDialog />}
      {toast && (
        <button type="button" className="fixed right-4 bottom-4 z-50 rounded-lg bg-foundation px-4 py-3 text-sm text-card" onClick={() => flash("")}>
          {toast}
        </button>
      )}
    </div>
  );
}

function PeriodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-9 rounded-md px-3 text-sm ${active ? "bg-foundation text-card" : "text-muted"}`}>
      {children}
    </button>
  );
}

function PageHead({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foundation">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-10 rounded-lg border border-line bg-card px-3 text-sm font-medium text-foundation">
      {children}
    </button>
  );
}

function Kpi({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: "alert" | "warn" | "ok" }) {
  const color = tone === "alert" ? "text-alert" : tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-foundation";
  return (
    <article className="rounded-card border border-line bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-2 truncate text-lg font-semibold tabular-nums sm:text-xl ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </article>
  );
}

function CustomerButton({ name }: { name: string }) {
  const openCustomer = useAr((s) => s.openCustomer);
  return (
    <button type="button" className="text-left font-medium text-foundation underline-offset-2 hover:underline" onClick={() => openCustomer(name)}>
      {name}
    </button>
  );
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
      <span className="text-muted">
        Page {page + 1} of {pages}
      </span>
      <div className="flex gap-2">
        <GhostButton onClick={() => onPage(Math.max(0, page - 1))}>Previous</GhostButton>
        <GhostButton onClick={() => onPage(Math.min(pages - 1, page + 1))}>Next</GhostButton>
      </div>
    </div>
  );
}

function Dashboard() {
  const period = useAr((s) => s.period);
  const rows = useFilteredCustomers();
  const snap = snapshot(period);
  const label = period === "june" ? "30 June 2026" : "30 July 2026";
  return (
    <div>
      <PageHead title="Executive dashboard" detail={`Accounts receivable as of ${label}. Bank collections are the 19 July EIB receipts.`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total AR" value={moneyCompact(snap.total)} detail={`${snap.customers} customers`} />
        <Kpi label="Overdue" value={moneyCompact(snap.overdue)} detail={pct(snap.overduePct)} tone="warn" />
        <Kpi label="90+ days" value={moneyCompact(snap.over90)} detail={pct(snap.over90Pct)} tone="alert" />
        <Kpi label="EIB collections" value={moneyCompact(books.collections)} detail="July receipts" tone="ok" />
        <Kpi label="Current" value={moneyCompact(snap.current)} detail={pct(snap.currentPct)} />
        <Kpi label="Collection rate" value={pct((books.collections / books.openingAR) * 100)} detail="Receipts / 30 June AR" />
        <Kpi label="Open invoices" value={String(books.invoices)} detail="June transaction book" />
        <Kpi label="DSO" value={`${books.dso} days`} detail="Baseline on the June book" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-sm font-semibold">Aging distribution</h2>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snap.buckets}>
                <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: "#5c7386" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Bar dataKey="value" fill="#0099d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-sm font-semibold">Entity mix · June transactions</h2>
          <ul className="mt-4 space-y-3">
            {categories.map((row) => (
              <li key={row.name}>
                <div className="mb-1 flex justify-between gap-3 text-xs">
                  <span>{row.name}</span>
                  <span className="tabular-nums text-muted">{moneyCompact(row.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-mist">
                  <div className="h-2 rounded-full bg-foundation" style={{ width: `${(row.value / (categories[0]?.value || 1)) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-4 overflow-hidden rounded-card border border-line bg-card">
        <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Largest overdue balances</h2>
        <CustomerTable rows={rows.slice(0, 8)} />
      </section>
    </div>
  );
}

function CustomerTable({ rows }: { rows: Customer[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
          <tr>
            <th className="px-4 py-2 font-medium">Customer</th>
            <th className="px-3 py-2 text-right font-medium">Open</th>
            <th className="px-3 py-2 text-right font-medium">Current</th>
            <th className="px-3 py-2 text-right font-medium">0–30</th>
            <th className="px-3 py-2 text-right font-medium">31–60</th>
            <th className="px-3 py-2 text-right font-medium">61–90</th>
            <th className="px-3 py-2 text-right font-medium">90+</th>
            <th className="px-4 py-2 text-right font-medium">Overdue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-line">
              <td className="px-4 py-3"><CustomerButton name={row.name} /></td>
              <td className="px-3 py-3 text-right tabular-nums">{money(row.open)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{money(row.current)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{money(row.d0)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{money(row.d31)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{money(row.d61)}</td>
              <td className="px-3 py-3 text-right text-alert tabular-nums">{money(row.d90)}</td>
              <td className="px-4 py-3 text-right font-medium text-warn tabular-nums">{money(row.overdue)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted">No customers match this search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Aging() {
  const period = useAr((s) => s.period);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const rows = useFilteredCustomers();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  const label = period === "june" ? "30 June 2026" : "30 July 2026";
  return (
    <div>
      <PageHead
        title="AR aging"
        detail={`${rows.length} customers on the ${label} summary. Amounts are the imported open balances, not estimates.`}
        action={
          <GhostButton
            onClick={() =>
              downloadCsv(
                `convergint-aging-${period}.csv`,
                ["Customer", "Open", "Current", "0-30", "31-60", "61-90", "90+", "Overdue"],
                rows.map((row) => [row.name, String(row.open), String(row.current), String(row.d0), String(row.d31), String(row.d61), String(row.d90), String(row.overdue)]),
              )
            }
          >
            Export CSV
          </GhostButton>
        }
      />
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <CustomerTable rows={slice} />
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function Transactions() {
  const query = useAr((s) => s.query);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const rows = useMemo(
    () => transactions.filter((row) => includesQuery(`${row.customer ?? ""} ${row.documentNumber ?? ""} ${row.transactionType ?? ""}`, query)),
    [query],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <div>
      <PageHead title="Transactions" detail={`${rows.length} lines from the June detailed aging. Open a customer for the statement.`} />
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Document</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Due</th>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-4 py-2 text-right font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row, index) => (
                <tr key={`${row.documentNumber}-${index}`} className="border-t border-line">
                  <td className="px-4 py-3">{row.customer ? <CustomerButton name={row.customer} /> : "—"}</td>
                  <td className="px-3 py-3">{row.transactionType}</td>
                  <td className="px-3 py-3 tabular-nums">{row.documentNumber || "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{row.date || "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{row.dueDate || "—"}</td>
                  <td className="px-3 py-3">{row.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(row.openBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function Roll() {
  const go = close.status === "GO";
  return (
    <div>
      <PageHead title="Monthly close roll-forward" detail="June opening to the 30 July reported close. Invoices issued are implied by the two snapshots, credit memos, and EIB collections." />
      <div className={`mb-4 rounded-card border p-6 text-center ${go ? "border-ok/30 bg-ok/5" : "border-alert/30 bg-alert/5"}`}>
        <p className={`text-3xl font-semibold ${go ? "text-ok" : "text-alert"}`}>{close.status}</p>
        <p className="mt-1 text-sm text-muted">Difference {money(close.difference)} · tolerance {money(close.tolerance)}</p>
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <Line label="Opening AR · 30 June" value={money(close.openingAR)} />
        <Line label="Invoices issued in July (implied)" value={money(close.invoicesIssued)} />
        <Line label="Credit notes" value={`(${money(close.creditNotes)})`} />
        <Line label="Collections · EIB" value={`(${money(close.collections)})`} />
        <Line label="Adjustments" value={money(close.adjustments)} />
        <Line label="Calculated closing" value={money(close.calculatedClosing)} strong />
        <Line label="Reported closing · 30 July" value={money(close.reportedClosing)} strong />
      </section>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-t border-line px-4 py-3 first:border-t-0 ${strong ? "bg-mist" : ""}`}>
      <span className={strong ? "font-semibold" : "text-sm"}>{label}</span>
      <span className={`tabular-nums ${strong ? "text-lg font-semibold" : "text-sm"}`}>{value}</span>
    </div>
  );
}

function Collections() {
  const query = useAr((s) => s.query);
  const allocated = useAr((s) => s.allocated);
  const toggle = useAr((s) => s.toggleAllocated);
  const rows = bank.filter((row) => includesQuery(`${row.customer} ${row.match} ${row.reference} ${row.invoice}`, query));
  const ready = rows.filter((row) => row.status === "Ready to allocate" || allocated.includes(row.serial));
  return (
    <div>
      <PageHead title="Bank collections" detail={`${money(books.collections)} across 19 EIB receipts. Mark a receipt allocated once the invoice is identified. That choice stays in this browser.`} />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Ready or marked" value={String(ready.length)} detail="Of the filtered receipts" tone="ok" />
        <Kpi label="Still searching" value={String(rows.length - ready.length)} detail="NetSuite invoice search" tone="warn" />
      </div>
      <div className="grid gap-3">
        {rows.map((row) => {
          const done = allocated.includes(row.serial) || row.status === "Ready to allocate";
          return (
            <article key={row.serial} className="rounded-card border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.customer}</p>
                  <p className="mt-1 text-xs text-muted">
                    {row.date} · {row.reference} · {row.bucket}
                  </p>
                </div>
                <p className="text-lg font-semibold tabular-nums">{money(row.amount)}</p>
              </div>
              <p className="mt-3 text-sm text-muted">{row.instruction}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${done ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"}`}>
                  {allocated.includes(row.serial) ? "Marked allocated" : row.status}
                </span>
                <span className="text-xs text-muted">{row.confidence} confidence · open {money(row.openBalance)}</span>
                {row.status !== "Ready to allocate" && (
                  <button type="button" className="ml-auto min-h-10 rounded-lg bg-foundation px-3 text-sm text-card" onClick={() => toggle(row.serial)}>
                    {allocated.includes(row.serial) ? "Undo" : "Mark allocated"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Forecast() {
  const query = useAr((s) => s.query);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const rows = forecasts.filter((row) => includesQuery(row.customer, query) && row.openBalance !== 0);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  const sum = (key: "week1" | "week2" | "week3" | "week4" | "august" | "september" | "beyond") =>
    rows.reduce((total, row) => total + Math.max(0, row[key]), 0);
  return (
    <div>
      <PageHead title="Collection forecast" detail="Imported July weekly forecast plus August, September, and beyond. Zero means the source file had no amount." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="July weeks" value={moneyCompact(sum("week1") + sum("week2") + sum("week3") + sum("week4"))} detail="Positive forecast only" />
        <Kpi label="August" value={moneyCompact(sum("august"))} detail="Source column" />
        <Kpi label="September" value={moneyCompact(sum("september"))} detail="Source column" />
        <Kpi label="Beyond" value={moneyCompact(sum("beyond"))} detail="After September" />
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 text-right font-medium">W1</th>
                <th className="px-3 py-2 text-right font-medium">W2</th>
                <th className="px-3 py-2 text-right font-medium">W3</th>
                <th className="px-3 py-2 text-right font-medium">W4</th>
                <th className="px-3 py-2 text-right font-medium">Aug</th>
                <th className="px-3 py-2 text-right font-medium">Sep</th>
                <th className="px-4 py-2 text-right font-medium">Beyond</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => (
                <tr key={row.customer} className="border-t border-line">
                  <td className="px-4 py-3"><CustomerButton name={row.customer} /></td>
                  {[row.week1, row.week2, row.week3, row.week4, row.august, row.september, row.beyond].map((value, index) => (
                    <td key={index} className="px-3 py-3 text-right tabular-nums last:pr-4">{moneyCompact(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function Cash() {
  const notes = useAr((s) => s.notes);
  const flow = useMemo(() => cashFlow(notes), [notes]);
  return (
    <div>
      <PageHead title="Cash flow" detail="Expected inflow is the higher of the imported forecast and a saved payment commitment, so the two are not double-counted." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Expected inflow" value={moneyCompact(flow.totalExpected)} detail={`${pct(flow.coverage)} of positive open AR`} tone="ok" />
        <Kpi label="Base forecast" value={moneyCompact(flow.totalForecast)} detail="Imported schedule" />
        <Kpi label="Commitments" value={moneyCompact(flow.totalCommitments)} detail="Saved on this device" />
        <Kpi label="Overdue exposure" value={moneyCompact(flow.overdue)} detail="30 June overdue" tone="warn" />
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">Period</th>
              <th className="px-3 py-2 text-right font-medium">Forecast</th>
              <th className="px-3 py-2 text-right font-medium">Committed</th>
              <th className="px-3 py-2 text-right font-medium">Expected</th>
              <th className="px-4 py-2 text-right font-medium">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {flow.periods.map((row) => (
              <tr key={row.key} className="border-t border-line">
                <td className="px-4 py-3">{row.label}</td>
                <td className="px-3 py-3 text-right tabular-nums">{moneyCompact(row.base)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{moneyCompact(row.committed)}</td>
                <td className="px-3 py-3 text-right font-medium tabular-nums">{moneyCompact(row.expected)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{moneyCompact(row.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="mt-3 text-xs text-muted">Log a payment commitment on Assignments to move cash into the promised week. Confidence is 90% when a dated commitment exists.</p>
    </div>
  );
}

function Validation() {
  const filter = useAr((s) => s.validation);
  const setFilter = useAr((s) => s.setValidation);
  const query = useAr((s) => s.query);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const rows = validationReport.rows.filter((row) => (filter === "all" || row.status === filter) && includesQuery(`${row.customer} ${row.document} ${row.issues.join(" ")}`, query));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <div>
      <PageHead title="Invoice validation" detail="Every June transaction is checked for missing data, duplicates, sign, category, and aging. Nothing is filled in." />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Kpi label="Valid" value={String(validationReport.valid)} detail="No findings" tone="ok" />
        <Kpi label="Warning" value={String(validationReport.warning)} detail="Review, do not block" tone="warn" />
        <Kpi label="Error" value={String(validationReport.error)} detail="Fails a control" tone="alert" />
      </div>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Validation status">
        {(["all", "Error", "Warning", "Valid"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 rounded-full px-3 text-sm ${filter === item ? "bg-foundation text-card" : "border border-line bg-card"}`}>
            {item === "all" ? "All" : item}
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Document</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Findings</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-4 py-3"><Status status={row.status} /></td>
                  <td className="px-3 py-3">{row.customer !== "—" ? <CustomerButton name={row.customer} /> : "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{row.document}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{money(row.amount)}</td>
                  <td className="px-4 py-3 text-muted">{row.issues.join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const tone = status === "Error" || status === "High" || status === "Critical" ? "text-alert bg-alert/10" : status === "Warning" || status === "Medium" || status === "High" ? "text-warn bg-warn/10" : "text-ok bg-ok/10";
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone}`}>{status}</span>;
}

function Exceptions() {
  const allocated = useAr((s) => s.allocated);
  const severity = useAr((s) => s.severity);
  const setSeverity = useAr((s) => s.setSeverity);
  const query = useAr((s) => s.query);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const all = useMemo(() => exceptions(allocated), [allocated]);
  const rows = all.filter((row) => (severity === "all" || row.severity === severity) && includesQuery(`${row.customer} ${row.document} ${row.type} ${row.description}`, query));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  const high = all.filter((row) => row.severity === "High").length;
  return (
    <div>
      <PageHead title="Exception queue" detail="Unmatched receipts, missing customers, and unmapped document prefixes. Marking a receipt allocated removes it here." />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Open items" value={String(all.length)} detail="After local allocations" />
        <Kpi label="High severity" value={String(high)} detail="Receipts and missing customers" tone="alert" />
      </div>
      <div className="mb-3 flex gap-2">
        {(["all", "High", "Medium"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setSeverity(item)} className={`min-h-10 rounded-full px-3 text-sm ${severity === item ? "bg-foundation text-card" : "border border-line bg-card"}`}>
            {item === "all" ? "All" : item}
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Reference</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row, index) => (
                <tr key={`${row.document}-${index}`} className="border-t border-line">
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-3 py-3"><Status status={row.severity} /></td>
                  <td className="px-3 py-3">{row.customer !== "—" ? <CustomerButton name={row.customer} /> : "—"}</td>
                  <td className="px-3 py-3 text-muted">{row.document || row.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function Overdue() {
  const rows = useFilteredCustomers().filter((row) => row.overdue > 0).slice(0, 25);
  return (
    <div>
      <PageHead title="Top overdue" detail="Ranked by overdue balance for the selected period." />
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <CustomerTable rows={rows} />
      </section>
    </div>
  );
}

function Assignments() {
  const query = useAr((s) => s.query);
  const priority = useAr((s) => s.priority);
  const setPriority = useAr((s) => s.setPriority);
  const page = useAr((s) => s.page);
  const setPage = useAr((s) => s.setPage);
  const notes = useAr((s) => s.notes);
  const openNote = useAr((s) => s.openNote);
  const rows = assignmentRows.filter((row) => (priority === "all" || row.priority === priority) && includesQuery(row.name, query));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <div>
      <PageHead
        title="Collection assignments"
        detail="Priority uses balance, overdue ratio, and 90+ concentration on the 30 June book. Notes stay on this device and feed cash flow."
      />
      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "Critical", "High", "Medium", "Watch"] as const).map((item) => (
          <button key={item} type="button" onClick={() => setPriority(item)} className={`min-h-10 rounded-full px-3 text-sm ${priority === item ? "bg-foundation text-card" : "border border-line bg-card"}`}>
            {item === "all" ? "All" : item}
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-mist text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 text-right font-medium">Score</th>
                <th className="px-3 py-2 text-right font-medium">Overdue</th>
                <th className="px-3 py-2 font-medium">Next step</th>
                <th className="px-4 py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => {
                const note = notes.find((item) => item.customer === row.name);
                return (
                  <tr key={row.name} className="border-t border-line">
                    <td className="px-4 py-3"><CustomerButton name={row.name} /></td>
                    <td className="px-3 py-3"><Status status={row.priority} /></td>
                    <td className="px-3 py-3 text-right tabular-nums">{row.score}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{moneyCompact(row.overdue)}</td>
                    <td className="px-3 py-3 text-muted">{note?.nextFollowUp ? `Follow up ${note.nextFollowUp}` : row.action}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="min-h-10 text-sm font-medium text-tech" onClick={() => openNote(row.name)}>
                        {note ? "Add note" : "Log"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} />
      </section>
    </div>
  );
}

function CustomerSheet() {
  const name = useAr((s) => s.customer) ?? "";
  const period = useAr((s) => s.period);
  const closeSheet = useAr((s) => s.openCustomer);
  const openNote = useAr((s) => s.openNote);
  const notes = useAr((s) => s.notes).filter((note) => note.customer === name);
  const customer = findCustomer(name, period);
  const lines = customerTx(name).slice(0, 40);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foundation/40">
      <button type="button" className="hidden flex-1 sm:block" aria-label="Close customer" onClick={() => closeSheet(null)} />
      <aside className="flex h-full w-full flex-col bg-card sm:max-w-xl" role="dialog" aria-labelledby="customer-title">
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
          <div>
            <p className="text-xs tracking-wide text-muted uppercase">Customer statement</p>
            <h2 id="customer-title" className="text-lg font-semibold text-foundation">{name}</h2>
          </div>
          <button type="button" aria-label="Close" className="rounded-lg border border-line p-2" onClick={() => closeSheet(null)}>
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {customer ? (
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Open" value={moneyCompact(customer.open)} detail={period === "june" ? "30 June" : "30 July"} />
              <Kpi label="Overdue" value={moneyCompact(customer.overdue)} detail={`90+ ${moneyCompact(customer.d90)}`} tone="warn" />
            </div>
          ) : (
            <p className="text-sm text-muted">This name is on a transaction but not on the selected aging summary.</p>
          )}
          <div className="mt-4 flex gap-2">
            <button type="button" className="min-h-10 rounded-lg bg-foundation px-3 text-sm text-card" onClick={() => openNote(name)}>
              Log follow-up
            </button>
          </div>
          <h3 className="mt-6 text-sm font-semibold">Open lines</h3>
          <ul className="mt-2 divide-y divide-line">
            {lines.map((line, index) => (
              <li key={`${line.documentNumber}-${index}`} className="flex justify-between gap-3 py-2 text-sm">
                <span>
                  {line.documentNumber || "No document"}
                  <span className="block text-xs text-muted">{line.transactionType} · {line.date}</span>
                </span>
                <span className="tabular-nums">{money(line.openBalance)}</span>
              </li>
            ))}
            {lines.length === 0 && <li className="py-3 text-sm text-muted">No detailed lines for this customer.</li>}
          </ul>
          <h3 className="mt-6 text-sm font-semibold">Follow-up notes</h3>
          <ul className="mt-2 space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-line p-3 text-sm">
                <p className="text-xs text-muted">{NOTE_LABEL[note.noteType]} · {new Date(note.createdAt).toLocaleString()}</p>
                <p className="mt-1">{note.content}</p>
                {note.promisedAmount && <p className="mt-1 text-xs">Promised {money(Number(note.promisedAmount))} on {note.promisedDate || "unspecified date"}</p>}
              </li>
            ))}
            {notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function NoteDialog() {
  const customer = useAr((s) => s.noteCustomer) ?? "";
  const close = useAr((s) => s.openNote);
  const addNote = useAr((s) => s.addNote);
  const [noteType, setNoteType] = useState<NoteType>("call_outcome");
  const [content, setContent] = useState("");
  const [promisedAmount, setPromisedAmount] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foundation/40 p-4 sm:items-center">
      <form
        className="w-full max-w-md rounded-card bg-card p-4 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (!content.trim()) return;
          addNote({
            customer,
            noteType,
            content: content.trim(),
            promisedAmount: promisedAmount.trim(),
            promisedDate,
            nextFollowUp,
          });
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foundation">Follow-up · {customer}</h2>
          <button type="button" aria-label="Close note" onClick={() => close(null)} className="rounded-lg border border-line p-2">
            <X className="size-4" />
          </button>
        </div>
        <label className="mt-4 block text-sm">
          Type
          <select value={noteType} onChange={(event) => setNoteType(event.target.value as NoteType)} className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-2">
            {Object.entries(NOTE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          Note
          <textarea required value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-line bg-mist p-2" />
        </label>
        {noteType === "payment_commitment" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm">
              Amount
              <input inputMode="decimal" value={promisedAmount} onChange={(event) => setPromisedAmount(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-line px-2" />
            </label>
            <label className="text-sm">
              Promised date
              <input type="date" value={promisedDate} onChange={(event) => setPromisedDate(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-line px-2" />
            </label>
          </div>
        )}
        <label className="mt-3 block text-sm">
          Next follow-up
          <input type="date" value={nextFollowUp} onChange={(event) => setNextFollowUp(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-line px-2" />
        </label>
        <button type="submit" className="mt-4 min-h-11 w-full rounded-lg bg-foundation text-sm font-medium text-card">
          Save note
        </button>
      </form>
    </div>
  );
}
