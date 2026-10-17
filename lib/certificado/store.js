// Acceso a datos del certificado (solo servidor, con service role). Toda validación de negocio vive
// en core.js; aquí solo se conecta con Supabase.
const { createClient } = require('@supabase/supabase-js');
const core = require('./core');

let _override = null;
function _setAdminForTests(fake) { _override = fake; }

function admin() {
  if (_override) return _override;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function claves() {
  const priv = core.cargarClavePrivada(process.env.CERT_SIGNING_PRIVATE_KEY);
  const pub = core.cargarClavePublica(process.env.CERT_SIGNING_PUBLIC_KEY);
  return { priv, pub };
}
function configurado() {
  try { const { priv, pub } = claves(); return Boolean(admin() && priv && pub); } catch (e) { return false; }
}

/** Usuario autenticado a partir de "Authorization: Bearer <token>". */
async function usuarioDe(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  const sb = admin();
  if (!m || !sb) return null;
  const { data, error } = await sb.auth.getUser(m[1]);
  if (error || !data || !data.user) return null;
  return data.user;
}

/** Nombre sugerido a partir de los metadatos de Google/GitHub. */
function nombreSugerido(user) {
  const md = (user && user.user_metadata) || {};
  return String(md.full_name || md.name || '').trim();
}

async function nivelesDe(sb, userId) {
  const { data, error } = await sb.from('kc_progreso').select('nivel, duracion_seg, pistas').eq('user_id', userId).order('nivel');
  if (error) throw error;
  return data || [];
}

async function registrarNivel(userId, evento) {
  const sb = admin();
  const previos = await nivelesDe(sb, userId);
  const v = core.validarEventoNivel(evento, previos.map((p) => p.nivel));
  if (!v.ok) return { ok: false, error: v.error, status: 400 };
  const pistas = Math.max(0, Math.min(500, Math.round(Number(evento.pistas) || 0)));
  const ya = previos.find((p) => p.nivel === v.nivel);
  if (ya) return { ok: true, repetido: true, completados: previos.length };   // el primer registro manda
  const { error } = await sb.from('kc_progreso').insert({ user_id: userId, nivel: v.nivel, duracion_seg: v.duracionSeg, pistas });
  if (error) throw error;
  return { ok: true, repetido: false, completados: previos.length + 1 };
}

async function certificadoDe(userId) {
  const { data, error } = await admin().from('certificados').select('codigo, nombre, emitido_en, revocado').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function emitirCertificado(userId, nombreRaw) {
  const sb = admin();
  const existente = await certificadoDe(userId);
  if (existente) return { ok: true, nuevo: false, certificado: existente };

  const nom = core.validarNombre(nombreRaw);
  if (!nom.ok) return { ok: false, status: 400, error: nom.error };

  const niveles = await nivelesDe(sb, userId);
  const ev = core.evaluarProgreso(niveles);
  if (!ev.ok) return { ok: false, status: 403, error: ev.motivo, faltan: ev.faltan };

  const { priv } = claves();
  if (!priv) return { ok: false, status: 503, error: 'El emisor de certificados no está configurado todavía.' };

  const { data: seq, error: eSeq } = await sb.rpc('siguiente_secuencia_certificado');
  if (eSeq) throw eSeq;
  const emitidoEn = new Date().toISOString();
  const codigo = core.codigoDe(new Date(emitidoEn).getUTCFullYear(), seq);
  const datos = { codigo, nombre: nom.nombre, emitidoEn };
  const fila = {
    codigo, user_id: userId, nombre: nom.nombre, emitido_en: emitidoEn,
    huella: core.huella(datos), firma: core.firmar(datos, priv),
    resumen: { niveles: niveles.length, total_seg: ev.totalSeg, pistas: niveles.reduce((a, n) => a + (n.pistas || 0), 0) },
  };
  const { error } = await sb.from('certificados').insert(fila);
  if (error) {
    // carrera: otro request lo creó primero
    const otra = await certificadoDe(userId);
    if (otra) return { ok: true, nuevo: false, certificado: otra };
    throw error;
  }
  return { ok: true, nuevo: true, certificado: { codigo, nombre: nom.nombre, emitido_en: emitidoEn, revocado: false } };
}

/** Verificación pública: devuelve solo lo imprescindible (sin correo ni user_id). */
async function verificarPublico(codigoRaw) {
  if (!core.codigoValido(codigoRaw)) return { encontrado: false, motivo: 'formato' };
  const sb = admin();
  if (!sb) return { error: 'no_configurado' };
  const { data, error } = await sb.from('certificados').select('codigo, nombre, emitido_en, firma, revocado, revocado_motivo').eq('codigo', codigoRaw).maybeSingle();
  if (error) throw error;
  if (!data) return { encontrado: false, motivo: 'inexistente' };
  const { pub } = claves();
  const firmaValida = pub ? core.verificarFirma({ codigo: data.codigo, nombre: data.nombre, emitidoEn: data.emitido_en }, data.firma, pub) : false;
  return {
    encontrado: true,
    valido: firmaValida && !data.revocado,
    firmaValida,
    revocado: data.revocado,
    revocadoMotivo: data.revocado ? data.revocado_motivo || null : null,
    codigo: data.codigo, nombre: data.nombre, emitidoEn: data.emitido_en,
  };
}

module.exports = { _setAdminForTests, admin, configurado, claves, usuarioDe, nombreSugerido, nivelesDe, registrarNivel, certificadoDe, emitirCertificado, verificarPublico };
