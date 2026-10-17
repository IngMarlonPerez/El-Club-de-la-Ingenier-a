// Ajuste perfil ↔ oferta. Función pura y determinista: sin red, sin IA, sin cuota.
// Corre en el navegador (el CV no sale del equipo para esto). Es una ESTIMACIÓN heurística:
// busca los requisitos que menciona la oferta y comprueba si el CV tiene evidencia de cada uno.

const LEXICO = [
  'react', 'next.js', 'typescript', 'javascript', 'node.js', 'python', 'java', 'c#', '.net', 'php', 'sql', 'postgresql', 'mysql',
  'sql server', 'mongodb', 'supabase', 'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'google cloud', 'linux', 'html',
  'css', 'rest', 'api', 'apis', 'json', 'jwt', 'postman', 'visual studio code', 'vue', 'angular', 'django', 'flask', 'fastapi',
  'spring', 'scrum', 'agile', 'ci/cd', 'pruebas', 'seguridad', 'ciberseguridad', 'redes', 'machine learning', 'inteligencia artificial',
  'power bi', 'excel', 'word', 'sap', 'erp', 'crm', 'ofimatica', 'soporte tecnico', 'help desk', 'mantenimiento', 'hardware', 'windows',
  'active directory', 'atencion al cliente', 'servicio al cliente', 'caja', 'cuadre', 'facturacion', 'recepcion', 'reservas', 'ventas',
  'inventario', 'quejas', 'contabilidad', 'nomina', 'auditoria', 'gestion documental', 'marketing', 'diseno', 'figma', 'photoshop',
];
const DEBILES = new Set(['pruebas', 'liderazgo', 'comunicacion', 'documentar', 'validaciones']);
const ABREV = { js: 'javascript', ts: 'typescript', ia: 'inteligencia artificial', ml: 'machine learning', bd: 'base de datos' };

function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function contiene(txt, term) {
  const toks = (term.match(/[a-z0-9#+.]{2,}/g) || []).map((w) => ABREV[w] || w);
  if (!toks.length) return false;
  const ok = toks.every((w) => new RegExp(`(?<![a-z0-9])${esc(w)}(?![a-z0-9])`).test(txt));
  return ok || (toks.length > 2 && toks.filter((w) => txt.includes(w)).length >= toks.length - 1);
}

/** @returns {Array<{termino:string, peso:number}>} */
function extraerRequisitos(texto) {
  const t = norm(texto);
  const m = t.match(/(?:conocimientos?(?: requeridos?)?|requisitos?|requerimientos?)\s*:?\s*([\s\S]*?)(?=\b(?:responsabilidades|funciones|competencias|postula|beneficios|objetivo del cargo)\b|$)/);
  const zona = m ? m[1] : '';
  const out = new Map();
  for (const term of LEXICO) {
    if (new RegExp(`(?<![a-z0-9])${esc(term)}(?![a-z0-9])`).test(t)) {
      const enZona = zona && new RegExp(`(?<![a-z0-9])${esc(term)}(?![a-z0-9])`).test(zona);
      out.set(term, DEBILES.has(term) ? 1 : (enZona ? 2 : 1));
    }
  }
  return [...out.entries()].map(([termino, peso]) => ({ termino, peso })).sort((a, b) => b.peso - a.peso || a.termino.localeCompare(b.termino));
}

/**
 * @param {{cvTexto?:string, habilidades?:string[], carrera?:string, resumen?:string}} perfil
 * @param {string} ofertaTexto título + resumen (o la descripción pegada por la persona)
 * @param {{minRequisitos?:number}} [opts]
 */
function evaluarAjuste(perfil, ofertaTexto, opts = {}) {
  const minReq = opts.minRequisitos ?? 3;
  const cv = norm(perfil.cvTexto || '');
  const hab = norm([...(perfil.habilidades || []), perfil.carrera || '', perfil.resumen || ''].join(' '));
  const reqs = extraerRequisitos(ofertaTexto);
  if (reqs.length < minReq) {
    return { ajuste: null, decision: 'SIN_DETALLE', requisitos: reqs.map((r) => ({ ...r, nivel: 'sin_evaluar' })), brechas: [], filtros: filtros(ofertaTexto), confianza: 'baja' };
  }
  let tot = 0; let ok = 0;
  const requisitos = reqs.map((r) => {
    let nivel = 'falta'; let pts = 0;
    if (cv && contiene(cv, r.termino)) { nivel = 'cv'; pts = 1; } else if (contiene(hab, r.termino)) { nivel = 'habilidad'; pts = 0.7; }
    tot += r.peso; ok += r.peso * pts;
    return { ...r, nivel };
  });
  const ajuste = Math.round((100 * ok) / tot);
  const decision = ajuste >= 65 ? 'POSTULAR' : ajuste >= 35 ? 'ADAPTAR' : 'NO_PRIORIZAR';
  return { ajuste, decision, requisitos, brechas: requisitos.filter((r) => r.nivel === 'falta'), filtros: filtros(ofertaTexto), confianza: reqs.length >= 6 ? 'media' : 'baja' };
}

function filtros(texto) {
  const t = norm(texto); const out = [];
  const m = t.match(/(un|una|dos|tres|cuatro|cinco|seis|diez|\d+)\s+an[oi]s?\s+(?:de\s+)?experiencia/);
  if (m) out.push(`Pide ${m[1]} año(s) de experiencia: suele ser pregunta filtro del formulario.`);
  if (/estudiante|egresad|ultimos semestres/.test(t)) out.push('Admite estudiantes o egresados.');
  if (/fecha limite|postula(?:te)? antes|hasta el \d/.test(t)) out.push('Tiene fecha límite de postulación.');
  return out;
}

module.exports = { extraerRequisitos, evaluarAjuste, norm };
