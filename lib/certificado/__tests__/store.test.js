const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core');
const store = require('../store');

// Base de datos simulada en memoria con la parte mínima de la API de Supabase que usa store.js
function fakeDb() {
  const t = { kc_progreso: [], certificados: [] }; let seq = 0;
  const q = (name) => {
    let rows = t[name], filt = [], ord = null;
    const api = {
      select() { return api; },
      eq(c, v) { filt.push([c, v]); return api; },
      order(c) { ord = c; return api; },
      async maybeSingle() { const r = run(); return { data: r[0] || null, error: null }; },
      then(res) { return Promise.resolve({ data: run(), error: null }).then(res); },
      async insert(fila) {
        if (name === 'certificados' && t.certificados.some((c) => c.user_id === fila.user_id || c.codigo === fila.codigo)) return { error: { code: '23505' } };
        t[name].push({ ...fila }); return { error: null };
      },
    };
    function run() { let r = rows.filter((x) => filt.every(([c, v]) => x[c] === v)); if (ord) r = [...r].sort((a, b) => a[ord] - b[ord]); return r; }
    return api;
  };
  return { t, from: q, rpc: async () => ({ data: ++seq, error: null }) };
}

const par = core.generarPar();
process.env.CERT_SIGNING_PRIVATE_KEY = par.privada; process.env.CERT_SIGNING_PUBLIC_KEY = par.publica;

async function jugar(db, uid, hasta, seg = 150) {
  for (let n = 1; n <= hasta; n += 1) await store.registrarNivel(uid, { nivel: n, duracionSeg: seg, pistas: 1 });
}

test('el progreso exige orden y no duplica niveles', async () => {
  const db = fakeDb(); store._setAdminForTests(db);
  assert.equal((await store.registrarNivel('u1', { nivel: 2, duracionSeg: 100 })).ok, false);      // sin nivel 1
  assert.equal((await store.registrarNivel('u1', { nivel: 1, duracionSeg: 100 })).ok, true);
  const rep = await store.registrarNivel('u1', { nivel: 1, duracionSeg: 5 });
  assert.equal(rep.repetido, true); assert.equal(db.t.kc_progreso.length, 1); assert.equal(db.t.kc_progreso[0].duracion_seg, 100);
});

test('no se emite certificado con niveles incompletos', async () => {
  const db = fakeDb(); store._setAdminForTests(db);
  await jugar(db, 'u2', 30);
  const r = await store.emitirCertificado('u2', 'Ana Gómez');
  assert.equal(r.ok, false); assert.equal(r.status, 403); assert.deepEqual(r.faltan, [31]); assert.equal(db.t.certificados.length, 0);
});

test('con los 31 niveles se emite una sola vez (idempotente) y se verifica', async () => {
  const db = fakeDb(); store._setAdminForTests(db);
  await jugar(db, 'u3', 31);
  const a = await store.emitirCertificado('u3', '  ana   gómez ');
  assert.equal(a.ok, true); assert.equal(a.nuevo, true);
  assert.match(a.certificado.codigo, /^CLUB-CERT-\d{4}-0001$/); assert.equal(a.certificado.nombre, 'Ana Gómez');
  const b = await store.emitirCertificado('u3', 'Otro Nombre');
  assert.equal(b.nuevo, false); assert.equal(b.certificado.nombre, 'Ana Gómez'); assert.equal(db.t.certificados.length, 1);   // el nombre queda fijo
  const v = await store.verificarPublico(a.certificado.codigo);
  assert.equal(v.valido, true); assert.equal(v.nombre, 'Ana Gómez'); assert.equal('user_id' in v, false);
});

test('rechaza nombres inválidos antes de emitir', async () => {
  const db = fakeDb(); store._setAdminForTests(db); await jugar(db, 'u4', 31);
  assert.equal((await store.emitirCertificado('u4', 'X')).ok, false);
  assert.equal((await store.emitirCertificado('u4', 'Ana <script>')).ok, false);
  assert.equal(db.t.certificados.length, 0);
});

test('verificación detecta alteración, revocación y códigos inexistentes o mal formados', async () => {
  const db = fakeDb(); store._setAdminForTests(db); await jugar(db, 'u5', 31);
  const { certificado } = await store.emitirCertificado('u5', 'Luis Mora');
  db.t.certificados[0].nombre = 'Impostor Falso';                         // alguien altera el registro
  assert.equal((await store.verificarPublico(certificado.codigo)).valido, false);
  db.t.certificados[0].nombre = 'Luis Mora'; db.t.certificados[0].revocado = true; db.t.certificados[0].revocado_motivo = 'prueba';
  const rev = await store.verificarPublico(certificado.codigo);
  assert.equal(rev.valido, false); assert.equal(rev.revocado, true);
  assert.equal((await store.verificarPublico('CLUB-CERT-2026-9999')).encontrado, false);
  assert.equal((await store.verificarPublico("x' or 1=1 --")).encontrado, false);
});

test('tiempos imposibles no dan certificado', async () => {
  const db = fakeDb(); store._setAdminForTests(db); await jugar(db, 'u6', 31, 25);   // 31 × 25 s = 13 min
  assert.equal((await store.emitirCertificado('u6', 'Pedro Ruiz')).ok, false);
});
