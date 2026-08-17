// Job programado (Vercel Cron, ver vercel.json) que scrapea Computrabajo Ecuador para
// una lista fija de términos y guarda los resultados en caché. Nunca se llama desde el
// navegador de un usuario — solo Vercel Cron, con el secreto CRON_SECRET.
import { scrapeComputrabajo } from '../../../lib/jobs/scrapers/computrabajo';
import { writeScrapedListings } from '../../../lib/jobs/cache';
import { CRON_SEARCH_TERMS } from '../../../lib/jobs/cronTerms';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'No autorizado.' });
    }
  }

  const resultados = {};
  const errores = {};

  for (const term of CRON_SEARCH_TERMS) {
    try {
      const ofertas = await scrapeComputrabajo(term);
      await writeScrapedListings(term, ofertas);
      resultados[term] = ofertas.length;
      // Pequeña pausa entre términos para no golpear el portal con ráfagas de pedidos.
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      errores[term] = String(err.message || err);
    }
  }

  return res.status(200).json({ ok: true, resultados, errores, actualizadoEn: new Date().toISOString() });
}
