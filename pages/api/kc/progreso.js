import { z } from 'zod';
import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';
const store = require('../../../lib/certificado/store');

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 40, scope: 'kc-progreso' });

const Body = z.object({
  nivel: z.number().int().min(1).max(31),
  duracionSeg: z.number().min(0).max(60 * 60 * 24 * 30),
  pistas: z.number().min(0).max(500).optional().default(0),
});

// Registra un nivel completado para el usuario con sesión (GET devuelve su progreso).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Método no permitido.' }); }
  if (await isRateLimited(getClientIp(req))) return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });
  if (!store.admin()) return res.status(503).json({ error: 'El registro de progreso no está disponible todavía.' });
  try {
    const user = await store.usuarioDe(req);
    if (!user) return res.status(401).json({ error: 'Inicia sesión para guardar tu progreso.' });
    if (req.method === 'GET') {
      const niveles = await store.nivelesDe(store.admin(), user.id);
      return res.status(200).json({ niveles: niveles.map((n) => n.nivel), completados: niveles.length });
    }
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Datos de progreso inválidos.' });
    const r = await store.registrarNivel(user.id, parsed.data);
    if (!r.ok) return res.status(r.status || 400).json({ error: r.error });
    return res.status(200).json({ ok: true, completados: r.completados, repetido: r.repetido });
  } catch (err) {
    console.error('kc/progreso', err);
    return res.status(502).json({ error: 'No pudimos guardar tu progreso. Intenta de nuevo.' });
  }
}
