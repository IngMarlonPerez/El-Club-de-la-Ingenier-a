import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';
const store = require('../../../lib/certificado/store');

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 60, scope: 'kc-verificar' });

// Verificación pública de un certificado (la usa la página /verificar/[codigo] y cualquier tercero).
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
  if (await isRateLimited(getClientIp(req))) return res.status(429).json({ error: 'Demasiadas consultas. Espera un momento.' });
  try {
    const r = await store.verificarPublico(String(req.query.codigo || ''));
    if (r.error) return res.status(503).json({ error: 'La verificación no está disponible todavía.' });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.status(200).json(r);
  } catch (err) {
    console.error('kc/verificar', err);
    return res.status(502).json({ error: 'No pudimos verificar el certificado en este momento.' });
  }
}
