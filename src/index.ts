import { Hono } from 'hono'
import type { Bindings, Variables } from './types'

// Importando Rotas
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import financeRoutes from './routes/finance'
import challengesRoutes from './routes/challenges'
import profileRoutes from './routes/profile'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.onError((err, c) => {
  console.error('SERVER ERROR:', err);
  return c.text('Erro Interno no Servidor', 500);
});

// Montagem das Rotas
app.route('/', authRoutes);
app.route('/', dashboardRoutes);
app.route('/', financeRoutes);
app.route('/', challengesRoutes);
app.route('/', profileRoutes);

export default app