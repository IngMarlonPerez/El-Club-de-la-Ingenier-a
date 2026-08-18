import { z } from 'zod';
import { completeChat } from '../../../lib/ai/complete';
import { createRateLimiter, getClientIp } from '../../../lib/rateLimit';

// Límite más estricto que la búsqueda normal (6/min en vez de 20/min): cada análisis
// consume una llamada real a la cuota diaria compartida de IA, no es gratis como leer caché.
const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 6, scope: 'analyze-cv' });

const BodySchema = z.object({
  // El texto ya viene extraído en el navegador (pdf.js) -- este endpoint nunca recibe
  // el PDF en sí, solo texto plano, recortado del lado del cliente a ~6000 caracteres.
  textoCv: z.string().trim().min(30, 'El texto extraído del CV es muy corto -- ¿el PDF tiene texto real, o es una imagen escaneada?').max(8000),
});

const EXPERIENCIA_VALUES = ['sin_experiencia', '1_2_anios', '3_5_anios', '5_mas_anios'];
const TIPO_EMPLEO_VALUES = ['tiempo_completo', 'medio_tiempo', 'freelance', 'remoto', 'practicas'];

function normalizeEnum(value, allowed, fallback) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim().toLowerCase();
  return allowed.includes(v) ? v : fallback;
}

const SYSTEM_PROMPT = `Eres un analista de reclutamiento. Vas a leer el texto extraído de un currículum (CV) en PDF y devolver ÚNICAMENTE un objeto JSON válido, sin explicación, sin markdown, sin texto antes ni después, con exactamente estas claves:

{
  "carrera": "string corto (2-6 palabras) con la carrera o profesión principal de la persona, en español, apto para buscar ofertas de empleo (ej. 'Ingeniería en Sistemas', 'Marketing Digital', 'Contabilidad')",
  "experiencia": "una de estas 4 opciones exactas según los años de experiencia laboral que se noten en el CV: sin_experiencia | 1_2_anios | 3_5_anios | 5_mas_anios",
  "tipoEmpleo": "una de estas 5 opciones exactas, la que mejor encaje con el perfil o lo que busca la persona: tiempo_completo | medio_tiempo | freelance | remoto | practicas",
  "habilidadesClave": ["lista de 4 a 8 habilidades o tecnologías concretas mencionadas en el CV, cada una una palabra o frase corta"],
  "resumenPerfil": "1-2 frases resumiendo el perfil profesional, en español, tono neutral"
}

Si el texto no parece un CV real o tiene poca información, igual devuelve el JSON con tu mejor estimación razonable -- nunca devuelvas texto fuera del JSON.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  if (await isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Demasiados análisis seguidos. Espera un minuto e intenta de nuevo.' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Revisa el texto del CV.' });
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parsed.data.textoCv },
  ];

  let raw;
  try {
    raw = await completeChat(messages);
  } catch (err) {
    return res.status(err.status || 502).json({ error: err.message });
  }

  // El modelo a veces envuelve el JSON en fences de markdown pese a la instrucción --
  // se extrae el primer bloque {...} como red de seguridad antes de parsear.
  const match = raw.match(/\{[\s\S]*\}/);
  let data;
  try {
    data = JSON.parse(match ? match[0] : raw);
  } catch (err) {
    return res.status(502).json({ error: 'No pudimos interpretar el análisis del CV. Intenta de nuevo.' });
  }

  const carrera = typeof data.carrera === 'string' ? data.carrera.trim().slice(0, 80) : '';
  if (!carrera) {
    return res.status(502).json({ error: 'No pudimos identificar una carrera o profesión en el CV. Intenta con el formulario manual.' });
  }

  const habilidadesClave = Array.isArray(data.habilidadesClave)
    ? data.habilidadesClave.filter((h) => typeof h === 'string' && h.trim()).map((h) => h.trim()).slice(0, 8)
    : [];

  return res.status(200).json({
    carrera,
    experiencia: normalizeEnum(data.experiencia, EXPERIENCIA_VALUES, 'sin_experiencia'),
    tipoEmpleo: normalizeEnum(data.tipoEmpleo, TIPO_EMPLEO_VALUES, 'tiempo_completo'),
    habilidadesClave,
    resumenPerfil: typeof data.resumenPerfil === 'string' ? data.resumenPerfil.trim().slice(0, 300) : '',
  });
}
