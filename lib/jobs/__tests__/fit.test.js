const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluarAjuste, extraerRequisitos } = require('../fit');

const OFERTA = `Desarrollador junior. Conocimientos requeridos: React y TypeScript, JWT, HTML y CSS, SQL, Git, Postman.
Responsabilidades: documentar y realizar pruebas. Mínimo un año de experiencia. Estudiante de últimos semestres.`;

test('extrae requisitos del léxico con peso mayor en la zona de conocimientos', () => {
  const r = extraerRequisitos(OFERTA);
  const react = r.find((x) => x.termino === 'react');
  assert.equal(react.peso, 2);
  assert.ok(r.find((x) => x.termino === 'typescript'));
});

test('calcula ajuste con evidencia del CV vs solo habilidad vs falta', () => {
  const perfil = { cvTexto: 'Proyecto con React 19 y Next.js, base de datos SQL y Git', habilidades: ['HTML', 'CSS'], carrera: 'Ingeniería en TI' };
  const r = evaluarAjuste(perfil, OFERTA);
  const nivel = (t) => r.requisitos.find((x) => x.termino === t).nivel;
  assert.equal(nivel('react'), 'cv');
  assert.equal(nivel('sql'), 'cv');
  assert.equal(nivel('html'), 'habilidad');
  assert.equal(nivel('typescript'), 'falta');
  assert.ok(r.brechas.some((b) => b.termino === 'typescript'));
  assert.ok(r.ajuste > 0 && r.ajuste < 100);
});

test('detecta filtros: años de experiencia y admisión de estudiantes', () => {
  const r = evaluarAjuste({ cvTexto: 'react' }, OFERTA);
  assert.ok(r.filtros.some((f) => /1|un/.test(f) && /experiencia/.test(f)));
  assert.ok(r.filtros.some((f) => /estudiantes/.test(f)));
});

test('con poco detalle no inventa un porcentaje', () => {
  const r = evaluarAjuste({ cvTexto: 'react' }, 'Auxiliar de bodega');
  assert.equal(r.ajuste, null);
  assert.equal(r.decision, 'SIN_DETALLE');
});

test('reconoce abreviaturas (JS → javascript)', () => {
  const r = evaluarAjuste({ cvTexto: 'Trabajo con JavaScript, node.js y sql' }, 'Requisitos: JS, Node.js, SQL, Git');
  assert.equal(r.requisitos.find((x) => x.termino === 'node.js').nivel, 'cv');
});

test('las decisiones respetan los umbrales', () => {
  const alto = evaluarAjuste({ cvTexto: 'react typescript sql git docker' }, 'Requisitos: React, TypeScript, SQL, Git, Docker');
  assert.equal(alto.decision, 'POSTULAR');
  const bajo = evaluarAjuste({ cvTexto: 'atencion al cliente' }, 'Requisitos: React, TypeScript, SQL, Git, Docker');
  assert.equal(bajo.decision, 'NO_PRIORIZAR');
});
