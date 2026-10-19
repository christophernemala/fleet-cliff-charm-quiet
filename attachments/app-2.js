(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Auth ----------
  $('#login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#view-login').classList.add('hidden');
    $('#app-shell').classList.remove('hidden');
    navigate('dashboard');
  });

  // ---------- Routing ----------
  function navigate(route, params = {}) {
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.route === route));
    const main = $('#main-content');
    main.innerHTML = '';
    main.classList.add('fade-in');
    setTimeout(() => main.classList.remove('fade-in'), 250);

    const map = {
      dashboard: renderDashboard,
      ageing: renderAgeing,
      reconciliation: renderReconciliation,
      forecast: renderForecast,
      admin: renderAdmin,
      customer: () => renderCustomer(params.id)
    };
    (map[route] || renderDashboard)();
  }

  $$('#main-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  // Global search shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      $('#global-search')?.focus();
    }
  });

  // ---------- AI Chat ----------
  const aiMessages = $('#ai-messages');
  $('#ai-toggle')?.addEventListener('click', () => $('#ai-panel').classList.toggle('hidden'));
  $('#ai-close')?.addEventListener('click', () => $('#ai-panel').classList.add('hidden'));
  $('#ai-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const q = e.target.value.trim();
      appendAi('user', q);
      e.target.value = '';
      setTimeout(() => {
        let reply = 'I can help with ageing analysis, collection prioritisation, and reconciliation suggestions. ';
        if (/overdue|90|exposure/i.test(q)) reply = `Current 90+ exposure is ${formatAED(AR_DATA.kpis.exposure90)}. Top account: Emirates Tower Facilities LLC (AED 1.25M, 112 days). Recommend escalation and partial promise follow-up.`;
        else if (/dso|days/i.test(q)) reply = `Group DSO stands at ${AR_DATA.kpis.dso} days. UAE is elevated due to the Emirates Tower balance. Target DSO is 42 days.`;
        else if (/reconcil|match|cash/i.test(q)) reply = `3 bank transactions await review. Highest confidence match (94%): BT-88421 → INV-2026-1842 (exact amount).`;
        else if (/forecast|cash/i.test(q)) reply = `30-day collections forecast: ${formatAED(AR_DATA.kpis.forecast30d)}. Base case assumes 68% collection of current open.`;
        appendAi('bot', reply);
      }, 600);
    }
  });
  function appendAi(role, text) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'text-right' : '';
    div.innerHTML = `<div class="inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm ${role === 'user' ? 'bg-convergint-blue text-white' : 'bg-graphite-800 text-gray-200'}">${text}</div>`;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  // ---------- Renderers ----------
  function renderDashboard() {
    const d = AR_DATA;
    $('#main-content').innerHTML = `
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h1 class="font-title text-2xl font-semibold tracking-tight">AR Command Center</h1>
          <p class="text-sm text-gray-400 mt-1">Group receivables overview • As of ${d.asOf}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost">Export summary</button>
          <button class="btn btn-primary">Run month-end pack</button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        ${kpi('Total Outstanding', formatAED(d.kpis.totalOutstanding), 'All open invoices')}
        ${kpi('Overdue %', d.kpis.overduePct + '%', 'Past due / total')}
        ${kpi('90+ Exposure', formatAED(d.kpis.exposure90), 'Critical ageing')}
        ${kpi('DSO', d.kpis.dso + ' days', 'Days sales outstanding')}
        ${kpi('Unapplied Cash', formatAED(d.kpis.unappliedCash), 'Pending allocation')}
        ${kpi('30d Forecast', formatAED(d.kpis.forecast30d), 'Expected collections')}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div class="xl:col-span-1 glass-panel rounded-xl p-5 border border-white/8">
          <h3 class="text-sm font-medium text-gray-300 mb-4">Ageing Exposure</h3>
          <canvas id="ageingChart" height="200"></canvas>
        </div>
        <div class="xl:col-span-2 glass-panel rounded-xl p-5 border border-white/8">
          <h3 class="text-sm font-medium text-gray-300 mb-4">Top Overdue Customers</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Customer</th><th>Entity</th><th>Open Amount</th><th>Days</th><th>Status</th></tr></thead>
              <tbody>
                ${d.topOverdue.map(r => `
                  <tr class="cursor-pointer hover:bg-white/5" onclick="window.__navCustomer('${r.customer}')">
                    <td class="font-medium">${r.customer}</td>
                    <td>${r.entity}</td>
                    <td>${formatAED(r.amount)}</td>
                    <td>${r.days}</td>
                    <td><span class="status-pill status-${r.status.toLowerCase()}">${r.status}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="glass-panel rounded-xl p-5 border border-white/8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-300">Action Queue</h3>
          <span class="text-xs text-gray-500">4 critical items</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          ${actionCard('Overdue promises', '2 due this week', 'Review')}
          ${actionCard('Unreconciled cash', '3 transactions', 'Match')}
          ${actionCard('SOAs due', '5 statements', 'Generate')}
          ${actionCard('Critical exceptions', '1 high risk', 'Escalate')}
        </div>
      </div>
    `;
    // Chart
    new Chart($('#ageingChart'), {
      type: 'doughnut',
      data: {
        labels: d.ageingSummary.map(a => a.bucket),
        datasets: [{
          data: d.ageingSummary.map(a => a.amount),
          backgroundColor: ['#56A0D3', '#5B7CFF', '#F59E0B', '#EF4444'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', boxWidth: 12 } } },
        cutout: '65%'
      }
    });
  }

  function kpi(label, value, tip) {
    return `<div class="kpi-card p-4" title="${tip}">
      <div class="text-xs text-gray-400 mb-1">${label}</div>
      <div class="font-title text-xl font-semibold tracking-tight">${value}</div>
    </div>`;
  }
  function actionCard(title, sub, cta) {
    return `<div class="bg-graphite-850 border border-white/8 rounded-lg p-4 flex items-center justify-between">
      <div><div class="text-sm font-medium">${title}</div><div class="text-xs text-gray-400 mt-0.5">${sub}</div></div>
      <button class="btn btn-ghost text-xs">${cta}</button>
    </div>`;
  }

  function renderAgeing() {
    const rows = AR_DATA.invoices;
    $('#main-content').innerHTML = `
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="font-title text-2xl font-semibold">AR Ageing Matrix</h1>
          <p class="text-sm text-gray-400 mt-1">Searchable • Filterable • Exportable</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost">Saved views</button>
          <button class="btn btn-ghost">Export CSV</button>
          <button class="btn btn-primary">Generate SOAs</button>
        </div>
      </div>
      <div class="flex gap-3 mb-4">
        <input type="text" placeholder="Filter customer, invoice, owner…" class="bg-graphite-850 border border-white/10 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-convergint-accent/40" />
        <select class="bg-graphite-850 border border-white/10 rounded-lg px-3 py-2 text-sm"><option>All Status</option><option>Overdue</option><option>Promised</option><option>Open</option></select>
        <select class="bg-graphite-850 border border-white/10 rounded-lg px-3 py-2 text-sm"><option>All Entities</option>${AR_DATA.entities.map(e => `<option>${e}</option>`).join('')}</select>
      </div>
      <div class="table-wrap overflow-auto max-h-[calc(100vh-240px)]">
        <table class="data-table">
          <thead>
            <tr>
              <th class="frozen-col">Customer</th>
              <th>Entity</th><th>Invoice</th><th>Inv Date</th><th>Due Date</th><th>Currency</th>
              <th>Open Amount</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th>
              <th>Status</th><th>Owner</th><th>Next Action</th><th>SOA</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="frozen-col font-medium">${r.customer}</td>
                <td>${r.entity}</td>
                <td class="text-convergint-sky">${r.id}</td>
                <td>${r.invDate}</td>
                <td>${r.dueDate}</td>
                <td>${r.currency}</td>
                <td class="font-medium">${formatAED(r.open)}</td>
                <td>${r.b0 ? formatAED(r.b0) : '—'}</td>
                <td>${r.b31 ? formatAED(r.b31) : '—'}</td>
                <td>${r.b61 ? formatAED(r.b61) : '—'}</td>
                <td>${r.b90 ? formatAED(r.b90) : '—'}</td>
                <td><span class="status-pill status-${r.status.toLowerCase()}">${r.status}</span></td>
                <td>${r.owner}</td>
                <td>${r.next}</td>
                <td><button class="btn btn-ghost text-xs py-1 px-2">PDF</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderReconciliation() {
    $('#main-content').innerHTML = `
      <div class="mb-5">
        <h1 class="font-title text-2xl font-semibold">Bank Reconciliation</h1>
        <p class="text-sm text-gray-400 mt-1">Recommended matches with confidence scores • Full audit trail</p>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="glass-panel rounded-xl border border-white/8 overflow-hidden">
          <div class="px-5 py-3 border-b border-white/8 text-sm font-medium">Bank Transactions</div>
          <div class="divide-y divide-white/5">
            ${AR_DATA.bankTxns.map(t => `
              <div class="p-4 hover:bg-white/[0.03]">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">${t.id}</span>
                  <span>${formatAED(t.amount)}</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">${t.date} • ${t.ref}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="space-y-4">
          ${AR_DATA.bankTxns.map(t => `
            <div class="glass-panel rounded-xl border border-white/8 p-5">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="text-sm font-medium">Suggested: ${t.suggested}</div>
                  <div class="text-xs text-gray-400 mt-0.5">${t.reason}</div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-title font-semibold ${t.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'}">${t.confidence}%</div>
                  <div class="text-[10px] text-gray-500">confidence</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-4">
                <div>Amount variance: <span class="text-gray-200">${t.varianceAmt === 0 ? 'None' : formatAED(t.varianceAmt)}</span></div>
                <div>Date variance: <span class="text-gray-200">${t.varianceDays} day(s)</span></div>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-primary text-xs">Accept</button>
                <button class="btn btn-ghost text-xs">Split</button>
                <button class="btn btn-ghost text-xs">Exclude</button>
                <button class="btn btn-ghost text-xs text-red-400">Escalate</button>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function renderForecast() {
    const f = AR_DATA.forecast;
    $('#main-content').innerHTML = `
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="font-title text-2xl font-semibold">Cash Collection Forecast</h1>
          <p class="text-sm text-gray-400 mt-1">Base • Best-case • Downside • Audit trail on overrides</p>
        </div>
        <button class="btn btn-primary">Add override</button>
      </div>
      <div class="glass-panel rounded-xl border border-white/8 p-5 mb-6">
        <canvas id="forecastChart" height="120"></canvas>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="kpi-card p-5"><div class="text-xs text-gray-400">Base case (30d)</div><div class="font-title text-2xl font-semibold mt-1">${formatAED(6250000)}</div></div>
        <div class="kpi-card p-5"><div class="text-xs text-gray-400">Best case</div><div class="font-title text-2xl font-semibold mt-1 text-emerald-400">${formatAED(7800000)}</div></div>
        <div class="kpi-card p-5"><div class="text-xs text-gray-400">Downside</div><div class="font-title text-2xl font-semibold mt-1 text-amber-400">${formatAED(4800000)}</div></div>
      </div>
    `;
    new Chart($('#forecastChart'), {
      type: 'line',
      data: {
        labels: f.labels,
        datasets: [
          { label: 'Base', data: f.base, borderColor: '#5B7CFF', tension: 0.3, fill: false },
          { label: 'Best', data: f.best, borderColor: '#34D399', tension: 0.3, fill: false, borderDash: [4,4] },
          { label: 'Downside', data: f.down, borderColor: '#F59E0B', tension: 0.3, fill: false, borderDash: [4,4] }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: '#9CA3AF' } } },
        scales: {
          x: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  function renderAdmin() {
    $('#main-content').innerHTML = `
      <div class="mb-5">
        <h1 class="font-title text-2xl font-semibold">Administration</h1>
        <p class="text-sm text-gray-400 mt-1">Roles • Entity permissions • Approval workflows</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-panel rounded-xl border border-white/8 p-5">
          <h3 class="text-sm font-medium mb-4">Roles</h3>
          <div class="space-y-2 text-sm">
            ${['AR Analyst','AR Lead','Finance Manager','Admin','Read-only Auditor'].map(r => `
              <div class="flex items-center justify-between py-2 border-b border-white/5">
                <span>${r}</span>
                <button class="btn btn-ghost text-xs">Edit</button>
              </div>`).join('')}
          </div>
        </div>
        <div class="glass-panel rounded-xl border border-white/8 p-5">
          <h3 class="text-sm font-medium mb-4">Entity Permissions</h3>
          <p class="text-xs text-gray-400 mb-3">View • Export • Upload • Reconcile • Approve • User management</p>
          <div class="text-sm space-y-2">
            ${AR_DATA.entities.map(e => `
              <div class="flex items-center justify-between py-2 border-b border-white/5">
                <span>${e}</span>
                <span class="text-xs text-emerald-400">Configured</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderCustomer(name) {
    const c = AR_DATA.customers[name] || AR_DATA.customers['Emirates Tower Facilities LLC'];
    const displayName = name || 'Emirates Tower Facilities LLC';
    $('#main-content').innerHTML = `
      <div class="mb-5 flex items-center gap-3">
        <button class="btn btn-ghost text-xs" onclick="window.__nav('dashboard')">← Back</button>
        <div>
          <h1 class="font-title text-2xl font-semibold">${displayName}</h1>
          <p class="text-sm text-gray-400">Customer 360</p>
        </div>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${kpi('Exposure', formatAED(c.exposure), '')}
        ${kpi('DSO', c.dso + ' days', '')}
        ${kpi('Risk', c.risk, '')}
        ${kpi('Promise', 'Active', '')}
      </div>
      <div class="glass-panel rounded-xl border border-white/8 p-5 mb-6">
        <div class="text-sm text-gray-300 mb-1">Contact</div>
        <div class="text-sm">${c.contact}</div>
        <div class="text-sm text-gray-300 mt-4 mb-1">Payment Promise</div>
        <div class="text-sm">${c.promise}</div>
      </div>
      <div class="flex gap-2 mb-4">
        <button class="btn btn-primary text-xs">Generate SOA PDF</button>
        <button class="btn btn-ghost text-xs">Log activity</button>
      </div>
      <div class="glass-panel rounded-xl border border-white/8 p-5">
        <h3 class="text-sm font-medium mb-3">Recent Activity</h3>
        ${c.activity.map(a => `
          <div class="flex gap-4 py-2 border-b border-white/5 text-sm">
            <span class="text-gray-400 w-24">${a.date}</span>
            <span class="font-medium w-16">${a.type}</span>
            <span class="text-gray-300">${a.note}</span>
          </div>`).join('')}
      </div>
    `;
  }

  // Helpers exposed for onclick
  window.__nav = navigate;
  window.__navCustomer = (name) => navigate('customer', { id: name });

  // Initial
  // stay on login until submit
})();
