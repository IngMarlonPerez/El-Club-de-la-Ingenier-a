const test = require('node:test');
const assert = require('node:assert/strict');
const c = require('../core');

const niveles = (n, seg = 120) => Array.from({ length: n }, (_, i) => ({ nivel: i + 1, duracion_seg: seg }));

test('validarNombre acepta nombres reales y normaliza mayúsculas/espacios', () => {
  assert.deepEqual(c.validarNombre('  maría   josé  pérez '), { ok: true, nombre: 'María José Pérez' });
  assert.equal(c.validarNombre("O'Brien Núñez").ok, true);
});
test('validarNombre rechaza vacío, un solo nombre, números, símbolos y alfabetos no latinos', () => {
  ['', 'Ana', 'Ana 123 Pérez', 'Ana <b>Pérez</b>', '王小明 李'].forEach((x) => assert.equal(c.validarNombre(x).ok, false, x));
  assert.equal(c.validarNombre('a'.repeat(80) + ' b').ok, false);
});

test('evaluarProgreso exige los 31 niveles y tiempos plausibles', () => {
  assert.equal(c.evaluarProgreso(niveles(31, 150)).ok, true);
  const incompleto = c.evaluarProgreso(niveles(30));
  assert.equal(incompleto.ok, false); assert.deepEqual(incompleto.faltan, [31]);
  assert.equal(c.evaluarProgreso(niveles(31, 5)).ok, false);          // demasiado rápido
  assert.equal(c.evaluarProgreso(niveles(31, 60)).ok, false);         // 31 min < 45 min en total
  assert.equal(c.evaluarProgreso([]).ok, false);
});

test('validarEventoNivel exige orden y rangos', () => {
  assert.equal(c.validarEventoNivel({ nivel: 1, duracionSeg: 90 }, []).ok, true);
  assert.equal(c.validarEventoNivel({ nivel: 3, duracionSeg: 90 }, [1]).ok, false);
  assert.equal(c.validarEventoNivel({ nivel: 2, duracionSeg: 90 }, [1]).ok, true);
  assert.equal(c.validarEventoNivel({ nivel: 32, duracionSeg: 90 }, []).ok, false);
  assert.equal(c.validarEventoNivel({ nivel: 1, duracionSeg: -4 }, []).ok, false);
});

test('códigos: formato y validación', () => {
  assert.equal(c.codigoDe(2026, 7), 'CLUB-CERT-2026-0007');
  assert.equal(c.codigoValido('CLUB-CERT-2026-0007'), true);
  ['', 'ETHOS-CERT-2026-0001', "CLUB-CERT-2026-1'; drop", 'CLUB-CERT-26-1'].forEach((x) => assert.equal(c.codigoValido(x), false, x));
});

test('firma Ed25519: firma y verifica; detecta cualquier alteración', () => {
  const par = c.generarPar();
  const priv = c.cargarClavePrivada(par.privada), pub = c.cargarClavePublica(par.publica);
  const datos = { codigo: 'CLUB-CERT-2026-0001', nombre: 'María Pérez', emitidoEn: '2026-10-17T10:00:00Z' };
  const f = c.firmar(datos, priv);
  assert.equal(c.verificarFirma(datos, f, pub), true);
  assert.equal(c.verificarFirma({ ...datos, nombre: 'Otra Persona' }, f, pub), false);
  assert.equal(c.verificarFirma({ ...datos, codigo: 'CLUB-CERT-2026-0002' }, f, pub), false);
  assert.equal(c.verificarFirma(datos, 'AAAA', pub), false);
  assert.equal(c.verificarFirma(datos, f, c.cargarClavePublica(c.generarPar().publica)), false); // otra clave
});

test('la huella es estable y depende solo de código, nombre y fecha', () => {
  const a = { codigo: 'CLUB-CERT-2026-0001', nombre: 'Ana Gómez', emitidoEn: '2026-10-17T01:00:00Z' };
  assert.equal(c.huella(a), c.huella({ ...a, emitidoEn: '2026-10-17T23:59:00Z' }));
  assert.notEqual(c.huella(a), c.huella({ ...a, nombre: 'Ana Gomez' }));
  assert.match(c.huella(a), /^[0-9a-f]{64}$/);
});
