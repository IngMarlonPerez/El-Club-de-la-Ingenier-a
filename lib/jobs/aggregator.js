// Función pura: combina ofertas de varias fuentes, deduplica, filtra por fecha y
// ordena. Sin efectos secundarios (sin red, sin Supabase) para que sea fácil de
// testear — ver lib/jobs/__tests__/aggregator.test.js.

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeForDedupe(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * @param {Array<Array<object>>} sources - arrays de ofertas normalizadas (cada oferta:
 *   { titulo, empresa, ubicacion, tipoEmpleo, fechaPublicacion, url, fuente })
 * @param {{ now?: Date, maxAgeDays?: number, limit?: number }} [opts]
 * @returns {Array<object>} hasta `limit` ofertas, sin duplicados, ordenadas por fecha desc
 */
function aggregateJobs(sources, opts = {}) {
  const now = opts.now || new Date();
  const maxAgeMs = (opts.maxAgeDays || 7) * 24 * 60 * 60 * 1000;
  const limit = opts.limit || 10;

  const all = sources.flat().filter(Boolean);

  // Filtra por fecha: solo ofertas con fecha conocida y dentro del rango permitido.
  const withinRange = all.filter((job) => {
    if (!job.fechaPublicacion) return false;
    const t = new Date(job.fechaPublicacion).getTime();
    if (Number.isNaN(t)) return false;
    return now.getTime() - t <= maxAgeMs && t <= now.getTime() + 86400000; // tolera pequeño desfase de reloj
  });

  // Deduplica por (título + empresa) normalizados — mismo criterio para todas las fuentes.
  const seen = new Map();
  for (const job of withinRange) {
    const key = normalizeForDedupe(job.titulo) + '|' + normalizeForDedupe(job.empresa);
    const existing = seen.get(key);
    if (!existing || new Date(job.fechaPublicacion) > new Date(existing.fechaPublicacion)) {
      seen.set(key, job);
    }
  }

  const deduped = Array.from(seen.values());
  deduped.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));

  return deduped.slice(0, limit);
}

module.exports = { aggregateJobs, normalizeForDedupe, SEVEN_DAYS_MS };
