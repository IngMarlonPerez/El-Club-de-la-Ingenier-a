// Cascada compartida de proveedores de IA (Groq → OpenRouter → NVIDIA) con presupuesto
// diario compartido vía Supabase. Extraído de pages/api/chat.js para que otros endpoints
// (ej. pages/api/jobs/analyze-cv.js) puedan reutilizar exactamente la misma lógica de
// fallback/cuota sin duplicarla.
const { createClient } = require('@supabase/supabase-js');

// Orden por generosidad real del plan gratuito (sin tarjeta), verificado ago/2026:
//  1. Groq      — 30 req/min, hasta ~14,400 req/día (varía por modelo), se renueva cada día.
//  2. OpenRouter — 20 req/min, 50 req/día sin fondear (sube a 1,000/día si algún día se carga
//     $10 de saldo, y ese límite alto queda para siempre aunque el saldo vuelva a $0).
//  3. NVIDIA NIM — 40 req/min, pero el "free tier" es un pozo fijo de ~1,000-5,000 créditos
//     TOTALES (no se renueva por día) — el menos sostenible de los tres para uso continuo.
const GROQ_DAILY_LIMIT = Number(process.env.GROQ_DAILY_LIMIT) || 500;
const OPENROUTER_DAILY_LIMIT = Number(process.env.OPENROUTER_DAILY_LIMIT) || 45;
const NVIDIA_DAILY_LIMIT = Number(process.env.NVIDIA_DAILY_LIMIT) || 300;

function todayInEcuador() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getTodayUsage(supabaseAdmin, today) {
  const usage = { groq: 0, openrouter: 0, nvidia: 0 };
  if (!supabaseAdmin) return usage;

  const { data, error } = await supabaseAdmin
    .from('ia_uso_diario')
    .select('proveedor, mensajes')
    .eq('fecha', today);

  if (error) {
    console.error('No se pudo leer el uso diario de IA', error);
    return usage;
  }
  for (const row of data || []) usage[row.proveedor] = row.mensajes;
  return usage;
}

async function bumpUsage(supabaseAdmin, today, proveedor) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.rpc('increment_ia_uso', { p_fecha: today, p_proveedor: proveedor });
  if (error) console.error('No se pudo registrar el uso de IA', error);
}

// ---- Proveedores (los tres exponen una API estilo OpenAI chat completions) ----
async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      // llama-3.1-8b-instant fue retirado del catálogo de Groq (verificado ago/2026 vía
      // GET /v1/models: ya no aparece). gpt-oss-20b es el reemplazo directo en velocidad/
      // costo. Es un modelo "razonador": sin reasoning_effort:"low" gasta el presupuesto
      // de tokens pensando y devuelve la respuesta vacía (probado en vivo) — con "low" y
      // suficiente margen de tokens responde normal.
      model: 'openai/gpt-oss-20b',
      reasoning_effort: 'low',
      messages,
      temperature: 0.6,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

async function callOpenRouter(messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://elclubdelaingenieria.dpdns.org',
      'X-Title': 'El Club de la Ingeniería',
    },
    body: JSON.stringify({
      model: 'openrouter/free', // auto-router: elige entre los modelos gratuitos disponibles ese momento
      messages,
      temperature: 0.6,
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

async function callNvidia(messages) {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      // nvidia/llama-3.1-nemotron-70b-instruct sigue en el catálogo (GET /v1/models lo
      // lista) pero su "function" de NIM ya no está provisionada para esta cuenta (404
      // "Function ... Not found for account", verificado ago/2026). meta/llama-3.1-8b-
      // instruct sí responde con esta cuenta — probado en vivo, HTTP 200 en ~150ms.
      model: 'meta/llama-3.1-8b-instruct',
      messages,
      temperature: 0.6,
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    throw new Error(`NVIDIA ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

// Llama al primer proveedor disponible dentro de su cuota diaria, en orden de generosidad.
// `messages` debe incluir ya el mensaje de sistema si hace falta uno (esta función no
// asume ningún system prompt propio, así la pueden usar tanto el chat de INGenioso como
// el analizador de CV con sus propios prompts). Lanza un Error con `.status` (429/502)
// listo para responder directo en un endpoint si no hay proveedor disponible.
async function completeChat(messages) {
  const supabaseAdmin = getSupabaseAdmin();
  const today = todayInEcuador();
  const usage = await getTodayUsage(supabaseAdmin, today);

  const groqAvailable = Boolean(process.env.GROQ_API_KEY) && usage.groq < GROQ_DAILY_LIMIT;
  const openrouterAvailable = Boolean(process.env.OPENROUTER_API_KEY) && usage.openrouter < OPENROUTER_DAILY_LIMIT;
  const nvidiaAvailable = Boolean(process.env.NVIDIA_API_KEY) && usage.nvidia < NVIDIA_DAILY_LIMIT;

  if (!groqAvailable && !openrouterAvailable && !nvidiaAvailable) {
    const err = new Error('Hoy ya usamos toda la cuota gratuita del asistente 🙏 Vuelve mañana, o escríbenos por WhatsApp mientras tanto.');
    err.status = 429;
    throw err;
  }

  let reply;
  let usedProvider;

  if (groqAvailable) {
    try {
      reply = await callGroq(messages);
      usedProvider = 'groq';
    } catch (err) {
      console.error('Groq falló, se intentará con OpenRouter si está disponible', err);
    }
  }

  if (!reply && openrouterAvailable) {
    try {
      reply = await callOpenRouter(messages);
      usedProvider = 'openrouter';
    } catch (err) {
      console.error('OpenRouter falló, se intentará con NVIDIA si está disponible', err);
    }
  }

  if (!reply && nvidiaAvailable) {
    try {
      reply = await callNvidia(messages);
      usedProvider = 'nvidia';
    } catch (err) {
      console.error('NVIDIA también falló', err);
    }
  }

  if (!reply) {
    const err = new Error('El asistente no está disponible en este momento.');
    err.status = 502;
    throw err;
  }

  if (usedProvider) await bumpUsage(supabaseAdmin, today, usedProvider);

  return reply;
}

module.exports = { completeChat };
