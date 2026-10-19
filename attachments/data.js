// Realistic AR placeholder data – AED focus with multi-entity
window.AR_DATA = {
  asOf: '2026-08-09',
  entities: ['UAE', 'South Africa', 'Australia', 'United Kingdom', 'Ireland', 'United States'],
  kpis: {
    totalOutstanding: 18427500,
    overduePct: 27.4,
    exposure90: 4128900,
    dso: 48.2,
    unappliedCash: 892400,
    forecast30d: 6250000
  },
  ageingSummary: [
    { bucket: '0-30', amount: 6215000, pct: 33.7 },
    { bucket: '31-60', amount: 3892000, pct: 21.1 },
    { bucket: '61-90', amount: 4191600, pct: 22.7 },
    { bucket: '90+', amount: 4128900, pct: 22.4 }
  ],
  topOverdue: [
    { customer: 'Emirates Tower Facilities LLC', entity: 'UAE', amount: 1248500, days: 112, status: 'Overdue' },
    { customer: 'Cape Security Systems Pty', entity: 'South Africa', amount: 876200, days: 95, status: 'Promised' },
    { customer: 'Sydney Harbour Integration', entity: 'Australia', amount: 654300, days: 78, status: 'Overdue' },
    { customer: 'London Secure Solutions Ltd', entity: 'United Kingdom', amount: 512800, days: 67, status: 'Overdue' },
    { customer: 'Dublin Fire & Safety Ltd', entity: 'Ireland', amount: 389400, days: 54, status: 'Promised' }
  ],
  invoices: [
    { id: 'INV-2026-1842', customer: 'Emirates Tower Facilities LLC', entity: 'UAE', invDate: '2026-03-12', dueDate: '2026-04-11', currency: 'AED', open: 1248500, b0: 0, b31: 0, b61: 0, b90: 1248500, status: 'Overdue', owner: 'S. Al Maktoum', next: 'Call 12 Aug' },
    { id: 'INV-2026-1799', customer: 'Cape Security Systems Pty', entity: 'South Africa', invDate: '2026-04-02', dueDate: '2026-05-02', currency: 'AED', open: 876200, b0: 0, b31: 0, b61: 0, b90: 876200, status: 'Promised', owner: 'J. van der Berg', next: 'Promise 15 Aug' },
    { id: 'INV-2026-1911', customer: 'Sydney Harbour Integration', entity: 'Australia', invDate: '2026-05-18', dueDate: '2026-06-17', currency: 'AED', open: 654300, b0: 0, b31: 0, b61: 654300, b90: 0, status: 'Overdue', owner: 'M. Chen', next: 'Escalate' },
    { id: 'INV-2026-2033', customer: 'London Secure Solutions Ltd', entity: 'United Kingdom', invDate: '2026-05-28', dueDate: '2026-06-27', currency: 'AED', open: 512800, b0: 0, b31: 0, b61: 512800, b90: 0, status: 'Overdue', owner: 'A. Patel', next: 'SOA sent' },
    { id: 'INV-2026-2104', customer: 'Dublin Fire & Safety Ltd', entity: 'Ireland', invDate: '2026-06-10', dueDate: '2026-07-10', currency: 'AED', open: 389400, b0: 0, b31: 389400, b61: 0, b90: 0, status: 'Promised', owner: 'C. O\'Brien', next: 'Follow-up 14 Aug' },
    { id: 'INV-2026-2210', customer: 'Chicago Building Controls Inc', entity: 'United States', invDate: '2026-07-01', dueDate: '2026-07-31', currency: 'AED', open: 298700, b0: 298700, b31: 0, b61: 0, b90: 0, status: 'Open', owner: 'R. Thompson', next: 'Monitor' },
    { id: 'INV-2026-2255', customer: 'Abu Dhabi Smart Cities', entity: 'UAE', invDate: '2026-07-08', dueDate: '2026-08-07', currency: 'AED', open: 445000, b0: 445000, b31: 0, b61: 0, b90: 0, status: 'Open', owner: 'S. Al Maktoum', next: 'Reminder' },
    { id: 'INV-2026-2301', customer: 'Johannesburg Metro Security', entity: 'South Africa', invDate: '2026-06-22', dueDate: '2026-07-22', currency: 'AED', open: 312500, b0: 0, b31: 312500, b61: 0, b90: 0, status: 'Overdue', owner: 'J. van der Berg', next: 'Call' }
  ],
  bankTxns: [
    { id: 'BT-88421', date: '2026-08-07', amount: 1248500, ref: 'ETF-88421', suggested: 'INV-2026-1842', confidence: 94, reason: 'Exact amount + customer name match', varianceAmt: 0, varianceDays: 0 },
    { id: 'BT-88430', date: '2026-08-06', amount: 450000, ref: 'WIRE-UK-992', suggested: 'INV-2026-2033', confidence: 78, reason: 'Partial match, amount within 12%', varianceAmt: 62800, varianceDays: 2 },
    { id: 'BT-88441', date: '2026-08-05', amount: 298700, ref: 'ACH-CHI-110', suggested: 'INV-2026-2210', confidence: 91, reason: 'Exact amount + entity match', varianceAmt: 0, varianceDays: 1 }
  ],
  customers: {
    'Emirates Tower Facilities LLC': {
      exposure: 1248500, dso: 98, risk: 'High', contact: 'Fatima Al Nahyan • +971 4 123 4567',
      promise: 'AED 600k by 15 Aug, remainder 30 Aug',
      invoices: ['INV-2026-1842'],
      activity: [
        { date: '2026-08-05', type: 'Call', note: 'Discussed cash flow delay, commitment secured' },
        { date: '2026-07-28', type: 'SOA', note: 'Statement of Account emailed' }
      ]
    }
  },
  forecast: {
    base: [2100, 2450, 1980, 3200, 2800, 3100],
    best: [2400, 2800, 2300, 3600, 3200, 3500],
    down: [1600, 1900, 1500, 2400, 2100, 2300],
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
  }
};

window.formatAED = (n) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(n);
