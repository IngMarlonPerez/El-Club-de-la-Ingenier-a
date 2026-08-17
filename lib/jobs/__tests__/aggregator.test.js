const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateJobs, normalizeForDedupe } = require('../aggregator');

const NOW = new Date('2026-08-17T12:00:00Z');
function daysAgo(n) {
  return new Date(NOW.getTime() - n * 86400000).toISOString();
}

test('filtra ofertas con más de 7 días de antigüedad', () => {
  const jobs = [
    { titulo: 'A', empresa: 'X', fechaPublicacion: daysAgo(2), url: 'u1', fuente: 'Jooble' },
    { titulo: 'B', empresa: 'Y', fechaPublicacion: daysAgo(10), url: 'u2', fuente: 'Jooble' },
  ];
  const result = aggregateJobs([jobs], { now: NOW });
  assert.equal(result.length, 1);
  assert.equal(result[0].titulo, 'A');
});

test('descarta ofertas sin fecha de publicación', () => {
  const jobs = [{ titulo: 'A', empresa: 'X', fechaPublicacion: null, url: 'u1', fuente: 'Jooble' }];
  const result = aggregateJobs([jobs], { now: NOW });
  assert.equal(result.length, 0);
});

test('deduplica por título + empresa normalizados entre fuentes distintas', () => {
  const jooble = [{ titulo: 'Desarrollador Backend', empresa: 'Acme S.A.', fechaPublicacion: daysAgo(1), url: 'u1', fuente: 'Jooble' }];
  const computrabajo = [{ titulo: 'DESARROLLADOR   BACKEND', empresa: 'acme s.a.', fechaPublicacion: daysAgo(2), url: 'u2', fuente: 'Computrabajo' }];
  const result = aggregateJobs([jooble, computrabajo], { now: NOW });
  assert.equal(result.length, 1);
  assert.equal(result[0].fuente, 'Jooble'); // se queda la más reciente entre los duplicados
});

test('ordena por fecha de publicación descendente', () => {
  const jobs = [
    { titulo: 'Vieja', empresa: 'X', fechaPublicacion: daysAgo(5), url: 'u1', fuente: 'Jooble' },
    { titulo: 'Nueva', empresa: 'Y', fechaPublicacion: daysAgo(1), url: 'u2', fuente: 'Jooble' },
    { titulo: 'Media', empresa: 'Z', fechaPublicacion: daysAgo(3), url: 'u3', fuente: 'Jooble' },
  ];
  const result = aggregateJobs([jobs], { now: NOW });
  assert.deepEqual(result.map((r) => r.titulo), ['Nueva', 'Media', 'Vieja']);
});

test('respeta el límite de resultados (top N)', () => {
  const jobs = Array.from({ length: 15 }, (_, i) => ({
    titulo: 'Oferta ' + i,
    empresa: 'Empresa ' + i,
    fechaPublicacion: daysAgo(1),
    url: 'u' + i,
    fuente: 'Jooble',
  }));
  const result = aggregateJobs([jobs], { now: NOW, limit: 10 });
  assert.equal(result.length, 10);
});

test('normalizeForDedupe ignora acentos, mayúsculas y espacios repetidos', () => {
  assert.equal(normalizeForDedupe('Diseñador  Gráfico'), normalizeForDedupe('disenador grafico'));
});
