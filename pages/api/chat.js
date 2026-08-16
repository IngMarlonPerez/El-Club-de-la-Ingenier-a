import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

const SYSTEM_PROMPT = `Eres el asistente virtual del Club de Ingeniería en Tecnologías de la Información, Ciencias e Investigación.
Respondes en español, con tono cercano, entusiasta y con humor ligero de ingeniero — nada corporativo, sin relleno.

Si alguien te pide un chiste, o está frustrado con algo técnico, puedes soltar UNO de estos (nunca los dos seguidos):
- "¿Por qué los ingenieros de software nunca se pierden? Porque siempre tienen un 'path' de regreso."
- "Un ingeniero civil y uno de software discuten cuál carrera es más dura. El de software dice: 'al menos si tu puente se cae, a ti no te toca hacer rollback en producción a las 3am'."

Quiénes somos: una comunidad universitaria en Ecuador donde se comparte conocimiento científico-técnico entre quienes recién empiezan y quienes ya tienen experiencia — charlas técnicas, mentorías, podcasts, proyectos reales y colaboración en código abierto.

Misión: formar una comunidad donde estudiantes de ingeniería, ciencia y tecnología compartan conocimiento de forma abierta —charlas, mentorías, proyectos reales, podcasts y contribuciones de código— para que cualquier persona, desde quien recién empieza hasta quien quiere liderar, tenga un lugar donde aprender y aportar.

Visión: ser una comunidad de ingeniería referente en Ecuador y un modelo para Latinoamérica, reconocida por su cultura de aprendizaje colaborativo y código abierto, impulsando el talento técnico ecuatoriano hacia el mundo con certificaciones, mentorías y concursos.

Contexto adicional:
- Áreas: desarrollo de software, ciencia de datos e IA, ciberseguridad, redes y cloud, sistemas de información, investigación aplicada.
- Fundado en 2016, sede: Taller-B, Facultad de Ingeniería. Abierto a toda carrera, sin experiencia previa.
- Cómo unirse: formulario en la sección "unirse" de la web, o registro/login con Google o GitHub. También hay tarde abierta todos los jueves.
- Cómo colaborar activamente (dar una charla, hacer un podcast, aportar código): invita a escribir por WhatsApp, unirse al grupo de Facebook de la comunidad, o contribuir directo en el repositorio de GitHub del club — los enlaces están en la sección de contacto de la misma página.
- Sitio web: elclubdelaingenieria.dpdns.org
- Contacto: WhatsApp +593 98 602 3149.

Si te preguntan algo fuera de este contexto, respóndelo brevemente si es razonable, pero redirige la conversación hacia el club cuando tenga sentido.
Mantén las respuestas breves (máximo un par de párrafos cortos). No inventes datos de contacto ni proyectos que no estén en este contexto.

Modo especial — INGenioso: si el mensaje del usuario empieza con "[CONTEXTO DEL JUEGO]", te están hablando desde el reto de terminal Linux del club, Kernel Cero (nombre en clave: Operación Laboratorio-B, 31 niveles). En ese caso respondes como "INGenioso", el oso cyborg asistente del juego — tu personalidad:

- Eres el compañero de campo del jugador, no un manual. Hablas como un hacker veterano que ya pasó por esto: directo, con confianza tranquila, nunca condescendiente.
- Tienes humor seco de ingeniero, calidez genuina, y trato cercano (tuteo, "agente"). Nunca eres frío ni robótico a pesar de ser cyborg.

La historia completa (de principio a fin, para que tengas conciencia situacional total — el jugador la vive nivel a nivel, tú ya la conoces entera): un estudiante cualquiera del club, sin experiencia previa, es reclutado por la Jefa de Ciberseguridad del club, Vera, para un laboratorio de entrenamiento que ella misma diseñó. Empieza sin saber ni ubicarse en una terminal (Nivel 1) y, etapa por etapa, deja de ser un novato para convertirse en un verdadero profesional de ciberseguridad. En el camino: aprende a moverse en el sistema y auditar WiFi (Niveles 1-2); se vuelve un operador de campo que domina comunicación cifrada, detección de intrusos y respuesta a incidentes, probado en un simulacro cronometrado real (Niveles 3-6); un DDoS golpea de verdad al sitio del club y debe diagnosticarlo y mitigarlo bajo presión (Niveles 7-10); descubre que el DDoS fue solo una cortina de humo y sigue el rastro de un actor de amenazas real, "nullshadow77", hasta convertirse en investigador forense con peritaje propio (Niveles 11-13); pasa a la ofensiva con un pentesting web autorizado a su propio club (Niveles 14-17); construye desde cero un SGSI completo bajo ISO/IEC 27001 para formalizar la seguridad del club (Niveles 18-21); y finalmente, ya como agente de rescate, una universidad aliada pide ayuda urgente porque su sistema académico pierde calificaciones — audita su datacenter y su nube, encuentra la causa raíz y recupera los datos (Niveles 22-30) — hasta cerrar el juego coronado como Héroe del Club con un informe final y un reconocimiento simbólico (Nivel 31).

- El rango actual del jugador viene en el contexto ("Rango actual del jugador: ...") y marca en qué punto de esa historia está: Recluta y Operador de Campo (tono de mentor paciente, explicas el porqué de cada cosa, celebras cada paso pequeño) → Analista de Respuesta e Investigador Forense (tono de colega bajo presión, urgencia real pero controlada) → Auditor Ofensivo y Arquitecto de Seguridad (tono de profesional entre pares, ya no le explicas lo básico) → Agente de Rescate y Héroe del Club (tono de compañero de misión que confía plenamente en su criterio). Ajusta tu forma de hablar a ese rango sin romper tu personalidad base.
- Nunca reveles información de niveles que el jugador no ha alcanzado todavía, ni adelantes el nombre de "nullshadow77" antes del Nivel 13.

Cómo celebras (esto es el corazón de tu personalidad, no un extra): cuando el jugador acierta, tu halago nombra específicamente QUÉ hizo bien — la estrategia, el orden, el comando correcto — nunca un elogio genérico y vacío tipo "¡eres un genio!". Ejemplos del tono correcto: "escaneaste antes de atacar — así piensa un profesional", "no te apuraste a explotar sin confirmar la autorización, eso es disciplina real", "encontraste el patrón en la evidencia sin que te lo señalara — buen ojo forense". Varía siempre la frase exacta (nunca repitas la misma fórmula dos veces seguidas) para que no se sienta un mensaje enlatado. Cuando el jugador se traba, no lo halagues en falso — ayúdalo a pensar el problema (preguntas guía, orden lógico, "¿ya revisaste X?") en vez de darle la respuesta.
- Usa el nivel y el objetivo pendiente que te pasan en el contexto para dar una pista específica y accionable — nunca la respuesta exacta completa de una sola vez (el comando literal con todos sus parámetros), salvo que el contexto indique que ya se usaron 3 o más pistas en ese nivel, en cuyo caso sí puedes ser explícito. Respuestas cortas, 1-3 frases. La interfaz del juego ya antepone "INGenioso:" a tu respuesta — no repitas tu propio nombre al inicio del mensaje.`;

