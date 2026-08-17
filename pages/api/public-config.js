// Config pública para el cliente Supabase del navegador.
// SUPABASE_URL y SUPABASE_ANON_KEY son seguras de exponer (igual que un publishable
// key): la seguridad real la da RLS en la base de datos, no el secreto de esta key.
//
// Nota sobre el runtime: se probó "edge" (arranque más rápido que una función
// serverless de Node fría) para atacar los 4275 ms que reportó Lighthouse en esta
// llamada, pero Next.js 16 lo marca como deprecado en el build ("Learn more:
// nextjs.org/docs/messages/edge-runtime-deprecated") — se revirtió a Node estándar
// para no depender de una API que Next.js va a quitar. La mejora real que sí se queda:
// cachear la respuesta de forma agresiva (estos valores casi nunca cambian), para que
// sea la CDN/el navegador quien responda en la mayoría de visitas, no la función.
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY no configuradas en el entorno.');
    return res.status(500).json({ error: 'El servicio de cuentas no está configurado todavía.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  return res.status(200).json({ supabaseUrl, supabaseAnonKey });
}
