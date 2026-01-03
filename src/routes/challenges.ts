import { Hono } from 'hono'
import { html } from 'hono/html'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { protect, getCurrentUser } from '../middleware/auth'
import { layout } from '../views/layout'
import { SKELETONS } from '../views/components'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// --- LISTAGEM DE DESAFIOS ---
app.get('/challenges', async (c) => {
  const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
  const actions = html`<button class="btn btn-primary w-100 w-sm-auto shadow-sm" data-bs-toggle="modal" data-bs-target="#modal-challenge">Novo Desafio</button>`;
  
  return c.html(layout('Meus Desafios', 'challenges', html`
    <div class="row row-cards" id="all-challenges">${SKELETONS.CARD}</div>
    
    <div class="modal modal-blur fade" id="modal-challenge" tabindex="-1"><div class="modal-dialog modal-lg modal-fullscreen-md-down"><form class="modal-content" id="form-create"><div class="modal-header"><h5 class="modal-title">Novo Desafio</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="mb-3"><label class="form-label">Título</label><input type="text" id="cTitle" class="form-control" required></div><div class="mb-3"><label class="form-label">Tipo</label><select class="form-select" id="type-select"><option value="52_weeks">52 Semanas</option><option value="random_deposits">Aleatório</option><option value="vr_savings">Economia VR</option></select></div><div id="section-52"><div class="row"><div class="col-6"><label class="form-label">R$ Inicial</label><input type="number" id="cInitial" class="form-control" value="1"></div><div class="col-6"><label class="form-label">Início</label><input type="date" id="cDate" class="form-control"></div></div></div><div id="section-random" style="display:none"><div class="mb-3"><label class="form-label">Parcelas (Max 200)</label><input type="number" id="cCount" class="form-control" value="10" max="200"></div><div class="d-flex flex-wrap gap-2">${[2, 5, 10, 20, 50, 100, 200].map(v => html`<label class="form-check-inline"><input type="checkbox" name="bills" value="${v}" checked> R$ ${v}</label>`)}</div></div><div id="section-vr" style="display:none"><div class="row"><div class="col-12 mb-3"><label class="form-label">Valor Diário (VR)</label><input type="number" id="vrValue" class="form-control" placeholder="Ex: 35.00"></div><div class="col-6"><label class="form-label">Início</label><input type="date" id="vrStart" class="form-control"></div><div class="col-6"><label class="form-label">Fim</label><input type="date" id="vrEnd" class="form-control"></div></div></div></div><div class="modal-footer"><button type="submit" id="btnCreateChallenge" class="btn btn-primary w-100 shadow-sm">Criar</button></div></form></div></div>
    
    <script>
      async function deleteChallenge(id) { if(confirm('Excluir?')) { await fetch('/api/challenges/'+id, {method:'DELETE'}); setFlash('Desafio excluído'); await loadChallenges(); checkFlash(); } }
      async function loadChallenges() {
        try {
            const res = await fetch('/api/challenges'); const data = await res.json();
            if (data.length > 0) {
              document.getElementById('all-challenges').innerHTML = data.map(c => { const perc = Math.round((c.paid_count / c.total_payments) * 100) || 0; let currentDisplay = c.total_saved; let savedLabel = c.type === 'vr_savings' ? 'Economia' : 'Guardado'; let valueText = \`\${money(currentDisplay)} <span class="text-muted">/ \${money(c.total_value_expected)}</span>\`;
                return \`<div class="col-12 col-md-6 col-lg-4"><div class="card card-stacked border-0 shadow-sm" style="height: 100%"><div class="card-body"><div class="d-flex align-items-center mb-3"><div class="text-truncate" style="max-width: 80%;"><h3 class="card-title mb-0 text-truncate">\${c.title}</h3></div><div class="ms-auto"><div class="dropdown"><a href="#" class="btn-action" data-bs-toggle="dropdown"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/></svg></a><div class="dropdown-menu dropdown-menu-end"><a href="/challenge/\${c.id}" class="dropdown-item">Ver</a><a href="#" onclick="deleteChallenge('\${c.id}')" class="dropdown-item text-danger">Excluir</a></div></div></div></div><div class="progress mb-2"><div class="progress-bar bg-primary" style="width: \${perc}%"></div></div><div class="d-flex justify-content-between"><div class="small text-muted">\${c.paid_count}/\${c.total_payments} concluído</div><div class="small fw-bold">\${savedLabel}: \${valueText}</div></div></div></div></div>\`;
              }).join('');
            } else { document.getElementById('all-challenges').innerHTML = \`<div class="col-12">\${getEmptyHTML('Nenhum desafio encontrado', 'Crie um novo desafio para começar.')}</div>\`; }
        } catch(e) { console.error(e); }
      }
      document.getElementById('type-select').onchange = (e) => { ['section-52','section-random','section-vr'].forEach(id => document.getElementById(id).style.display = 'none'); if(e.target.value === '52_weeks') document.getElementById('section-52').style.display = 'block'; if(e.target.value === 'random_deposits') document.getElementById('section-random').style.display = 'block'; if(e.target.value === 'vr_savings') document.getElementById('section-vr').style.display = 'block'; };
      document.getElementById('form-create').onsubmit = async (e) => { e.preventDefault(); const btn = document.getElementById('btnCreateChallenge'); setBtnLoading(btn); const res = await fetch('/api/challenges', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title: document.getElementById('cTitle').value, type: document.getElementById('type-select').value, initial_value: document.getElementById('cInitial').value, start_date: document.getElementById('cDate').value, count: document.getElementById('cCount').value, selected_bills: Array.from(document.querySelectorAll('input[name="bills"]:checked')).map(n => Number(n.value)), vr_value: document.getElementById('vrValue').value, vr_start: document.getElementById('vrStart').value, vr_end: document.getElementById('vrEnd').value })}); const data = await res.json(); setFlash('Desafio criado com sucesso!'); location.href = '/challenge/' + data.id; };
      document.querySelectorAll('input[type="date"]').forEach(i => i.valueAsDate = new Date()); loadChallenges();
    </script>
  `, user, actions))
})

