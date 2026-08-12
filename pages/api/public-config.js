// Config pública para el cliente Supabase del navegador.
// SUPABASE_URL y SUPABASE_ANON_KEY son seguras de exponer (igual que un publishable
// key): la seguridad real la da RLS en la base de datos, no el secreto de esta key.
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

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ supabaseUrl, supabaseAnonKey });
}
