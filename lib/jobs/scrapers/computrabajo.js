// Scraper ligero de Computrabajo Ecuador (ec.computrabajo.com). Estructura HTML
// verificada manualmente (agosto 2026) antes de escribir este código — no es una
// suposición. Corre SOLO desde el cron (pages/api/cron/scrape-jobs.js), nunca en el
// request de un usuario. Respeta robots.txt: solo se piden páginas de listado base
// (/trabajo-de-<termino>), nunca rutas con parámetros de localidad/orden que el
// robots.txt de portales hermanos de la misma red bloquea explícitamente.

const cheerio = require('cheerio');

const BASE_URL = 'https://ec.computrabajo.com';
const USER_AGENT =
  'Mozilla/5.0 (compatible; ClubDeLaIngenieriaBot/1.0; +https://elclubdelaingenieria.dpdns.org) proyecto educativo del Club de Ingenieria UNEMI';

// Convierte las fechas relativas en español que usa Computrabajo ("Hace 5 horas",
// "7 de agosto", "Más de 30 días") a un Date aproximado, para poder filtrar por
// "últimos 7 días" más adelante en aggregator.js.
const MESES = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};
function parseFechaRelativaEs(texto, ahora) {
  const t = (texto || '').trim().toLowerCase();
  if (!t) return null;
  if (t.includes('más de 30 días')) return new Date(ahora.getTime() - 31 * 86400000);
  let m = t.match(/hace\s+(\d+)\s+(hora|minuto)/);
  if (m) return new Date(ahora.getTime() - Number(m[1]) * (m[2] === 'hora' ? 3600000 : 60000));
  m = t.match(/hace\s+(\d+)\s+día/);
  if (m) return new Date(ahora.getTime() - Number(m[1]) * 86400000);
  if (t === 'hoy') return ahora;
  if (t === 'ayer') return new Date(ahora.getTime() - 86400000);
  m = t.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)/);
  if (m && MESES[m[2]] !== undefined) {
    const dia = Number(m[1]);
    let año = ahora.getFullYear();
    const candidata = new Date(año, MESES[m[2]], dia);
    if (candidata.getTime() > ahora.getTime() + 86400000) candidata.setFullYear(año - 1);
    return candidata;
  }
  return null;
}

/**
 * Scrapea el listado de resultados de Computrabajo Ecuador para un término de búsqueda.
 * @param {string} keywords
 * @returns {Promise<Array<object>>} ofertas normalizadas (ver aggregator.js)
 */
async function scrapeComputrabajo(keywords) {
  const slug = String(keywords).trim().toLowerCase().replace(/\s+/g, '-');
  const url = `${BASE_URL}/trabajo-de-${encodeURIComponent(slug)}`;

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const ahora = new Date();
  const ofertas = [];

  $('article.box_offer').each((_, el) => {
    const $el = $(el);
    const $titleLink = $el.find('h2 a.js-o-link').first();
    const titulo = $titleLink.text().trim();
    const href = $titleLink.attr('href');
    if (!titulo || !href) return;

    const empresa = $el.find('p.fs16.fc_base a.t_ellipsis').first().text().trim() || 'No especificada';
    // El párrafo de ubicación es el que NO tiene la clase "dFlex" (esa es la del párrafo de empresa).
    const ubicacion = $el.find('p.fs16.fc_base').not('.dFlex').first().find('span').first().text().trim() || 'Ecuador';
    const fechaTexto = $el.find('p.fs13.fc_aux').first().text().trim();
    const fecha = parseFechaRelativaEs(fechaTexto, ahora);
    const modalidad = $el.find('p.fs16.fc_base').text().toLowerCase();
    let tipoEmpleo = null;
    if (modalidad.includes('remoto')) tipoEmpleo = 'Remoto';
    else if (modalidad.includes('presencial y remoto') || modalidad.includes('híbrido')) tipoEmpleo = 'Híbrido';

    ofertas.push({
      titulo,
      empresa,
      ubicacion,
      tipoEmpleo,
      fechaPublicacion: fecha ? fecha.toISOString() : null,
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      fuente: 'Computrabajo',
    });
  });

  return ofertas;
}

module.exports = { scrapeComputrabajo, parseFechaRelativaEs };
