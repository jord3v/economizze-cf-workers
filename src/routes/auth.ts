import { Hono } from 'hono'
import { html } from 'hono/html'
import { sign } from 'hono/jwt'
import { setCookie, deleteCookie } from 'hono/cookie'
import type { Bindings } from '../types'
import { hashPassword } from '../lib/utils'
import { layout } from '../views/layout'
import { ICONS } from '../views/components'

const auth = new Hono<{ Bindings: Bindings }>()

auth.get('/login-page', (c) => c.html(layout('Login', 'auth', html`
  <div class="page page-center"><div class="container container-tight py-4">
    <div class="text-center mb-4"><h1 class="navbar-brand text-primary fw-bold fs-2">${ICONS.PIG} ECONOMIZZE</h1></div>
    <div class="card card-md shadow-sm"><div class="card-body"><h2 class="h2 text-center mb-4">Login</h2>
        <form onsubmit="event.preventDefault(); login()">
            <div class="mb-3"><label class="form-label">E-mail</label><input type="email" id="lEmail" class="form-control" required></div>
            <div class="mb-2"><label class="form-label">Senha</label><input type="password" id="lPass" class="form-control" required></div>
            <div class="form-footer"><button type="submit" id="btnLog" class="btn btn-primary w-100">Entrar</button></div>
        </form>
    </div></div><div class="text-center text-secondary mt-3">Novo? <a href="/register-page">Criar conta</a></div></div></div>
    <script>async function login() { 
        const btn = document.getElementById('btnLog'); setBtnLoading(btn);
        const res = await fetch('/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: lEmail.value, password: lPass.value })}); 
        if(res.ok) location.href = '/'; else { showToast('E-mail ou senha incorretos', 'error'); resetBtnLoading(btn); }
    }</script>
`)))

auth.get('/register-page', (c) => c.html(layout('Cadastro', 'auth', html`
  <div class="page page-center"><div class="container container-tight py-4">
    <div class="text-center mb-4"><h1 class="navbar-brand text-primary fw-bold fs-2">${ICONS.PIG} ECONOMIZZE</h1></div>
    <div class="card card-md shadow-sm"><div class="card-body"><h2 class="h2 text-center mb-4">Cadastro</h2>
        <form onsubmit="event.preventDefault(); reg()">
            <div class="mb-3"><label class="form-label">Nome</label><input type="text" id="rName" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">E-mail</label><input type="email" id="rEmail" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Senha</label><input type="password" id="rPass" class="form-control" minlength="6" required></div>
            <div class="form-footer"><button type="submit" id="btnReg" class="btn btn-primary w-100">Criar</button></div>
        </form>
    </div></div></div></div>
    <script>async function reg() { 
        const btn = document.getElementById('btnReg'); setBtnLoading(btn);
        const res = await fetch('/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: rName.value, email: rEmail.value, password: rPass.value })}); 
        if(res.ok) location.href = '/'; else { const err = await res.json(); showToast(err.error || 'Erro ao criar conta', 'error'); resetBtnLoading(btn); }
    }</script>
`)))

auth.post('/register', async (c) => { 
    try { 
        const { email, password, name } = await c.req.json(); 
        if(!email || !name || !password || password.length < 6) return c.json({ error: 'Preencha todos os campos. Senha mín. 6 chars.' }, 400);
        const hashed = await hashPassword(password);
        const res = await c.env.DB.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?) RETURNING id").bind(email, hashed, name).first<{id:number}>(); 
        const token = await sign({ id: res!.id, email }, c.env.JWT_SECRET); 
        setCookie(c, 'auth_token', token, { path: '/', httpOnly: true, maxAge: 86400, secure: true }); 
        return c.json({ ok: true }); 
    } catch (e: any) { return c.json({ error: 'Erro ao criar conta (E-mail já existe?)' }, 500); } 
});

auth.post('/login', async (c) => { 
    const { email, password } = await c.req.json(); 
    if(!email || !password) return c.json({ error: 'Preencha todos os campos' }, 400);
    const hashed = await hashPassword(password);
    const u = await c.env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(email, hashed).first<{id:number, email:string}>(); 
    if (!u) return c.json({ error: 1 }, 401); 
    const token = await sign({ id: u.id, email: u.email }, c.env.JWT_SECRET); 
    setCookie(c, 'auth_token', token, { path: '/', httpOnly: true, maxAge: 86400, secure: true }); 
    return c.json({ ok: true }); 
});

auth.get('/logout', (c) => { deleteCookie(c, 'auth_token'); return c.redirect('/login-page'); });

export default auth