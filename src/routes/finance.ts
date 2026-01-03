import { Hono } from 'hono'
import { html } from 'hono/html'
import { protect, getCurrentUser } from '../middleware/auth'
import { layout } from '../views/layout'
import { SKELETONS } from '../views/components'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// --- ENTRADAS (INCOMES) ---
app.get('/incomes', async (c) => {
    const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
    const actions = html`<button class="btn btn-success w-100 w-sm-auto shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-income">Nova Entrada</button>`;
    
    return c.html(layout('Minhas Entradas', 'incomes', html`
      <div class="row row-cards"><div class="col-12"><div class="card shadow-sm"><div class="table-responsive"><table class="table table-vcenter card-table"><thead><tr><th>Descrição</th><th>Data</th><th>Categoria</th><th class="text-end">Valor</th><th>Ações</th></tr></thead><tbody id="incomes-table">${SKELETONS.TABLE_ROWS}</tbody></table></div></div></div></div>
      <div class="modal modal-blur fade" id="modal-income" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down"><form class="modal-content" id="form-income"><div class="modal-header bg-success-lt"><h5 class="modal-title text-success">Registrar Entrada</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="mb-3"><label class="form-label">Descrição</label><input type="text" id="iTitle" class="form-control" required placeholder="Ex: Salário, Freelance..."></div><div class="row"><div class="col-6 mb-3"><label class="form-label">Valor</label><input type="number" step="0.01" id="iAmount" class="form-control" required></div><div class="col-6 mb-3"><label class="form-label">Data Recebimento</label><input type="date" id="iDate" class="form-control" required></div></div><div class="mb-3"><label class="form-label">Categoria</label><select id="iCat" class="form-select"><option>Salário</option><option>Freelance</option><option>Investimento</option><option>Venda</option><option>Presente</option><option>Outros</option></select></div></div><div class="modal-footer"><button type="submit" id="btnSaveIncome" class="btn btn-success w-100 shadow-sm">Salvar Entrada</button></div></form></div></div>
      <script>
        async function loadIncomes() { try { const res = await fetch('/api/incomes-list'); const data = await res.json(); if (data.length > 0) { document.getElementById('incomes-table').innerHTML = data.map(i => { const d = i.date.split('-'); return \`<tr><td><div class="fw-bold">\${i.title}</div></td><td>\${d[2]}/\${d[1]}/\${d[0]}</td><td><span class="badge bg-green-lt">\${i.category}</span></td><td class="text-end text-success fw-bold">+\${money(i.amount)}</td><td class="w-1"><button class="btn btn-ghost-danger btn-icon" onclick="deleteIncome('\${i.id}')"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg></button></td></tr>\`; }).join(''); } else { document.getElementById('incomes-table').innerHTML = \`<tr><td colspan="5">\${getEmptyHTML('Sem entradas', 'Nenhuma entrada registrada ainda.')}</td></tr>\`; } } catch(e) { console.error(e); } }
        async function deleteIncome(id) { if(confirm('Apagar esta entrada?')) { await fetch('/api/incomes/'+id, {method:'DELETE'}); setFlash('Entrada apagada com sucesso'); await loadIncomes(); checkFlash(); } }
        document.getElementById('form-income').onsubmit = async (e) => { e.preventDefault(); const btn = document.getElementById('btnSaveIncome'); setBtnLoading(btn); await fetch('/api/incomes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title: document.getElementById('iTitle').value, amount: document.getElementById('iAmount').value, date: document.getElementById('iDate').value, category: document.getElementById('iCat').value })}); bootstrap.Modal.getInstance(document.getElementById('modal-income')).hide(); setFlash('Entrada registrada!'); await loadIncomes(); resetBtnLoading(btn); checkFlash(); };
        document.getElementById('iDate').valueAsDate = new Date(); loadIncomes();
      </script>
    `, user, actions))
})

