// Guardia anti-abuso por IP, en memoria, best-effort — mismo patrón que
// pages/api/chat.js, extraído aquí para reutilizarlo en /api/jobs/search.

function createRateLimiter({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map();
  return function isRateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > max;
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