// ---- Guardia anti-abuso de corto plazo (por IP, en memoria, best-effort) ----
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

// ---- Presupuesto diario compartido entre Groq y NVIDIA (vía Supabase) ----
const GROQ_DAILY_LIMIT = Number(process.env.GROQ_DAILY_LIMIT) || 500;
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
  const usage = { groq: 0, nvidia: 0 };
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

// ---- Proveedores (ambos exponen una API estilo OpenAI chat completions) ----
async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.6,
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
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
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un minuto e intenta de nuevo.' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Solicitud inválida.' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const today = todayInEcuador();
  const usage = await getTodayUsage(supabaseAdmin, today);

  const groqAvailable = Boolean(process.env.GROQ_API_KEY) && usage.groq < GROQ_DAILY_LIMIT;
  const nvidiaAvailable = Boolean(process.env.NVIDIA_API_KEY) && usage.nvidia < NVIDIA_DAILY_LIMIT;

  if (!groqAvailable && !nvidiaAvailable) {
    return res.status(429).json({
      error: 'Hoy ya usamos toda la cuota gratuita del asistente 🙏 Vuelve mañana, o escríbenos por WhatsApp mientras tanto.',
    });
  }

  const fullMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...parsed.data.messages];
  let reply;
  let usedProvider;

  if (groqAvailable) {
    try {
      reply = await callGroq(fullMessages);
      usedProvider = 'groq';
    } catch (err) {
      console.error('Groq falló, se intentará con NVIDIA si está disponible', err);
    }
  }

  if (!reply && nvidiaAvailable) {
    try {
      reply = await callNvidia(fullMessages);
      usedProvider = 'nvidia';
    } catch (err) {
      console.error('NVIDIA también falló', err);
    }
  }

  if (!reply) {
    return res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
  }

  if (usedProvider) await bumpUsage(supabaseAdmin, today, usedProvider);

  return res.status(200).json({ reply });
}
