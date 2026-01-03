import { Hono } from 'hono'
import { html } from 'hono/html'
import { protect, getCurrentUser } from '../middleware/auth'
import { layout } from '../views/layout'
import { hashPassword } from '../lib/utils'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.get('/profile', async (c) => {
  const user = await getCurrentUser(c); if (!user) return c.redirect('/login-page');
  return c.html(layout('Editar Perfil', 'profile', html`
    <div class="row justify-content-center">
        <div class="col-md-6"><div class="card shadow-sm"><div class="card-header"><h3 class="card-title">Seus Dados</h3></div><div class="card-body"><form id="form-profile"><div class="mb-3"><label class="form-label">Nome Completo</label><input type="text" id="pName" class="form-control" value="${user.name}" required></div><div class="mb-3"><label class="form-label">E-mail</label><input type="email" id="pEmail" class="form-control" value="${user.email}" required></div><div class="mb-3"><label class="form-label">Chave PIX (Para Copia e Cola)</label><input type="text" id="pPix" class="form-control" value="${user.pix_key || ''}" placeholder="CPF, Email, Telefone ou Aleatória"></div><div class="mb-3"><label class="form-label">Nova Senha (Opcional)</label><input type="password" id="pPass" class="form-control" placeholder="Deixe em branco para manter a atual" minlength="6"></div><button type="submit" class="btn btn-primary w-100">Salvar Alterações</button></form></div></div></div>
    </div>
    <script>
        document.getElementById('form-profile').onsubmit = async (e) => { e.preventDefault(); const btn = e.target.querySelector('button'); setBtnLoading(btn); const res = await fetch('/api/profile', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: document.getElementById('pName').value, email: document.getElementById('pEmail').value, pix_key: document.getElementById('pPix').value, password: document.getElementById('pPass').value }) }); if(res.ok) { setFlash('Perfil atualizado com sucesso!'); location.reload(); } else { showToast('Erro ao atualizar', 'error'); resetBtnLoading(btn); } };
    </script>
  `, user))
})

app.put('/api/profile', protect, async (c) => {
    const p = c.get('user'); const { name, email, pix_key, password } = await c.req.json();
    if(password && password.length > 0) {
        const hashed = await hashPassword(password);
        await c.env.DB.prepare("UPDATE users SET name = ?, email = ?, pix_key = ?, password = ? WHERE id = ?").bind(name, email, pix_key, hashed, p.id).run();
    } else {
        await c.env.DB.prepare("UPDATE users SET name = ?, email = ?, pix_key = ? WHERE id = ?").bind(name, email, pix_key, p.id).run();
    }
    return c.json({ ok: true });
});

export default app