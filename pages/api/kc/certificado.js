import { z } from 'zod';
import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';
const store = require('../../../lib/certificado/store');
const core = require('../../../lib/certificado/core');

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 10, scope: 'kc-certificado' });
const Body = z.object({ nombre: z.string().min(1).max(120) });

// GET: estado del certificado del usuario. POST: emite el certificado (una sola vez) si completó los 31 niveles.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Método no permitido.' }); }
  if (await isRateLimited(getClientIp(req))) return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });
  if (!store.configurado()) return res.status(503).json({ error: 'El emisor de certificados no está configurado todavía.' });
  try {
    const user = await store.usuarioDe(req);
    if (!user) return res.status(401).json({ error: 'Inicia sesión con Google o GitHub para reclamar tu certificado.' });
    if (req.method === 'GET') {
      const niveles = await store.nivelesDe(store.admin(), user.id);
      const cert = await store.certificadoDe(user.id);
      const ev = core.evaluarProgreso(niveles);
      return res.status(200).json({ completados: niveles.length, total: core.TOTAL_NIVELES, puedeEmitir: ev.ok && !cert, certificado: cert, nombreSugerido: store.nombreSugerido(user) });
    }
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Escribe tu nombre completo.' });
    const r = await store.emitirCertificado(user.id, parsed.data.nombre);
    if (!r.ok) return res.status(r.status || 400).json({ error: r.error, faltan: r.faltan });
    return res.status(200).json({ ok: true, nuevo: r.nuevo, certificado: r.certificado });
  } catch (err) {
    console.error('kc/certificado', err);
    return res.status(502).json({ error: 'No pudimos procesar tu certificado. Intenta de nuevo.' });
  }
}
