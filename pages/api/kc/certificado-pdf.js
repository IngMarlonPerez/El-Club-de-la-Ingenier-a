import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';
const store = require('../../../lib/certificado/store');
const core = require('../../../lib/certificado/core');
const { generarPdf } = require('../../../lib/certificado/pdf');

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 6, scope: 'kc-certificado-pdf' });

// Descarga del PDF: solo para el dueño del certificado (sesión iniciada) y solo si el certificado existe
// (es decir, completó los 31 niveles) y no está revocado. Se recalcula y comprueba la firma antes de entregarlo.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
  if (await isRateLimited(getClientIp(req))) return res.status(429).json({ error: 'Demasiadas descargas seguidas. Espera un momento.' });
  if (!store.configurado()) return res.status(503).json({ error: 'El emisor de certificados no está configurado todavía.' });
  try {
    const user = await store.usuarioDe(req);
    if (!user) return res.status(401).json({ error: 'Inicia sesión para descargar tu certificado.' });
    const { data, error } = await store.admin().from('certificados').select('codigo, nombre, emitido_en, huella, firma, revocado').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(403).json({ error: 'Aún no tienes certificado: completa los 31 niveles de Kernel Cero.' });
    if (data.revocado) return res.status(403).json({ error: 'Este certificado fue revocado.' });
    const { pub } = store.claves();
    if (!core.verificarFirma({ codigo: data.codigo, nombre: data.nombre, emitidoEn: data.emitido_en }, data.firma, pub)) {
      console.error('kc/certificado-pdf: firma inválida para', data.codigo);
      return res.status(500).json({ error: 'No pudimos validar la firma del certificado. Contacta al Club.' });
    }
    const pdf = await generarPdf({ codigo: data.codigo, nombre: data.nombre, emitidoEn: data.emitido_en, huella: data.huella, firma: data.firma });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificado-Club-${data.codigo}.pdf"`);
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('kc/certificado-pdf', err);
    return res.status(502).json({ error: 'No pudimos generar tu certificado. Intenta de nuevo.' });
  }
}
