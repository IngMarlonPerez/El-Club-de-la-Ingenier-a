import { z } from 'zod';
import { searchJooble } from '../../../lib/jobs/jooble';
import { aggregateJobs } from '../../../lib/jobs/aggregator';
import { readCache, writeCache, readScrapedListings } from '../../../lib/jobs/cache';
import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';
import { CRON_SEARCH_TERMS } from '../../../lib/jobs/cronTerms';

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 20, scope: 'jobs-search' });

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
//
// matchScrapedTerms intenta, en orden, tres formas de encontrar coincidencias -- el
// simple "substring" original fallaba con carreras reales como "Ingeniería en
// Tecnologías de la Información" (no comparte texto literal con ningún término
// curado) y devolvía cero resultados en silencio, aunque sí había ofertas guardadas.
function normalizeCarrera(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9\s]/g, ' ');
}

const STOPWORDS = new Set(['de', 'la', 'el', 'en', 'y', 'del', 'las', 'los', 'para', 'con']);

function tokenizeCarrera(str) {
  return normalizeCarrera(str).split(/\s+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

// Pistas para carreras comunes que no comparten ninguna raíz literal con los
// términos curados, pero en la práctica son el término más cercano disponible.
const CARRERA_HINTS = [
  { match: ['tecnologia', 'informatica', 'computacion', 'sistemas'], term: 'desarrollador' },
  { match: ['seguridad'], term: 'ciberseguridad' },
  { match: ['dato'], term: 'ciencia de datos' },
  { match: ['telecomunicacion'], term: 'redes' },
  { match: ['contable', 'auditoria', 'finanza'], term: 'contabilidad' },
  { match: ['mercadeo', 'publicidad', 'comercial'], term: 'marketing' },
];

// Devuelve TODOS los términos plausibles, no solo "el mejor" -- un término puede
// calzar muy bien por texto pero tener solo ofertas viejas cacheadas ese día
// (Computrabajo no siempre tiene resultados recientes para cada término), así que
// combinar varios candidatos y dejar que el filtro de "últimos 7 días" decida cuáles
// sobreviven da resultados más confiables que apostar a un único término "ganador".
function matchScrapedTerms(carrera) {
  const q = normalizeCarrera(carrera);
  const matches = new Set();

  // 1) coincidencia directa por substring (caso más común: "desarrollador web").
  for (const term of CRON_SEARCH_TERMS) {
    if (q.includes(term) || term.includes(q)) matches.add(term);
  }

  // 2) coincidencia por raíz de palabra compartida (primeros 6 caracteres) --
  // cubre variantes de género/número que el substring exacto no detecta
  // (ej. "ingenieria" vs "ingeniero").
  const qTokens = tokenizeCarrera(carrera);
  for (const term of CRON_SEARCH_TERMS) {
    const termTokens = tokenizeCarrera(term);
    const hasMatch = qTokens.some((qt) => termTokens.some((tt) => qt.slice(0, 6) === tt.slice(0, 6)));
    if (hasMatch) matches.add(term);
  }

  // 3) pistas curadas para carreras que no comparten raíz literal con ningún término.
  for (const hint of CARRERA_HINTS) {
    if (hint.match.some((w) => q.includes(w))) matches.add(hint.term);
  }

  return Array.from(matches);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  if (await isRateLimited(getClientIp(req))) {
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

  const terms = matchScrapedTerms(keywords);
  const computrabajoLists = await Promise.all(terms.map((t) => readScrapedListings(t)));
  const computrabajoJobs = computrabajoLists.flat();

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