// --- DETALHE DO DESAFIO (COM CALENDÁRIO E PIX) ---
app.get('/challenge/:id', async (c) => {
  const token = getCookie(c, 'auth_token'); if (!token) return c.redirect('/login-page');
  let payload; try { payload = await verify(token, c.env.JWT_SECRET); } catch { return c.redirect('/logout'); }
  const user = await c.env.DB.prepare("SELECT name, pix_key FROM users WHERE id = ?").bind(payload.id).first();
  if (!user) return c.redirect('/logout');

  const calendarUrl = `/challenge/${c.req.param('id')}/calendar?t=${token}`;

  const actions = html`
    <div class="d-flex gap-2">
      <a href="/" class="btn btn-outline-secondary w-100 w-sm-auto"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg> Voltar</a>
      <div class="dropdown">
        <a href="#" class="btn btn-outline-primary w-100 w-sm-auto dropdown-toggle" data-bs-toggle="dropdown"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-calendar-plus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 21h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M16 19h6" /><path d="M19 16v6" /></svg> Agenda</a>
        <div class="dropdown-menu dropdown-menu-end">
            <a href="${calendarUrl}" class="dropdown-item">Baixar Arquivo (.ics)</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item-text text-muted small" style="max-width: 200px;">Para sincronizar, copie o link abaixo e use "Assinar URL" no seu calendário:</div>
            <div class="d-flex px-3 pb-2"><input type="text" class="form-control form-control-sm" value="${new URL(c.req.url).origin}${calendarUrl}" readonly onclick="this.select()"></div>
        </div>
      </div>
    </div>
  `;
  
  return c.html(layout('Detalhes', 'challenges', html`
    <div id="initial-skeleton">${SKELETONS.CHALLENGE_DETAIL}</div>

    <div id="real-content" style="display: none;">
        <div id="view-calendar-mode" style="display:none;"><div class="row"><div class="col-lg-8 mb-3 order-1 order-lg-1"><div class="card shadow-sm border-0"><div class="card-body p-2"><div id="calendar"></div></div></div></div><div class="col-lg-4 order-2 order-lg-2"><div class="card shadow-sm border-0" style="max-height: 800px; display: flex; flex-direction: column;"><div class="card-header"><h3 class="card-title">Próximos Pagamentos</h3></div><div class="list-group list-group-flush list-group-hoverable" id="payments-list" style="overflow-y: auto;"></div></div></div></div></div>
        <div id="view-random" style="display:none;"><div id="random-grid"></div></div>
    </div>

    <div class="modal modal-blur fade" id="modal-pay-pix" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Realizar Pagamento</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body text-center">
        <div class="text-muted mb-3">Transfira para sua conta antes de confirmar!</div>
        <div class="h2" id="pix-value-display">R$ 0,00</div>
        <textarea id="pix-copypaste" class="form-control mb-3" rows="4" readonly onclick="this.select()"></textarea>
        <button class="btn btn-outline-primary w-100 mb-2" onclick="copyPix()"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg> Copiar Código</button>
        <button class="btn btn-success w-100" id="btn-confirm-pay">Confirmar Depósito</button>
      </div>
    </div></div></div>

    <script>
      let curCal = null; let currentType = ''; let userPixKey = "${user.pix_key || ''}";
      
      function crc16(str) { let crc = 0xFFFF; for (let c = 0; c < str.length; c++) { crc ^= str.charCodeAt(c) << 8; for (let i = 0; i < 8; i++) { if (crc & 0x8000) crc = (crc << 1) ^ 0x1021; else crc = crc << 1; } } let hex = (crc & 0xFFFF).toString(16).toUpperCase(); return hex.length === 3 ? "0" + hex : hex; }
      function generatePix(key, amount, name, city, description) { const descStr = (description || 'ECONOMIZZE').substring(0, 20).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, ""); const lenDesc = descStr.length; const field62 = "62" + (lenDesc + 4).toString().padStart(2, '0') + "05" + lenDesc.toString().padStart(2, '0') + descStr; const merchant = \`0014br.gov.bcb.pix01\${key.length < 10 ? '0'+key.length : key.length}\${key}\`; const amountStr = amount.toFixed(2); const nameStr = name.substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const cityStr = city.substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); let payload = "00020126" + (merchant.length < 10 ? '0'+merchant.length : merchant.length) + merchant + "52040000530398654" + (amountStr.length < 10 ? '0'+amountStr.length : amountStr.length) + amountStr + "5802BR59" + (nameStr.length < 10 ? '0'+nameStr.length : nameStr.length) + nameStr + "60" + (cityStr.length < 10 ? '0'+cityStr.length : cityStr.length) + cityStr + field62 + "6304"; return payload + crc16(payload); }
      function copyPix() { const copyText = document.getElementById("pix-copypaste"); copyText.select(); copyText.setSelectionRange(0, 99999); navigator.clipboard.writeText(copyText.value); showToast('Código PIX copiado!'); }

      async function loadItems() {
        try {
            const res = await fetch('/api/challenge/${c.req.param('id')}');
            if (!res.ok) { showToast('Erro', 'error'); setTimeout(() => location.href = '/', 1000); return; }
            const { challenge, payments } = await res.json();
            currentType = challenge.type;
            document.querySelector('.page-title').innerText = challenge.title;
            window.challengeTitle = challenge.title;
            document.getElementById('initial-skeleton').style.display = 'none';
            document.getElementById('real-content').style.display = 'block';
            if (challenge.type === '52_weeks' || challenge.type === 'vr_savings') { renderList(payments); try { renderCal(payments); } catch(e) { console.error('Erro calendario', e); } } else { renderBox(payments); }
        } catch(e) { console.error(e); }
      }
      
      function renderCal(payments) {
        const el = document.getElementById('calendar'); if(!el) return;
        document.getElementById('view-calendar-mode').style.display = 'block';
        if (curCal) curCal.destroy();
        const isMobile = window.innerWidth < 768; const today = new Date().toISOString().split('T')[0];
        if(typeof FullCalendar === 'undefined') { console.error('FullCalendar not loaded'); return; }
        
        curCal = new FullCalendar.Calendar(el, {
          initialView: 'multiMonthYear', locale: 'pt-br', headerToolbar: { left: '', center: 'title', right: '' }, multiMonthMaxColumns: isMobile ? 1 : 2, weekends: currentType !== 'vr_savings',
          events: payments.map(p => {
             let color = '#206bc4'; let title = money(p.expected_value);
             if (currentType === 'vr_savings') { if (p.is_paid) { const saved = p.expected_value - (p.amount_spent || 0); if(saved > 0) color = '#2fb344'; else if(saved < 0) color = '#d63939'; else color = '#f59f00'; title = money(saved); } } 
             else { if (p.is_paid) color = '#2fb344'; else if (p.due_date && p.due_date < today) color = '#d63939'; }
             return { id: p.id, title: title, start: p.due_date, backgroundColor: color, borderColor: 'transparent', extendedProps: { paid: p.is_paid, spent: p.amount_spent, expected: p.expected_value } };
          }),
          eventClick: async (info) => { await handlePayInteraction(info.event.id, info.event.extendedProps); }
        });
        curCal.render();
      }

      function renderList(payments) {
        document.getElementById('view-calendar-mode').style.display = 'block'; 
        const listEl = document.getElementById('payments-list');
        const sorted = payments.sort((a, b) => { if (a.is_paid === b.is_paid) return new Date(a.due_date) - new Date(b.due_date); return a.is_paid ? 1 : -1; });
        const today = new Date().toISOString().split('T')[0];
        
        listEl.innerHTML = sorted.map(p => {
          let icon = '<span class="status-dot status-dot-animated bg-azure"></span>'; let actionBtn = ''; let valueDisplay = money(p.expected_value); let subText = '';
          const pDate = p.due_date || '2024-01-01'; const dt = parseDateLocal(pDate); const isLate = !p.is_paid && dt < new Date(); 
          if (currentType === 'vr_savings') {
              if (p.is_paid) { const saved = p.expected_value - p.amount_spent; valueDisplay = money(saved); icon = saved >= 0 ? '<svg xmlns="http://www.w3.org/2000/svg" class="icon text-success" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" class="icon text-danger" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4" /><path d="M12 16v.01" /></svg>'; subText = saved >= 0 ? 'Economia' : 'Prejuízo'; actionBtn = \`<button class="btn btn-outline-secondary" onclick="handlePayInteraction('\${p.id}', {paid:true, expected:\${p.expected_value}})">Editar</button>\`; } 
              else { subText = 'Meta Diária'; actionBtn = \`<button class="btn btn-primary" onclick="handlePayInteraction('\${p.id}', {paid:false, expected:\${p.expected_value}})">Registrar</button>\`; }
          } else {
              if(p.is_paid) icon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon text-success" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10"/></svg>'; else if(isLate) icon = '<span class="status-dot bg-danger"></span>';
              actionBtn = p.is_paid ? \`<button class="btn btn-outline-secondary" onclick="handlePayInteraction('\${p.id}', {paid:true, expected:\${p.expected_value}})">Desfazer</button>\` : \`<button class="btn btn-primary" onclick="handlePayInteraction('\${p.id}', {paid:false, expected:\${p.expected_value}})">Pagar</button>\`;
              subText = isLate ? '<span class="text-danger">Atrasado</span>' : '';
          }
          const d = pDate.split('-');
          return \`<div class="list-group-item"><div class="row align-items-center"><div class="col-auto">\${icon}</div><div class="col text-truncate"><div class="text-reset d-block fw-bold">\${valueDisplay}</div><div class="text-muted text-truncate mt-n1">\${d[2]}/\${d[1]} <span class="ms-2">\${subText}</span></div></div><div class="col-auto">\${actionBtn}</div></div></div>\`;
        }).join('');
      }
      function renderBox(payments) {
        document.getElementById('view-random').style.display = 'block'; document.getElementById('random-grid').className = 'grid-bingo';
        document.getElementById('random-grid').innerHTML = payments.map(p => \`<div class="payment-box shadow-sm \${p.is_paid ? 'paid' : ''}" onclick="handlePayInteraction('\${p.id}', {paid:\${p.is_paid}, expected:\${p.expected_value}})"><div class="small text-muted" style="font-size: 0.75rem; margin-bottom: -2px">DEPÓSITO</div><div class="h3 mb-0">\${money(p.expected_value)}</div></div>\`).join('');
      }

      async function handlePayInteraction(id, props) {
          if (currentType === 'vr_savings') {
              const spent = prompt("Quanto você gastou hoje?", props.spent || "0"); if (spent === null) return;
              await fetch('/api/payments/' + id, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount_spent: parseFloat(spent.replace(',', '.')) || 0, is_paid: 1 }) });
              setFlash('Registrado!'); await loadItems(); checkFlash(); return;
          } 
          if (!props.paid) {
              if(!userPixKey) { showToast('Você precisa cadastrar uma Chave PIX no seu perfil!', 'error'); setTimeout(() => location.href = '/profile', 2000); return; }
              const payload = generatePix(userPixKey, props.expected, "${user.name}", "BRASIL", window.challengeTitle || "ECONOMIZZE");
              document.getElementById('pix-value-display').innerText = money(props.expected); document.getElementById('pix-copypaste').value = payload;
              const modal = new bootstrap.Modal(document.getElementById('modal-pay-pix')); modal.show();
              const btnConfirm = document.getElementById('btn-confirm-pay');
              btnConfirm.onclick = async () => { btnConfirm.disabled = true; btnConfirm.innerText = 'Confirmando...'; await fetch('/api/payments/' + id, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ is_paid: 1 }) }); modal.hide(); btnConfirm.disabled = false; btnConfirm.innerText = 'Confirmar Depósito'; setFlash('Depósito confirmado!'); await loadItems(); checkFlash(); };
          } else {
              if (!confirm('Desfazer pagamento?')) return; await fetch('/api/payments/' + id, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ is_paid: 0 }) }); setFlash('Desfeito!'); await loadItems(); checkFlash();
          }
      }
      loadItems();
    </script>
  `, user, actions))
})

