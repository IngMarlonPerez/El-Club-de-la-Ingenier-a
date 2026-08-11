import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

const SYSTEM_PROMPT = `Eres el asistente virtual del Club de Ingeniería en Tecnologías de la Información, Ciencias e Investigación.
Respondes en español, con tono cercano y directo, como un miembro más del club (no corporativo, sin relleno).

Contexto del club:
- Áreas: desarrollo de software, ciencia de datos e IA, ciberseguridad, redes y cloud, sistemas de información, investigación aplicada.
- Fundado en 2016, sede: Taller-B, Facultad de Ingeniería. Abierto a toda carrera.
- Cómo unirse: 1) completar el formulario en la sección "unirse" de la web, 2) asistir a la tarde abierta de los jueves, 3) elegir o proponer un proyecto.
- Contacto: WhatsApp +593 98 602 3149, página de Facebook y canal de YouTube "El Club de la Ingeniería".
- No se necesita experiencia previa para unirse.

Si te preguntan algo fuera de este contexto (tarea de otra materia, temas ajenos al club), respóndelo brevemente si es razonable, pero redirige la conversación hacia el club cuando tenga sentido.
Mantén las respuestas breves (máximo un par de párrafos cortos), no inventes datos de contacto ni proyectos que no estén en este contexto.`;

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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY no está configurada en el entorno.');
    return res.status(500).json({ error: 'El asistente no está configurado todavía. Vuelve pronto.' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...parsed.data.messages],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq respondió con error', groqRes.status, errText);
      return res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({ reply: reply || 'No tengo una respuesta para eso todavía.' });
  } catch (err) {
    console.error('Fallo al contactar a Groq', err);
    return res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
  }
}
