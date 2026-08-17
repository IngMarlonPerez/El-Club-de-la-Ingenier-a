// Términos de búsqueda que el cron scrapea periódicamente en Computrabajo (ver
// pages/api/cron/scrape-jobs.js). Es una lista curada y fija — un scraper no puede
// anticipar cada carrera que un usuario va a escribir, así que cubrimos las áreas más
// relevantes para los miembros del club (desarrollo, datos/IA, ciberseguridad, redes,
// sistemas) más algunas generales para no dejar fuera a quien busca otra cosa.
const CRON_SEARCH_TERMS = [
  'desarrollador',
  'ingeniero de software',
  'ciberseguridad',
  'redes',
  'ciencia de datos',
  'soporte tecnico',
  'analista de sistemas',
  'diseño',
  'marketing',
  'administracion',
  'practicante',
  'contabilidad',
];

module.exports = { CRON_SEARCH_TERMS };