// --- API ROTAS PARA CHALLENGES ---
app.post('/api/challenges', protect, async (c) => {
    const p = c.get('user'); const body = await c.req.json(); const uuid = crypto.randomUUID();
    await c.env.DB.prepare("INSERT INTO challenges (id, user_id, type, title, start_date, initial_value, end_date) VALUES (?,?,?,?,?,?,?)").bind(uuid, p.id, body.type, body.title, body.start_date||null, body.initial_value||body.vr_value||0, body.vr_end||null).run();
    const batch = [];
    if (body.type === '52_weeks') {
        const start = new Date(body.start_date); const val = Number(body.initial_value);
        for (let i = 0; i < 52; i++) { let d = new Date(start); d.setDate(start.getDate() + (i * 7)); batch.push(c.env.DB.prepare("INSERT INTO payments (challenge_id, expected_value, due_date) VALUES (?,?,?)").bind(uuid, val * (i + 1), d.toISOString().split('T')[0])); }
    } else if (body.type === 'random_deposits') {
        for (let i = 0; i < Math.min(body.count, 200); i++) batch.push(c.env.DB.prepare("INSERT INTO payments (challenge_id, expected_value) VALUES (?,?)").bind(uuid, body.selected_bills[Math.floor(Math.random() * body.selected_bills.length)]));
    } else if (body.type === 'vr_savings') {
        const start = new Date(body.vr_start); const end = new Date(body.vr_end); const daily = Number(body.vr_value);
        let curr = new Date(start); curr.setHours(12,0,0,0); end.setHours(12,0,0,0);
        while (curr <= end) { if (curr.getDay() !== 0 && curr.getDay() !== 6) batch.push(c.env.DB.prepare("INSERT INTO payments (challenge_id, expected_value, due_date) VALUES (?,?,?)").bind(uuid, daily, curr.toISOString().split('T')[0])); curr.setDate(curr.getDate() + 1); }
    }
    if (batch.length > 0) await c.env.DB.batch(batch);
    return c.json({ ok: true, id: uuid });
});

