import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import type { Bindings, Variables } from '../types'

export const protect = createMiddleware<{ Bindings: Bindings, Variables: Variables }>(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  
  if (!token) {
    // Se for requisição de API, retorna 401, se for navegação, redireciona
    if(c.req.path.startsWith('/api')) return c.json({ error: 'Unauthorized' }, 401);
    return c.redirect('/login-page');
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload as any); // Injeta o usuário no contexto
    await next();
  } catch {
    return c.redirect('/logout');
  }
})

// Helper para pegar usuário completo do DB (usado em renders de página)
export async function getCurrentUser(c: any) {
    const token = getCookie(c, 'auth_token'); if (!token) return null;
    try { 
        const payload = await verify(token, c.env.JWT_SECRET); 
        return await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(payload.id).first();
    } catch { return null; }
}