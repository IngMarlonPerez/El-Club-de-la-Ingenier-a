// Cliente de la API oficial de Jooble (https://jooble.org/api/about). Fuente primaria:
// API real, sin scraping. La API key vive solo en el servidor (JOOBLE_API_KEY),
// nunca se expone al cliente.

/**
 * Busca ofertas en Jooble.
 * @param {{ keywords: string, location?: string }} params
 * @returns {Promise<Array<object>>} ofertas normalizadas (ver aggregator.js para el formato)
 */
async function searchJooble({ keywords, location }) {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, location: location || 'Ecuador' }),
  });

  if (!res.ok) {
    throw new Error(`Jooble ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];

  return jobs.map((j) => ({
    titulo: j.title || '',
    empresa: j.company || 'No especificada',
    ubicacion: j.location || 'Ecuador',
    tipoEmpleo: j.type || null,
    fechaPublicacion: j.updated || null, // formato ISO-like que devuelve Jooble
    url: j.link,
    fuente: 'Jooble',
  }));
}

module.exports = { searchJooble };