// --- GASTOS (EXPENSES) ---
app.get('/expenses', async (c) => {
    const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
    const actions = html`<button class="btn btn-danger w-100 w-sm-auto shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-expense">Novo Gasto</button>`;
    
    return c.html(layout('Meus Gastos', 'expenses', html`
      <div class="card shadow-sm"><div class="table-responsive"><table class="table table-vcenter card-table"><thead><tr><th>Descrição</th><th>Data</th><th>Categoria</th><th class="text-end">Valor Total</th><th>Ações</th></tr></thead><tbody id="expenses-table">${SKELETONS.TABLE_ROWS}</tbody></table></div></div>
      <div class="modal modal-blur fade" id="modal-expense" tabindex="-1"><div class="modal-dialog modal-lg modal-fullscreen-md-down"><form class="modal-content" id="form-expense"><div class="modal-header bg-danger-lt"><h5 class="modal-title text-danger">Registrar Gasto</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="mb-3"><label class="form-label">Descrição</label><input type="text" id="eTitle" class="form-control" required></div><div class="row"><div class="col-6 mb-3"><label class="form-label">Valor Total</label><input type="number" step="0.01" id="eAmount" class="form-control" required></div><div class="col-6 mb-3"><label class="form-label">Data Compra</label><input type="date" id="eDate" class="form-control" required></div></div><div class="row"><div class="col-6 mb-3"><label class="form-label">Categoria</label><select id="eCat" class="form-select"><option>Alimentação</option><option>Transporte</option><option>Lazer</option><option>Contas</option><option>Saúde</option><option>Outros</option></select></div><div class="col-6 mb-3"><label class="form-label">Pagamento</label><select id="eMethod" class="form-select"><option>Crédito</option><option>Débito</option><option>Pix</option><option>Dinheiro</option></select></div></div><div class="mb-3"><label class="form-label">Parcelas</label><input type="number" id="eInstallments" class="form-control" value="1" min="1" max="48"></div></div><div class="modal-footer"><button type="submit" id="btnSaveExpense" class="btn btn-danger w-100 shadow-sm">Confirmar</button></div></form></div></div>
      <div class="modal modal-blur fade" id="modal-edit-expense" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down"><form class="modal-content" id="form-edit-expense"><input type="hidden" id="editId"><div class="modal-header"><h5 class="modal-title">Editar Gasto</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="mb-3"><label class="form-label">Título</label><input type="text" id="editTitle" class="form-control" required></div><div class="mb-3"><label class="form-label">Categoria</label><select id="editCat" class="form-select"><option>Alimentação</option><option>Transporte</option><option>Lazer</option><option>Contas</option><option>Saúde</option><option>Outros</option></select></div><div class="mb-3"><label class="form-label">Pagamento</label><select id="editMethod" class="form-select"><option>Crédito</option><option>Débito</option><option>Pix</option><option>Dinheiro</option></select></div></div><div class="modal-footer"><button type="submit" id="btnUpdateExpense" class="btn btn-primary w-100">Salvar Alterações</button></div></form></div></div>
      <script>
        async function loadExpenses() { try { const res = await fetch('/api/expenses-list'); const data = await res.json(); if (data.length > 0) { document.getElementById('expenses-table').innerHTML = data.map(e => { const d = e.purchase_date.split('-'); return \`<tr><td><div class="fw-bold">\${e.title}</div><div class="small text-muted">\${e.installments_count > 1 ? e.installments_count + 'x parcelas' : 'À vista'}</div></td><td>\${d[2]}/\${d[1]}</td><td><span class="badge bg-red-lt">\${e.category}</span></td><td class="text-end text-red fw-bold">-\${money(e.total_amount)}</td><td class="w-1"><div class="btn-list flex-nowrap"><button class="btn btn-ghost-primary btn-icon" onclick="openEdit('\${e.id}', '\${e.title}', '\${e.category}', '\${e.payment_method}')"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg></button><button class="btn btn-ghost-danger btn-icon" onclick="deleteExpense('\${e.id}')"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg></button></div></td></tr>\`; }).join(''); } else { document.getElementById('expenses-table').innerHTML = \`<tr><td colspan="5">\${getEmptyHTML('Sem gastos', 'Nenhum gasto registrado.')}</td></tr>\`; } } catch(e) { console.error(e); } }
        function openEdit(id, title, cat, method) { document.getElementById('editId').value = id; document.getElementById('editTitle').value = title; document.getElementById('editCat').value = cat; document.getElementById('editMethod').value = method; new bootstrap.Modal(document.getElementById('modal-edit-expense')).show(); }
        async function deleteExpense(id) { if(confirm('Isso apagará todas as parcelas deste gasto. Confirmar?')) { await fetch('/api/expenses/'+id, {method:'DELETE'}); setFlash('Gasto excluído com sucesso'); await loadExpenses(); checkFlash(); } }
        document.getElementById('form-expense').onsubmit = async (e) => { e.preventDefault(); const btn = document.getElementById('btnSaveExpense'); setBtnLoading(btn); await fetch('/api/expenses', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title: document.getElementById('eTitle').value, amount: document.getElementById('eAmount').value, date: document.getElementById('eDate').value, category: document.getElementById('eCat').value, method: document.getElementById('eMethod').value, installments: document.getElementById('eInstallments').value })}); bootstrap.Modal.getInstance(document.getElementById('modal-expense')).hide(); setFlash('Gasto registrado!'); await loadExpenses(); resetBtnLoading(btn); checkFlash(); };
        document.getElementById('form-edit-expense').onsubmit = async (e) => { e.preventDefault(); const btn = document.getElementById('btnUpdateExpense'); setBtnLoading(btn); await fetch('/api/expenses/'+document.getElementById('editId').value, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title: document.getElementById('editTitle').value, category: document.getElementById('editCat').value, method: document.getElementById('editMethod').value })}); bootstrap.Modal.getInstance(document.getElementById('modal-edit-expense')).hide(); setFlash('Gasto atualizado!'); await loadExpenses(); resetBtnLoading(btn); checkFlash(); };
        document.querySelectorAll('input[type="date"]').forEach(i => i.valueAsDate = new Date()); loadExpenses();
      </script>
    `, user, actions))
})