app.get('/api/challenges', protect, async (c) => {
    const p = c.get('user');
    const { results } = await c.env.DB.prepare(`SELECT c.*, COUNT(p.id) as total_payments, COALESCE(SUM(p.is_paid), 0) as paid_count, ROUND(COALESCE(SUM(CASE WHEN p.is_paid=1 THEN (CASE WHEN c.type='vr_savings' THEN p.expected_value-p.amount_spent ELSE p.expected_value END) ELSE 0 END), 0), 2) as total_saved, ROUND(COALESCE(SUM(p.expected_value), 0), 2) as total_value_expected FROM challenges c LEFT JOIN payments p ON c.id = p.challenge_id WHERE c.user_id = ? GROUP BY c.id`).bind(p.id).all();
    return c.json(results);
})

app.get('/api/challenge/:id', protect, async (c) => {
    const p = c.get('user');
    const challenge = await c.env.DB.prepare("SELECT * FROM challenges WHERE id = ? AND user_id = ?").bind(c.req.param('id'), p.id).first();
    if (!challenge) return c.json({ error: '404' }, 404);
    const { results: payments } = await c.env.DB.prepare("SELECT * FROM payments WHERE challenge_id = ? ORDER BY id ASC").bind(c.req.param('id')).all();
    return c.json({ challenge, payments });
});

