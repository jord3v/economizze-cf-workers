import { raw } from 'hono/html'

export const ICONS = {
    PIG: raw(`<svg class="icon icon-tabler icon-tabler-pig text-primary" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M15 11v.01"/><path d="M16 3l0 3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342a6.008 6.008 0 0 1 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l4.5 -3z"/></svg>`),
};

export const SKELETONS = {
  CARD: raw(`
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card card-stacked border-0 shadow-sm" style="height: 100%">
        <div class="card-body">
          <div class="placeholder-glow mb-3"><div class="placeholder col-7"></div></div>
          <div class="progress progress-sm mb-2"><div class="progress-bar bg-secondary" style="width: 0%"></div></div>
          <div class="placeholder-glow d-flex justify-content-between"><div class="placeholder col-4"></div><div class="placeholder col-3"></div></div>
        </div>
      </div>
    </div>`.repeat(3)),
  
  TABLE_ROWS: raw(`
    <tr class="placeholder-glow"><td colspan="5"><span class="placeholder col-12"></span></td></tr>`.repeat(5)),
  
  LIST_ITEMS: raw(`
    <div class="list-group-item placeholder-glow">
      <div class="row align-items-center">
        <div class="col-auto"><div class="avatar placeholder"></div></div>
        <div class="col"><div class="placeholder col-7"></div><div class="placeholder col-4"></div></div>
        <div class="col-auto"><div class="placeholder col-2"></div></div>
      </div>
    </div>`.repeat(5)),

  CHALLENGE_DETAIL: raw(`
    <div id="skeleton-detail" class="row">
        <div class="col-lg-8 mb-3">
            <div class="card shadow-sm border-0" style="height: 500px">
                <div class="card-body placeholder-glow">
                    <div class="placeholder col-12 w-100 h-100"></div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card shadow-sm border-0" style="height: 500px">
                <div class="card-header placeholder-glow"><span class="placeholder col-6"></span></div>
                <div class="card-body p-0">
                    <div class="list-group list-group-flush">
                        <div class="list-group-item placeholder-glow"><span class="placeholder col-12"></span></div>
                        <div class="list-group-item placeholder-glow"><span class="placeholder col-8"></span></div>
                        <div class="list-group-item placeholder-glow"><span class="placeholder col-10"></span></div>
                        <div class="list-group-item placeholder-glow"><span class="placeholder col-12"></span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `),

  TEXT_SMALL: raw(`<span class="placeholder col-4"></span>`),
  TEXT_MEDIUM: raw(`<span class="placeholder col-6"></span>`),
};

// Scripts globais essenciais
export const GLOBAL_SCRIPTS = raw(`
    function setBtnLoading(btn) { if(btn) { btn.disabled = true; btn.dataset.original = btn.innerHTML; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processando...'; } }
    function resetBtnLoading(btn) { if(btn) { btn.disabled = false; btn.innerHTML = btn.dataset.original; } }
    function showToast(msg, type = 'success') {
        const id = 't-' + Date.now();
        const color = type === 'success' ? 'bg-success' : 'bg-danger';
        const tHtml = \`<div id="\${id}" class="toast show align-items-center text-white \${color} border-0 mb-2 shadow-lg"><div class="d-flex p-2 align-items-center"><div class="toast-body px-2">\${msg}</div><button type="button" class="btn-close btn-close-white ms-auto me-2" data-bs-dismiss="toast"></button></div></div>\`;
        document.getElementById('toast-container')?.insertAdjacentHTML('beforeend', tHtml);
        setTimeout(() => document.getElementById(id)?.remove(), 4000);
      }
      function setFlash(msg, type='success') { sessionStorage.setItem('flash_msg', msg); sessionStorage.setItem('flash_type', type); }
      function checkFlash() { const msg = sessionStorage.getItem('flash_msg'); if(msg) { setTimeout(() => { showToast(msg, sessionStorage.getItem('flash_type')); sessionStorage.removeItem('flash_msg'); sessionStorage.removeItem('flash_type'); }, 100); } }
      const money = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      function parseDateLocal(dateStr) { if (!dateStr) return new Date(); if (dateStr.includes('T')) return new Date(dateStr); const parts = dateStr.split('-'); return new Date(parts[0], parts[1] - 1, parts[2]); }
      function getEmptyHTML(title, subtitle) { return \`<div class="empty"><div class="empty-img"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mood-empty" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0h24v24H0z" stroke="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9 15l6 0" /></svg></div><p class="empty-title">\${title}</p><p class="empty-subtitle text-muted">\${subtitle}</p></div>\`; }
      document.addEventListener("DOMContentLoaded", () => { checkFlash(); });
`);