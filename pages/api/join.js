import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const BodySchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  correo: z.string().trim().email().max(200),
  area: z.string().trim().min(1).max(80).optional().default(''),
  mensaje: z.string().trim().max(1000).optional().default(''),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar la Política de Tratamiento de Datos Personales.' }),
  }),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
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
    const message = parsed.error.issues[0]?.message || 'Solicitud inválida.';
    return res.status(400).json({ error: message });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas en el entorno.');
    return res.status(500).json({ error: 'El formulario no está disponible todavía. Vuelve pronto.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { nombre, correo, area, mensaje, consentimiento } = parsed.data;

  const { error } = await supabaseAdmin.from('solicitudes').insert({
    nombre,
    correo,
    area_interes: area,
    mensaje,
    consentimiento,
  });

  if (error) {
    console.error('Error insertando solicitud en Supabase', error);
    return res.status(502).json({ error: 'No pudimos guardar tu solicitud. Intenta de nuevo en un momento.' });
  }

  return res.status(200).json({ ok: true });
}