// --- RELATÓRIOS ---
app.get('/report', async (c) => {
    const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
    return c.html(layout('Relatório Financeiro', 'report', html`
      <div class="card shadow-sm mb-4"><div class="card-body"><div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label">Data Início</label><input type="date" id="rStart" class="form-control"></div><div class="col-md-4"><label class="form-label">Data Fim</label><input type="date" id="rEnd" class="form-control"></div><div class="col-md-4"><button class="btn btn-primary w-100" onclick="loadReport()">Filtrar</button></div></div></div></div>
      <div class="row row-cards">
          <div class="col-6 col-md-3"><div class="card bg-teal text-white"><div class="card-body"><div class="h1 mb-0" id="rep-income">R$ 0</div><div>Total Recebido</div></div></div></div>
          <div class="col-6 col-md-3"><div class="card bg-green text-white"><div class="card-body"><div class="h1 mb-0" id="rep-saved">R$ 0</div><div>Total Guardado</div></div></div></div>
          <div class="col-6 col-md-3"><div class="card bg-red text-white"><div class="card-body"><div class="h1 mb-0" id="rep-spent">R$ 0</div><div>Total Gasto</div></div></div></div>
          <div class="col-6 col-md-3"><div class="card"><div class="card-body"><div class="h1 mb-0 text-azure" id="rep-balance">R$ 0</div><div>Balanço (Ent. - Gastos)</div></div></div></div>
      </div>
      <div class="card shadow-sm mt-4"><div class="card-header"><h3 class="card-title">Gastos por Categoria</h3></div><div class="card-body"><div id="chart-pie" style="min-height: 350px;"></div></div></div>
      <script>
          let pieChart = null;
          async function loadReport() { try { const start = document.getElementById('rStart').value; const end = document.getElementById('rEnd').value; const res = await fetch(\`/api/report-data?start=\${start}&end=\${end}\`); const data = await res.json(); document.getElementById('rep-saved').innerText = money(data.saved); document.getElementById('rep-spent').innerText = money(data.spent); document.getElementById('rep-income').innerText = money(data.income); const balance = data.income - data.spent; document.getElementById('rep-balance').innerText = money(balance); if (pieChart) pieChart.destroy(); if (Object.keys(data.categories).length > 0) { pieChart = new ApexCharts(document.getElementById('chart-pie'), { series: Object.values(data.categories), labels: Object.keys(data.categories), chart: { type: 'pie', height: 350 }, colors: ['#206bc4', '#d63939', '#f59f00', '#2fb344', '#4263eb', '#182433'] }); pieChart.render(); } else { document.getElementById('chart-pie').innerHTML = \`\${getEmptyHTML('Sem dados no período', 'Tente alterar o filtro de datas.')}\`; } } catch(e) { console.error(e); } }
          const d = new Date(); document.getElementById('rEnd').valueAsDate = d; d.setDate(1); document.getElementById('rStart').valueAsDate = d; loadReport();
      </script>
    `, user))
})

