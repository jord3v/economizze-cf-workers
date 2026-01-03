import { html } from 'hono/html'
import { ICONS, GLOBAL_SCRIPTS } from './components'

export const layout = (title: string, activeTab: string, content: any, user: any = null, actions: any = null) => html`
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>${title} - Economizze</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css">
    <style>
      @import url('https://rsms.me/inter/inter.css');
      :root { --tblr-font-sans-serif: 'Inter Var', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; }
      body { font-feature-settings: "cv03", "cv04", "cv11"; background-color: #f6f8fb; }
      .navbar { background-color: #ffffff; border-bottom: 1px solid #e6e7e9; }
      .navbar-nav .nav-item.active .nav-link { background-color: rgba(32, 107, 196, 0.08); color: #206bc4 !important; font-weight: 700; border-radius: 4px; }
      .payment-box { border: 2px solid #e6e7e9; border-radius: 8px; transition: 0.2s; cursor: pointer; background: white; user-select: none; display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 1; }
      .payment-box:hover { border-color: #206bc4; }
      .payment-box.paid { border-color: #2fb344; background-color: #f0fdf4; opacity: 0.6; cursor: default; }
      .grid-bingo { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 8px; width: 100%; }
      .empty { text-align: center; padding: 3rem 1rem; color: #667382; }
      .empty-img svg { width: 64px; height: 64px; color: #dce1e7; margin-bottom: 1rem; }
      .empty-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #1e293b; }
      .toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 11000; }
    </style>
  </head>
  <body>
    <div class="toast-container" id="toast-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script>${GLOBAL_SCRIPTS}</script>
    <div class="page">
      ${user ? html`
        <header class="navbar navbar-expand-md d-print-none">
          <div class="container-xl">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu"><span class="navbar-toggler-icon"></span></button>
            <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3"><a href="/" class="text-decoration-none">${ICONS.PIG} ECONOMIZZE</a></h1>
            <div class="navbar-nav flex-row order-md-last">
              <div class="nav-item dropdown">
                <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"><span class="avatar avatar-sm bg-blue-lt">${(user?.name || 'U').charAt(0).toUpperCase()}</span><div class="d-none d-xl-block ps-2"><div>${user?.name}</div><div class="mt-1 small text-secondary">Usuário</div></div></a>
                <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow"><a href="/profile" class="dropdown-item">Perfil & PIX</a><div class="dropdown-divider"></div><a href="/logout" class="dropdown-item text-danger">Sair</a></div>
              </div>
            </div>
            <div class="collapse navbar-collapse" id="navbar-menu">
              <div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
                <ul class="navbar-nav">
                  <li class="nav-item ${activeTab === 'home' ? 'active' : ''}"><a class="nav-link" href="/"><span class="nav-link-title">Dashboard</span></a></li>
                  <li class="nav-item ${activeTab === 'challenges' ? 'active' : ''}"><a class="nav-link" href="/challenges"><span class="nav-link-title">Desafios</span></a></li>
                  <li class="nav-item ${activeTab === 'expenses' ? 'active' : ''}"><a class="nav-link" href="/expenses"><span class="nav-link-title">Gastos</span></a></li>
                  <li class="nav-item ${activeTab === 'incomes' ? 'active' : ''}"><a class="nav-link" href="/incomes"><span class="nav-link-title">Entradas</span></a></li>
                  <li class="nav-item ${activeTab === 'report' ? 'active' : ''}"><a class="nav-link" href="/report"><span class="nav-link-title">Relatórios</span></a></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        <div class="page-wrapper">
            <div class="page-header d-print-none">
                <div class="container-xl">
                    <div class="row g-2 align-items-center">
                        <div class="col"><h2 class="page-title">${title}</h2></div>
                        <div class="col-auto ms-auto d-print-none"><div class="btn-list">${actions}</div></div>
                    </div>
                </div>
            </div>
            <div class="page-body"><div class="container-xl">${content}</div></div>
            <footer class="footer footer-transparent d-print-none">
               <div class="container-xl"><div class="row text-center align-items-center flex-row-reverse"><div class="col-12 col-lg-auto mt-3 mt-lg-0"><ul class="list-inline list-inline-dots mb-0"><li class="list-inline-item">Economizze &copy; 2025</li></ul></div></div></div>
            </footer>
        </div>
      ` : html`<div class="page-wrapper">${content}</div>`}
    </div>
  </body>
</html>
`