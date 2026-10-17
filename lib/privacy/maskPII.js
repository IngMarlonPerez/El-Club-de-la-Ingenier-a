// Enmascara datos personales de un texto de CV ANTES de enviarlo a un servidor o a una IA
// externa (minimización de datos, LOPDP Ecuador). Función pura, sin red: se ejecuta en el
// navegador y, como segunda barrera, en el servidor (pages/api/jobs/analyze-cv.js).
//
// Qué oculta: correos, teléfonos móviles de Ecuador, cédula/RUC, fechas de nacimiento,
// dirección/domicilio, estado civil y enlaces de perfiles sociales con identificador personal.
// Qué NO puede garantizar: nombres propios sueltos (no se distinguen de otras palabras sin
// un modelo de NER); el nombre se conserva porque no se envía como dato estructurado.

const RULES = [
  { key: 'correo', label: 'correos', re: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, to: '[correo oculto]' },
  // Móviles de Ecuador: 09[6-9]xxxxxxx (con o sin +593). Se evalúan antes que la cédula.
  { key: 'telefono', label: 'teléfonos', re: /(?:\+?593[\s-]?)?0?9[6-9][\s-]?\d{3}[\s-]?\d{4}\b/g, to: '[teléfono oculto]' },
  // Cédula: 10 dígitos con tercer dígito 0-5; RUC: 13 dígitos terminados en 001.
  { key: 'cedula', label: 'cédulas/RUC', re: /\b\d{2}[0-5]\d{7}(?:001)?\b/g, to: '[documento oculto]' },
  { key: 'nacimiento', label: 'fechas de nacimiento', re: /(fecha\s+de\s+nacimiento|nacido\s+el|f\.?\s*nac\.?)\s*:?\s*[^\n]{0,28}/gi, to: '$1: [fecha oculta]' },
  { key: 'direccion', label: 'direcciones', re: /(direcci[oó]n|domicilio|dir\.)\s*:?\s*[^\n]{0,60}/gi, to: '$1: [dirección oculta]' },
  { key: 'estado_civil', label: 'estado civil', re: /(estado\s+civil)\s*:?\s*\p{L}+/giu, to: '$1: [oculto]' },
  { key: 'enlace', label: 'enlaces personales', re: /(?:https?:\/\/)?(?:[\w-]+\.)?(?:linkedin\.com\/in|github\.com|facebook\.com|instagram\.com)\/[\w%.\-]+/gi, to: '[enlace oculto]' },
];

/**
 * @param {string} texto
 * @returns {{ texto: string, conteos: Record<string, number>, total: number, resumen: string[] }}
 */
function maskPII(texto) {
  let out = String(texto || '');
  const conteos = {};
  let total = 0;
  for (const rule of RULES) {
    let n = 0;
    out = out.replace(rule.re, (...args) => {
      n += 1;
      // soporta referencias $1 del patrón "to"
      return rule.to.replace(/\$(\d)/g, (_, i) => args[Number(i)] || '');
    });
    if (n) { conteos[rule.key] = n; total += n; }
  }
  const resumen = RULES.filter((r) => conteos[r.key]).map((r) => `${conteos[r.key]} ${r.label}`);
  return { texto: out, conteos, total, resumen };
}

module.exports = { maskPII, RULES };