// --- API ROUTES FOR FINANCE ---
app.post('/api/incomes', protect, async (c) => {
    const p = c.get('user');
    const { title, amount, date, category } = await c.req.json();
    const uuid = crypto.randomUUID();
    await c.env.DB.prepare("INSERT INTO incomes (id, user_id, title, amount, date, category) VALUES (?,?,?,?,?,?)").bind(uuid, p.id, title, amount, date, category).run();
    return c.json({ ok: true });
});

app.get('/api/incomes-list', protect, async (c) => {
    const p = c.get('user');
    const { results } = await c.env.DB.prepare("SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC").bind(p.id).all();
    return c.json(results);
});

app.delete('/api/incomes/:id', protect, async (c) => {
    const p = c.get('user');
    await c.env.DB.prepare("DELETE FROM incomes WHERE id = ? AND user_id = ?").bind(c.req.param('id'), p.id).run();
    return c.json({ ok: true });
});

app.post('/api/expenses', protect, async (c) => {
    const p = c.get('user');
    const { title, amount, date, category, method, installments } = await c.req.json();
    const expUuid = crypto.randomUUID();
    await c.env.DB.prepare("INSERT INTO expenses (id, user_id, title, category, payment_method, total_amount, installments_count, purchase_date) VALUES (?,?,?,?,?,?,?,?)").bind(expUuid, p.id, title, category, method, amount, installments, date).run();
    const batch = []; const instVal = Number(amount) / Number(installments); let curr = new Date(date);
    for(let i = 1; i <= installments; i++) {
        batch.push(c.env.DB.prepare("INSERT INTO expense_items (expense_id, installment_number, amount, due_date) VALUES (?,?,?,?)").bind(expUuid, i, instVal, curr.toISOString().split('T')[0]));
        curr.setMonth(curr.getMonth() + 1);
    }
    await c.env.DB.batch(batch); return c.json({ ok: true });
});

app.put('/api/expenses/:id', protect, async (c) => {
    const p = c.get('user');
    const { title, category, method } = await c.req.json();
    await c.env.DB.prepare("UPDATE expenses SET title = ?, category = ?, payment_method = ? WHERE id = ? AND user_id = ?").bind(title, category, method, c.req.param('id'), p.id).run();
    return c.json({ ok: true });
});

app.delete('/api/expenses/:id', protect, async (c) => {
    const p = c.get('user');
    await c.env.DB.batch([ c.env.DB.prepare("DELETE FROM expense_items WHERE expense_id = ?").bind(c.req.param('id')), c.env.DB.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").bind(c.req.param('id'), p.id) ]);
    return c.json({ ok: true });
});

app.get('/api/expenses-list', protect, async (c) => {
    const p = c.get('user');
    const { results } = await c.env.DB.prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY purchase_date DESC").bind(p.id).all();
    return c.json(results);
});

app.get('/api/report-data', protect, async (c) => {
    const p = c.get('user');
    const start = c.req.query('start'); const end = c.req.query('end');
    const savedRes = await c.env.DB.prepare(`SELECT SUM(p.expected_value) as t FROM payments p JOIN challenges c ON p.challenge_id = c.id WHERE c.user_id = ? AND p.is_paid = 1 AND p.paid_at BETWEEN ? AND ? AND c.type != 'vr_savings'`).bind(p.id, start + 'T00:00:00', end + 'T23:59:59').first<{t:number}>();
    const spentRes = await c.env.DB.prepare(`SELECT SUM(i.amount) as t FROM expense_items i JOIN expenses e ON i.expense_id=e.id WHERE e.user_id=? AND i.due_date BETWEEN ? AND ?`).bind(p.id, start, end).first<{t:number}>();
    const incomeRes = await c.env.DB.prepare(`SELECT SUM(amount) as t FROM incomes WHERE user_id=? AND date BETWEEN ? AND ?`).bind(p.id, start, end).first<{t:number}>();
    const { results: cats } = await c.env.DB.prepare(`SELECT e.category, SUM(i.amount) as total FROM expense_items i JOIN expenses e ON i.expense_id=e.id WHERE e.user_id=? AND i.due_date BETWEEN ? AND ? GROUP BY e.category`).bind(p.id, start, end).all();
    const categories: any = {}; cats.forEach((c:any) => categories[c.category] = c.total);
    return c.json({ saved: savedRes?.t || 0, spent: spentRes?.t || 0, income: incomeRes?.t || 0, categories });
});

export default app