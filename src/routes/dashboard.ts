import { Hono } from 'hono'
import { html } from 'hono/html'
import { protect, getCurrentUser } from '../middleware/auth'
import { layout } from '../views/layout'
import { SKELETONS } from '../views/components'
import { round } from '../lib/utils'
import type { Bindings, Variables } from '../types'

const dash = new Hono<{ Bindings: Bindings, Variables: Variables }>()

dash.get('/', async (c) => {
  const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
  const actions = html`
    <div class="d-flex gap-2">
        <a href="/expenses" class="btn btn-danger" aria-label="Novo Gasto" data-bs-toggle="tooltip" title="Novo Gasto"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span class="d-none d-sm-inline ms-1">Gasto</span></a>
        <a href="/incomes" class="btn btn-success" aria-label="Nova Entrada" data-bs-toggle="tooltip" title="Nova Entrada"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span class="d-none d-sm-inline ms-1">Entrada</span></a>
        <a href="/challenges" class="btn btn-primary" aria-label="Novo Desafio" data-bs-toggle="tooltip" title="Novo Desafio"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg><span class="d-none d-sm-inline ms-1">Desafio</span></a>
    </div>
    <script>document.addEventListener("DOMContentLoaded", function() { var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')); tooltipTriggerList.map(function (el) { return new bootstrap.Tooltip(el); }); });</script>
  `;
  
  // Script principal do Dashboard (embutido para simplicidade)
  const dashboardScript = html`
    <script>
      async function deleteChallenge(id) { if(confirm('Excluir?')) { await fetch('/api/challenges/'+id, {method:'DELETE'}); setFlash('Desafio excluído'); await loadDashboard(); checkFlash(); } }
      async function loadDashboard() {
        try {
            const res = await fetch('/api/dashboard-data'); const data = await res.json();
            let standardSaved = 0, vrSaved = 0, metaSaved = 0, metaTotal = 0;
            data.challenges.forEach(c => { if(c.type === 'vr_savings') { vrSaved += c.total_saved; } else { standardSaved += c.total_saved; metaSaved += c.total_saved; metaTotal += c.total_value_expected; } });
            document.getElementById('stat-meta-val').innerHTML = \`\${money(metaSaved)} <div class="text-muted small d-inline fw-normal">/ \${money(metaTotal)}</div>\`; document.getElementById('stat-saved').innerText = money(standardSaved); document.getElementById('stat-vr-saved').innerText = money(vrSaved); document.getElementById('stat-expenses').innerText = money(data.total_expenses_month); document.getElementById('stat-income').innerText = money(data.total_incomes_month);
            if (data.challenges.length > 0) { document.getElementById('challenges-list').innerHTML = data.challenges.map(c => { const perc = Math.round((c.paid_count / c.total_payments) * 100) || 0; let currentDisplay = c.total_saved; let savedLabel = c.type === 'vr_savings' ? 'Economia' : 'Guardado'; let valueText = \`\${money(currentDisplay)} <span class="text-muted">/ \${money(c.total_value_expected)}</span>\`; return \`<div class="col-12 col-md-6 col-lg-4"><div class="card card-stacked border-0 shadow-sm" style="height: 100%"><div class="card-body"><div class="d-flex align-items-center mb-3"><div class="text-truncate" style="max-width: 80%;"><h3 class="card-title mb-0 text-truncate">\${c.title}</h3></div><div class="ms-auto"><div class="dropdown"><a href="#" class="btn-action" data-bs-toggle="dropdown"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/></svg></a><div class="dropdown-menu dropdown-menu-end"><a href="/challenge/\${c.id}" class="dropdown-item">Ver</a><a href="#" onclick="deleteChallenge('\${c.id}')" class="dropdown-item text-danger">Excluir</a></div></div></div></div><div class="progress mb-2"><div class="progress-bar bg-primary" style="width: \${perc}%"></div></div><div class="d-flex justify-content-between"><div class="small text-muted">\${c.paid_count}/\${c.total_payments} concluído</div><div class="small fw-bold">\${savedLabel}: \${valueText}</div></div></div></div></div>\`; }).join(''); } else { document.getElementById('challenges-list').innerHTML = \`<div class="col-12">\${getEmptyHTML('Nenhum desafio ativo', 'Comece um novo desafio para economizar.')}</div>\`; }
            if (data.expenses.length > 0) { document.getElementById('expenses-list').innerHTML = data.expenses.map(e => { const d = e.due_date.split('-'); return \`<tr><td><div>\${e.title}</div><div class="small text-muted">\${e.category}</div></td><td>\${d[2]}/\${d[1]}</td><td>\${e.installment_number}</td><td class="text-end text-red fw-bold">-\${money(e.amount)}</td></tr>\`; }).join(''); } else { document.getElementById('expenses-list').innerHTML = \`<tr><td colspan="4" class="p-0">\${getEmptyHTML('Sem gastos', 'Nenhum gasto este mês.')}</td></tr>\`; }
            document.getElementById('recent-list').innerHTML = data.recent.map(h => { const dateStrRaw = h.date || h.paid_at; const dt = parseDateLocal(dateStrRaw); const dateStr = dt.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}); let value = h.expected_value; let label = ''; let color = ''; let icon = ''; if (h.is_income) { label = 'Recebido'; color = 'text-teal'; icon = '<span class="bg-teal text-white avatar"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" /><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" /></svg></span>'; } else if (h.is_expense) { label = 'Gasto'; color = 'text-red'; icon = '<span class="bg-red text-white avatar"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg></span>'; } else { label = 'Guardado'; color = 'text-success'; icon = '<span class="bg-green text-white avatar"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10"/></svg></span>'; if(h.type === 'vr_savings') { value = h.expected_value - (h.amount_spent || 0); label = 'VR'; if(value < 0) color = 'text-danger'; else if (value === 0) color = 'text-muted'; else color = 'text-orange'; } } return \`<div class="list-group-item"><div class="row align-items-center"><div class="col-auto">\${icon}</div><div class="col text-truncate"><div class="text-reset d-block fw-bold \${color}">\${money(value)}</div><div class="small text-muted">\${label} em \${h.title}</div></div><div class="col-auto text-end"><div class="fw-bold">\${dateStr}</div></div></div></div>\`; }).join('');
            document.getElementById('chart-real').innerHTML = ''; document.getElementById('chart-real').classList.remove('placeholder-glow', 'd-flex', 'align-items-center', 'justify-content-center');
            new ApexCharts(document.getElementById('chart-real'), { chart: { type: 'area', height: 280, toolbar: {show: false}, background: 'transparent' }, series: [ { name: 'Entradas', data: data.chart.incomes }, { name: 'Gastos', data: data.chart.expenses }, { name: 'Guardado', data: data.chart.saved } ], xaxis: { categories: data.chart.labels }, colors: ['#0ca678', '#d63939', '#2fb344'], stroke: { curve: 'smooth', width: 3 }, fill: { opacity: 0.1 } }).render();
        } catch(e) { console.error(e); }
      }
      loadDashboard();
    </script>
  `;

  return c.html(layout('Dashboard', 'home', html`
    <div class="row row-cards mb-4">
        <div class="col-12 col-md-4 col-lg-3"><div class="card"><div class="card-body"><div class="row align-items-center"><div class="col-auto"><span class="bg-primary text-white avatar"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-target-arrow" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 7a5 5 0 1 0 5 5" /><path d="M13 3.055a9 9 0 1 0 7.941 7.945" /><path d="M15 6v3h3l3 -3h-3v-3z" /><path d="M15 9l-3 3" /></svg></span></div><div class="col"><div class="font-weight-medium text-primary" id="stat-meta-val">${SKELETONS.TEXT_MEDIUM}</div><div class="text-muted small">Meta (52 Sem + Aleatório)</div></div></div></div></div></div>
        <div class="col-6 col-md-4 col-lg-2"><div class="card"><div class="card-body"><div class="row align-items-center"><div class="col-auto"><span class="bg-green text-white avatar"><svg class="icon icon-tabler icon-tabler-moneybag-plus icons-tabler-outline"fill="none"height="24"stroke="currentColor"stroke-linecap="round"stroke-linejoin="round"stroke-width="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"fill="none"stroke="none"/><path d="M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5"/><path d="M12.5 21h-4.5a4 4 0 0 1 -4 -4v-1a8 8 0 0 1 14.935 -3.991"/><path d="M16 19h6"/><path d="M19 16v6"/></svg></span></div><div class="col"><div class="font-weight-medium text-success" id="stat-saved">${SKELETONS.TEXT_SMALL}</div><div class="text-muted small">Guardado</div></div></div></div></div></div>
        <div class="col-6 col-md-4 col-lg-2"><div class="card"><div class="card-body"><div class="row align-items-center"><div class="col-auto"><span class="bg-teal text-white avatar"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-wallet" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" /><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" /></svg></span></div><div class="col"><div class="font-weight-medium text-teal" id="stat-income">${SKELETONS.TEXT_SMALL}</div><div class="text-muted small">Entradas (Mês)</div></div></div></div></div></div>
        <div class="col-6 col-md-4 col-lg-2"><div class="card"><div class="card-body"><div class="row align-items-center"><div class="col-auto"><span class="bg-red text-white avatar"><svg class="icon icon-tabler icon-tabler-moneybag-minus icons-tabler-outline"fill="none"height="24"stroke="currentColor"stroke-linecap="round"stroke-linejoin="round"stroke-width="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"fill="none"stroke="none"/><path d="M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5"/><path d="M12.5 21h-4.5a4 4 0 0 1 -4 -4v-1a8 8 0 0 1 15.943 -.958"/><path d="M16 19h6"/></svg></span></div><div class="col"><div class="font-weight-medium text-red" id="stat-expenses">${SKELETONS.TEXT_SMALL}</div><div class="text-muted small">Gastos (Mês)</div></div></div></div></div></div>
        <div class="col-6 col-md-4 col-lg-3"><div class="card"><div class="card-body"><div class="row align-items-center"><div class="col-auto"><span class="bg-orange text-white avatar"><svg class="icon icon-tabler icon-tabler-burger icons-tabler-outline"fill="none"height="24"stroke="currentColor"stroke-linecap="round"stroke-linejoin="round"stroke-width="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><path d="M4 15h16a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"/><path d="M12 4c3.783 0 6.953 2.133 7.786 5h-15.572c.833 -2.867 4.003 -5 7.786 -5z"/><path d="M5 12h14"/></svg></span></div><div class="col"><div class="font-weight-medium text-orange" id="stat-vr-saved">${SKELETONS.TEXT_SMALL}</div><div class="text-muted small">Economia VR</div></div></div></div></div></div>
    </div>
    <div class="row row-cards mb-4" id="challenges-list">${SKELETONS.CARD}</div>
    <div class="row row-cards">
      <div class="col-lg-8"><div class="card shadow-sm mb-4"><div class="card-header d-flex justify-content-between"><h3 class="card-title">Evolução Financeira</h3></div><div class="card-body"><div id="chart-real" style="min-height: 280px;" class="placeholder-glow d-flex align-items-center justify-content-center"><div class="placeholder col-12" style="height: 250px"></div></div></div></div>
      <div class="card shadow-sm"><div class="card-header"><h3 class="card-title">Gastos Deste Mês</h3></div><div class="table-responsive"><table class="table table-vcenter card-table"><thead><tr><th>Gasto</th><th>Data</th><th>Parc.</th><th class="text-end">Valor</th></tr></thead><tbody id="expenses-list">${SKELETONS.TABLE_ROWS}</tbody></table></div></div></div>
      <div class="col-lg-4"><div class="card shadow-sm" style="min-height: 350px"><div class="card-header"><h3 class="card-title">Atividades Recentes</h3></div><div class="list-group list-group-flush list-group-hoverable" id="recent-list">${SKELETONS.LIST_ITEMS}</div></div></div>
    </div>
    ${dashboardScript}
  `, user, actions))
})