app.patch('/api/payments/:id', protect, async (c) => {
    const body = await c.req.json(); const now = new Date().toISOString();
    if (body.amount_spent !== undefined) await c.env.DB.prepare("UPDATE payments SET amount_spent = ?, is_paid = 1, paid_at = ? WHERE id = ?").bind(body.amount_spent, now, c.req.param('id')).run();
    else if (body.is_paid !== undefined) await c.env.DB.prepare("UPDATE payments SET is_paid = ?, paid_at = ? WHERE id = ?").bind(body.is_paid, body.is_paid ? now : null, c.req.param('id')).run();
    return c.json({ ok: true });
});

app.delete('/api/challenges/:id', protect, async (c) => {
    const p = c.get('user');
    await c.env.DB.batch([c.env.DB.prepare("DELETE FROM payments WHERE challenge_id = ?").bind(c.req.param('id')), c.env.DB.prepare("DELETE FROM challenges WHERE id = ? AND user_id = ?").bind(c.req.param('id'), p.id)]);
    return c.json({ ok: true });
});

// CALENDÁRIO .ICS
app.get('/challenge/:id/calendar', async (c) => {
    let token = getCookie(c, 'auth_token');
    const tokenQuery = c.req.query('t');
    if (!token && tokenQuery) token = tokenQuery;
    if (!token) return c.text('Unauthorized', 401);
    let p; try { p = await verify(token, c.env.JWT_SECRET); } catch { return c.text('Token inválido', 401); }

    const challenge = await c.env.DB.prepare("SELECT * FROM challenges WHERE id = ? AND user_id = ?").bind(c.req.param('id'), p.id).first();
    if (!challenge) return c.text('404', 404);
    const { results: payments } = await c.env.DB.prepare("SELECT * FROM payments WHERE challenge_id = ?").bind(c.req.param('id')).all();

    const calName = `Economizze: ${challenge.title}`;
    let icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Economizze//Finance App//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${calName}`, 'REFRESH-INTERVAL;VALUE=DURATION:P1D', `X-PUBLISHED-TTL:P1D`];

    payments.forEach((pay: any) => {
        if (pay.due_date) {
            const dateStr = pay.due_date.replace(/-/g, ''); 
            const statusEmoji = pay.is_paid ? '✅' : '💰';
            const statusTxt = pay.is_paid ? 'PAGO' : 'PENDENTE';
            icsContent.push('BEGIN:VEVENT', `UID:${pay.id}@economizze.app`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`, `DTSTART;VALUE=DATE:${dateStr}`, `SUMMARY:${statusEmoji} R$ ${pay.expected_value} - ${challenge.title}`, `DESCRIPTION:Parcela ${statusTxt}.\\nValor: R$ ${pay.expected_value}\\nApp Economizze`, 'CATEGORIES:Finanças,Economizze', `STATUS:${pay.is_paid ? 'CONFIRMED' : 'TENTATIVE'}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
        }
    });
    icsContent.push('END:VCALENDAR');
    return new Response(icsContent.join('\r\n'), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${challenge.title.replace(/\s+/g, '_')}.ics"` } });
})

export default app