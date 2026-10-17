const test = require('node:test');
const assert = require('node:assert/strict');
const { maskPII } = require('../maskPII');

test('oculta correos y teléfonos móviles de Ecuador', () => {
  const r = maskPII('Contacto: malmachi@unemi.edu.ec · 0986023149 · +593 98 602 3149');
  assert.ok(!r.texto.includes('malmachi@'));
  assert.ok(!r.texto.includes('0986023149'));
  assert.ok(!/602\s?3149/.test(r.texto));
  assert.equal(r.conteos.correo, 1);
  assert.equal(r.conteos.telefono, 2);
});

test('oculta cédula (10 dígitos) y RUC (13 dígitos) sin confundirlos con teléfonos', () => {
  const r = maskPII('Cédula 0928476464 RUC 0928476464001 Tel 0986023149');
  assert.ok(!r.texto.includes('0928476464'));
  assert.equal(r.conteos.cedula, 2);
  assert.equal(r.conteos.telefono, 1);
});

test('oculta fecha de nacimiento, dirección y estado civil etiquetados', () => {
  const r = maskPII('Fecha de nacimiento: 16 de enero de 1992\nDirección: Barrio María Auxiliadora 1 calle 304\nEstado civil: Divorciado');
  assert.ok(!r.texto.includes('1992'));
  assert.ok(!r.texto.includes('Auxiliadora'));
  assert.ok(!r.texto.includes('Divorciado'));
});

test('oculta enlaces de perfiles personales pero conserva habilidades y empresas', () => {
  const r = maskPII('github.com/IngMarlonPerez linkedin.com/in/marlon-perez Desarrollador React en Ethos IA');
  assert.ok(!r.texto.includes('IngMarlonPerez'));
  assert.ok(r.texto.includes('React'));
  assert.ok(r.texto.includes('Ethos IA'));
});

test('no altera texto sin datos personales y reporta cero', () => {
  const r = maskPII('Next.js 16 y Supabase con 11 políticas RLS y 58 commits');
  assert.equal(r.total, 0);
  assert.equal(r.texto, 'Next.js 16 y Supabase con 11 políticas RLS y 58 commits');
});

test('tolera entradas vacías o no string', () => {
  assert.equal(maskPII(undefined).texto, '');
  assert.equal(maskPII(null).total, 0);
});
