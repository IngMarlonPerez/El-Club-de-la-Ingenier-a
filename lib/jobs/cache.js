// Caché de resultados de búsqueda de empleo, por combinación de filtros. Usa Supabase
// (tabla job_listings_cache) si está configurado; si no, cae a un archivo en el disco
// temporal del proceso (os.tmpdir(), que en Vercel es /tmp).
//
// Nota importante: un Map en memoria NO sirve como fallback aquí — se probó en vivo y
// cada ruta de Next.js (pages/api/cron/scrape-jobs.js y pages/api/jobs/search.js) puede
// terminar con su propia instancia del módulo, así que un Map de un archivo no lo ve el
// otro. Un archivo compartido en disco sí funciona dentro del mismo proceso/contenedor.
// Aun así, en producción (contenedores serverless separados y de corta vida) esto sigue
// siendo best-effort: para que el cron y la búsqueda compartan caché de forma confiable
// en Vercel, se necesita Supabase configurado — sin eso, el buscador funciona igual,
// pero depende más de Jooble en vivo que de los resultados scrapeados de Computrabajo.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TTL_HOURS = Number(process.env.JOB_CACHE_TTL_HOURS) || 1;
const FILE_CACHE_PATH = path.join(os.tmpdir(), 'club-ingenieria-job-cache.json');

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function readFileStore() {
  try {
    return JSON.parse(fs.readFileSync(FILE_CACHE_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}
function writeFileStore(store) {
  try {
    fs.writeFileSync(FILE_CACHE_PATH, JSON.stringify(store));
  } catch (e) {
    console.error('No se pudo escribir la caché de archivo', e);
  }
}
function fileGet(key) {
  const entry = readFileStore()[key];
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}
function fileSet(key, data, ttlMs) {
  const store = readFileStore();
  store[key] = { data, expiresAt: Date.now() + ttlMs };
  writeFileStore(store);
}

function cacheKey({ carrera, experiencia, tipoEmpleo, ubicacion }) {
  return [carrera, experiencia, tipoEmpleo, ubicacion || 'Ecuador']
    .map((v) => String(v || '').trim().toLowerCase())
    .join('::');
}

async function readCache(filters) {
  const key = cacheKey(filters);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from('job_listings_cache')
      .select('resultados, actualizado_en')
      .eq('clave_busqueda', key)
      .maybeSingle();
    if (error) {
      console.error('No se pudo leer job_listings_cache', error);
    } else if (data) {
      const ageMs = Date.now() - new Date(data.actualizado_en).getTime();
      if (ageMs < TTL_HOURS * 3600000) return data.resultados;
    }
    return null;
  }

  return fileGet(key);
}

async function writeCache(filters, resultados) {
  const key = cacheKey(filters);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase
      .from('job_listings_cache')
      .upsert({ clave_busqueda: key, resultados, actualizado_en: new Date().toISOString() }, { onConflict: 'clave_busqueda' });
    if (error) console.error('No se pudo escribir job_listings_cache', error);
    return;
  }

  fileSet(key, resultados, TTL_HOURS * 3600000);
}

// Usado por el cron (pages/api/cron/scrape-jobs.js) para guardar los resultados
// scrapeados de Computrabajo por término de búsqueda, independiente de la caché de
// resultados combinados por filtro completo.
async function writeScrapedListings(keywords, ofertas) {
  const supabase = getSupabaseAdmin();
  const key = 'scraped::' + String(keywords).trim().toLowerCase();
  if (supabase) {
    const { error } = await supabase
      .from('job_listings_cache')
      .upsert({ clave_busqueda: key, resultados: ofertas, actualizado_en: new Date().toISOString() }, { onConflict: 'clave_busqueda' });
    if (error) console.error('No se pudo escribir listado scrapeado', error);
    return;
  }
  fileSet(key, ofertas, (Number(process.env.JOB_SCRAPER_CRON_HOURS) || 6) * 3600000);
}

async function readScrapedListings(keywords) {
  const supabase = getSupabaseAdmin();
  const key = 'scraped::' + String(keywords).trim().toLowerCase();
  if (supabase) {
    const { data, error } = await supabase
      .from('job_listings_cache')
      .select('resultados')
      .eq('clave_busqueda', key)
      .maybeSingle();
    if (error || !data) return [];
    return data.resultados || [];
  }
  return fileGet(key) || [];
}

module.exports = { readCache, writeCache, writeScrapedListings, readScrapedListings, cacheKey };
