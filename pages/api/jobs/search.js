import { z } from 'zod';
import { searchJooble } from '../../../lib/jobs/jooble';
import { aggregateJobs } from '../../../lib/jobs/aggregator';
import { readCache, writeCache, readScrapedListings } from '../../../lib/jobs/cache';
import { createRateLimiter, getClientIp } from '../../../lib/jobs/rateLimit';
import { CRON_SEARCH_TERMS } from '../../../lib/jobs/cronTerms';

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 20 });

const BodySchema = z.object({
  carrera: z.string().trim().min(2).max(80),
  experiencia: z.enum(['sin_experiencia', '1_2_anios', '3_5_anios', '5_mas_anios']),
  tipoEmpleo: z.enum(['tiempo_completo', 'medio_tiempo', 'freelance', 'remoto', 'practicas']),
  ubicacion: z.string().trim().max(80).optional(),
});

// El cron (pages/api/cron/scrape-jobs.js) solo puede scrapear una lista fija y curada
// de términos (no puede anticipar cada carrera que un usuario escriba). Aquí buscamos
// el término precargado que mejor coincide con lo que escribió el usuario, en vez de
// scrapear Computrabajo en vivo dentro de este request — esa es la regla de diseño
// no negociable del documento base.
function bestScrapedTerm(carrera) {
  const q = carrera.toLowerCase();
  let best = null;
  for (const term of CRON_SEARCH_TERMS) {
    if (q.includes(term) || term.includes(q)) { best = term; break; }
  }
  return best;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Demasiadas búsquedas seguidas. Espera un minuto e intenta de nuevo.' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Revisa los datos del formulario.', detalles: parsed.error.flatten() });
  }
  const filters = parsed.data;

  const cached = await readCache(filters);
  if (cached) {
    return res.status(200).json({ ofertas: cached, fuenteCache: true });
  }

  const keywords = filters.carrera;
  const location = filters.ubicacion || 'Ecuador';

  let joobleJobs = [];
  try {
    joobleJobs = await searchJooble({ keywords, location });
  } catch (err) {
    console.error('Jooble falló, se continúa solo con la caché de Computrabajo', err);
  }

  const term = bestScrapedTerm(keywords);
  const computrabajoJobs = term ? await readScrapedListings(term) : [];

  const ofertas = aggregateJobs([joobleJobs, computrabajoJobs], { maxAgeDays: 7, limit: 10 });

  if (!joobleJobs.length && !computrabajoJobs.length && !process.env.JOOBLE_API_KEY) {
    return res.status(200).json({
      ofertas: [],
      aviso: 'El buscador todavía no tiene configurada JOOBLE_API_KEY — configúrala en las variables de entorno para ver resultados en vivo.',
    });
  }

  await writeCache(filters, ofertas);

  return res.status(200).json({ ofertas, fuenteCache: false });
}
