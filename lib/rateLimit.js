// Guardia anti-abuso por IP, respaldada en Supabase (función increment_rate_limit,
// ver supabase/migrations/0004_rate_limits.sql) para que el límite sea real entre
// invocaciones serverless -- un Map en memoria se resetea cada vez que Vercel arranca
// una instancia nueva de la función, así que en producción el límite real terminaba
// siendo mucho más permisivo de lo que el código sugería.
//
// Si Supabase no está configurado (ej. desarrollo local sin esas env vars, o la
// llamada falla), cae a un Map en memoria como antes -- mismo criterio de "degradar
// con gracia" que ya usa lib/jobs/cache.js.

const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function createMemoryLimiter(windowMs, max) {
  const hits = new Map();
  return function isRateLimited(key) {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };
}

/**
 * @param {{ windowMs?: number, max?: number, scope: string }} opts - `scope` distingue
 *   el bucket de cada endpoint (ej. 'chat', 'jobs-search') para que no compartan cupo.
 * @returns {(ip: string) => Promise<boolean>} true si el pedido debe bloquearse.
 */
function createRateLimiter({ windowMs = 60_000, max = 20, scope = 'default' } = {}) {
  const memoryLimiter = createMemoryLimiter(windowMs, max);

  return async function isRateLimited(ip) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return memoryLimiter(ip);

    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: `${scope}:${ip}`,
      p_window_ms: windowMs,
      p_max: max,
    });

    if (error) {
      console.error('increment_rate_limit falló, usando fallback en memoria', error);
      return memoryLimiter(ip);
    }

    return data === true;
  };
}

function getClientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = { createRateLimiter, getClientIp };