// --- API DATA (Com otimização Promise.all) ---
dash.get('/api/dashboard-data', protect, async (c) => {
    const p = c.get('user');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    const sevenDaysAgoDate = new Date(); sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 6);
    const chartStartDate = sevenDaysAgoDate.toISOString().split('T')[0];

    const [challengesRes, expensesRes, incomesRes, recentPaymentsRes, recentIncomesRes, recentExpensesRes, chartSavedRes, chartIncomesRes, chartExpensesRes] = await Promise.all([
        c.env.DB.prepare(`SELECT c.*, COUNT(p.id) as total_payments, COALESCE(SUM(p.is_paid), 0) as paid_count, ROUND(COALESCE(SUM(CASE WHEN p.is_paid=1 THEN (CASE WHEN c.type='vr_savings' THEN p.expected_value-p.amount_spent ELSE p.expected_value END) ELSE 0 END), 0), 2) as total_saved, ROUND(COALESCE(SUM(p.expected_value), 0), 2) as total_value_expected FROM challenges c LEFT JOIN payments p ON c.id = p.challenge_id WHERE c.user_id = ? GROUP BY c.id`).bind(p.id).all(),
        c.env.DB.prepare(`SELECT e.title, e.category, i.amount, i.due_date, i.installment_number FROM expense_items i JOIN expenses e ON i.expense_id = e.id WHERE e.user_id = ? AND i.due_date BETWEEN ? AND ? ORDER BY i.due_date ASC`).bind(p.id, firstDay, lastDay).all(),
        c.env.DB.prepare(`SELECT SUM(amount) as total FROM incomes WHERE user_id = ? AND date BETWEEN ? AND ?`).bind(p.id, firstDay, lastDay).first(),
        c.env.DB.prepare(`SELECT p.expected_value, p.amount_spent, c.title, c.type, p.paid_at as date, 0 as is_income, 0 as is_expense FROM payments p JOIN challenges c ON p.challenge_id = c.id WHERE c.user_id = ? AND p.is_paid = 1 ORDER BY p.paid_at DESC LIMIT 6`).bind(p.id).all(),
        c.env.DB.prepare(`SELECT amount as expected_value, 0 as amount_spent, title, 'income' as type, date, 1 as is_income, 0 as is_expense FROM incomes WHERE user_id = ? ORDER BY date DESC LIMIT 6`).bind(p.id).all(),
        c.env.DB.prepare(`SELECT total_amount as expected_value, 0 as amount_spent, title, category as type, purchase_date as date, 0 as is_income, 1 as is_expense FROM expenses WHERE user_id = ? ORDER BY purchase_date DESC LIMIT 6`).bind(p.id).all(),
        c.env.DB.prepare(`SELECT SUBSTR(p.paid_at, 1, 10) as day, SUM(p.expected_value) as t FROM payments p JOIN challenges c ON p.challenge_id=c.id WHERE c.user_id=? AND p.is_paid=1 AND c.type != 'vr_savings' AND day >= ? GROUP BY day`).bind(p.id, chartStartDate).all(),
        c.env.DB.prepare(`SELECT date as day, SUM(amount) as t FROM incomes WHERE user_id=? AND day >= ? GROUP BY day`).bind(p.id, chartStartDate).all(),
        c.env.DB.prepare(`SELECT i.due_date as day, SUM(i.amount) as t FROM expense_items i JOIN expenses e ON i.expense_id=e.id WHERE e.user_id=? AND day >= ? GROUP BY day`).bind(p.id, chartStartDate).all()
    ]);

    const challenges = challengesRes.results;
    const expenses = expensesRes.results;
    const total_target = challenges.reduce((acc, c:any) => acc + c.total_value_expected, 0);
    const total_expenses_month = expenses.reduce((acc, e:any) => acc + e.amount, 0);
    const total_incomes_month = (incomesRes as any)?.total || 0;
    
    const recent = [...recentPaymentsRes.results, ...recentIncomesRes.results, ...recentExpensesRes.results].sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
    const labels = [], savedData = [], incomeData = [], expenseData = [];
    const mapSaved = new Map(chartSavedRes.results.map((r:any) => [r.day, r.t]));
    const mapIncomes = new Map(chartIncomesRes.results.map((r:any) => [r.day, r.t]));
    const mapExpenses = new Map(chartExpensesRes.results.map((r:any) => [r.day, r.t]));

    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}));
        savedData.push(round(mapSaved.get(ds) as number || 0));
        incomeData.push(round(mapIncomes.get(ds) as number || 0));
        expenseData.push(round(mapExpenses.get(ds) as number || 0));
    }
    
    return c.json({ challenges, expenses, total_target: round(total_target), total_expenses_month: round(total_expenses_month), total_incomes_month: round(total_incomes_month), recent, chart: { labels, saved: savedData, incomes: incomeData, expenses: expenseData } });
});

export default dash