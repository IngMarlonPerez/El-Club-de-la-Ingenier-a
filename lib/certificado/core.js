// Núcleo del certificado "Héroe del Club" (Kernel Cero). Funciones puras o casi puras: sin red,
// sin base de datos, para poder probarlas con node:test.
//
// Seguridad: la firma es Ed25519 con una clave PROPIA del Club (no la firma electrónica personal
// del fundador). Se firma una cadena canónica con código, nombre y fecha; cualquiera puede verificar
// con la clave pública. El PDF y la página /verificar/[codigo] solo muestran datos que pasan esa verificación.
const crypto = require('crypto');

const TOTAL_NIVELES = 31;
const MIN_SEG_POR_NIVEL = 20;      // un nivel resuelto en menos de esto no es plausible
const MIN_SEG_TOTAL = 45 * 60;     // los 31 niveles toman, como mínimo, este tiempo acumulado
const CODIGO_RE = /^CLUB-CERT-\d{4}-\d{4,6}$/;

/** Normaliza y valida el nombre que irá impreso. Devuelve { ok, nombre, error }. */
function validarNombre(raw) {
  const nombre = String(raw || '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (nombre.length < 3) return { ok: false, error: 'Escribe tu nombre y apellido (mínimo 3 letras).' };
  if (nombre.length > 70) return { ok: false, error: 'El nombre es demasiado largo (máximo 70 caracteres).' };
  // Solo letras latinas (el PDF usa tipografías latinas), espacios, apóstrofe, punto y guion.
  if (!/^[\p{Script=Latin}][\p{Script=Latin}\s.'’-]*$/u.test(nombre)) {
    return { ok: false, error: 'Usa letras del alfabeto latino (sin números ni símbolos).' };
  }
  if (!/\s/.test(nombre)) return { ok: false, error: 'Incluye al menos nombre y apellido.' };
  // Mayúscula inicial por palabra (el \b de JS no entiende letras con tilde, por eso el separador es explícito).
  const bonito = nombre.toLocaleLowerCase('es').replace(/(^|[\s'’-])(\p{L})/gu, (m, sep, l) => sep + l.toLocaleUpperCase('es'));
  return { ok: true, nombre: bonito };
}

/**
 * ¿El registro de progreso respalda un certificado? `niveles` = [{ nivel, duracion_seg }].
 * Exige los 31 niveles, sin repetidos, con tiempos individuales y total plausibles.
 */
function evaluarProgreso(niveles) {
  const por = new Map();
  for (const n of niveles || []) por.set(Number(n.nivel), Number(n.duracion_seg) || 0);
  const faltan = [];
  for (let i = 1; i <= TOTAL_NIVELES; i += 1) if (!por.has(i)) faltan.push(i);
  if (faltan.length) return { ok: false, motivo: `Faltan ${faltan.length} nivel(es) por completar.`, faltan };
  const rapidos = [...por.entries()].filter(([, s]) => s < MIN_SEG_POR_NIVEL).map(([n]) => n);
  if (rapidos.length > 3) return { ok: false, motivo: 'Los tiempos registrados no son coherentes con haber jugado cada nivel.', faltan: [] };
  const total = [...por.values()].reduce((a, b) => a + b, 0);
  if (total < MIN_SEG_TOTAL) return { ok: false, motivo: 'El tiempo total registrado es demasiado corto para los 31 niveles.', faltan: [] };
  return { ok: true, totalSeg: total, nivelesRapidos: rapidos.length };
}

/** Valida un evento de progreso entrante. `previos` = niveles ya guardados (números). */
function validarEventoNivel({ nivel, duracionSeg }, previos) {
  const n = Number(nivel);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_NIVELES) return { ok: false, error: 'Nivel inválido.' };
  const d = Math.round(Number(duracionSeg));
  if (!Number.isFinite(d) || d < 0 || d > 60 * 60 * 24 * 30) return { ok: false, error: 'Duración inválida.' };
  const set = new Set((previos || []).map(Number));
  if (n > 1 && !set.has(n - 1)) return { ok: false, error: 'Completa los niveles en orden.' };
  return { ok: true, nivel: n, duracionSeg: d };
}

function codigoDe(anio, secuencia) {
  return `CLUB-CERT-${anio}-${String(secuencia).padStart(4, '0')}`;
}
function codigoValido(c) { return CODIGO_RE.test(String(c || '')); }

/** Cadena canónica que se firma. No incluye datos privados (correo, user_id). */
function cadenaCanonica({ codigo, nombre, emitidoEn }) {
  return ['CLUB-CERT-V1', codigo, nombre, new Date(emitidoEn).toISOString().slice(0, 10)].join('|');
}
function huella(datos) {
  return crypto.createHash('sha256').update(cadenaCanonica(datos), 'utf8').digest('hex');
}

function cargarClavePrivada(b64OrPem) {
  if (!b64OrPem) return null;
  const pem = b64OrPem.includes('BEGIN') ? b64OrPem.replace(/\\n/g, '\n') : Buffer.from(b64OrPem, 'base64').toString('utf8');
  return crypto.createPrivateKey(pem);
}
function cargarClavePublica(b64OrPem) {
  if (!b64OrPem) return null;
  const pem = b64OrPem.includes('BEGIN') ? b64OrPem.replace(/\\n/g, '\n') : Buffer.from(b64OrPem, 'base64').toString('utf8');
  return crypto.createPublicKey(pem);
}
function firmar(datos, clavePrivada) {
  return crypto.sign(null, Buffer.from(cadenaCanonica(datos), 'utf8'), clavePrivada).toString('base64url');
}
function verificarFirma(datos, firmaB64u, clavePublica) {
  try {
    return crypto.verify(null, Buffer.from(cadenaCanonica(datos), 'utf8'), clavePublica, Buffer.from(String(firmaB64u), 'base64url'));
  } catch (e) { return false; }
}

/** Genera un par de claves Ed25519, en base64 de PEM (para variables de entorno). */
function generarPar() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return {
    privada: Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' })).toString('base64'),
    publica: Buffer.from(publicKey.export({ type: 'spki', format: 'pem' })).toString('base64'),
  };
}

module.exports = {
  TOTAL_NIVELES, MIN_SEG_POR_NIVEL, MIN_SEG_TOTAL,
  validarNombre, evaluarProgreso, validarEventoNivel, codigoDe, codigoValido, cadenaCanonica, huella,
  cargarClavePrivada, cargarClavePublica, firmar, verificarFirma, generarPar,
};
