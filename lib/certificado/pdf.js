// Genera el PDF del certificado: arte horneado (A4 horizontal) + nombre, fecha, código y QR dibujados aquí.
// El QR apunta a la página pública de verificación; la firma del Club viaja además en los metadatos del PDF.
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const SITIO = process.env.SITE_URL || 'https://elclubdelaingenieria.dpdns.org';
const ASSETS = path.join(process.cwd(), 'lib', 'certificado', 'assets');

function hex(h) { const n = parseInt(h.replace('#', ''), 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); }

function fechaLarga(iso) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function urlVerificacion(codigo) { return `${SITIO.replace(/\/$/, '')}/verificar/${codigo}`; }

/** Si el nombre trae un carácter que la tipografía estándar no puede codificar, se reemplaza por su forma base. */
function seguro(font, texto) {
  try { font.widthOfTextAtSize(texto, 10); return texto; } catch (e) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\xff]/g, '');
  }
}

/**
 * @param {{codigo:string, nombre:string, emitidoEn:string, huella:string, firma:string}} c
 * @returns {Promise<Buffer>}
 */
async function generarPdf(c) {
  const layout = JSON.parse(fs.readFileSync(path.join(ASSETS, 'layout.json'), 'utf8'));
  const base = fs.readFileSync(path.join(ASSETS, 'club-cert-base.png'));

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([841.89, 595.28]);           // A4 horizontal
  const k = page.getWidth() / layout.ancho;             // px del arte → puntos del PDF
  const Y = (py) => page.getHeight() - py * k;          // el arte mide desde arriba; el PDF desde abajo
  page.drawImage(await pdf.embedPng(base), { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });

  const serifB = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const tinta = hex(layout.tinta); const gris = hex(layout.gris);
  const centro = page.getWidth() / 2;
  const centrado = (t, py, font, size, color) => page.drawText(t, { x: centro - font.widthOfTextAtSize(t, size) / 2, y: Y(py) - size * 0.78, size, font, color });

  // Nombre: mayúsculas, ajustado al ancho disponible
  const nombre = seguro(serifB, c.nombre.toLocaleUpperCase('es'));
  let size = 140 * k;
  const maxAncho = layout.nombre_max_ancho * k;
  while (size > 18 && serifB.widthOfTextAtSize(nombre, size) > maxAncho) size -= 1;
  centrado(nombre, layout.nombre_y + 20, serifB, size, tinta);

  centrado(`Dado y firmado en Milagro, Ecuador, el ${fechaLarga(c.emitidoEn)}.`, layout.fecha_y, sans, 44 * k, gris);
  centrado(`Registro de certificados del Club de la Ingeniería · Folio ${c.codigo}`, layout.folio_y, sans, 28 * k, gris);

  // QR de verificación
  const qrPng = await QRCode.toBuffer(urlVerificacion(c.codigo), { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: 600, color: { dark: layout.tinta, light: '#ffffff' } });
  const q = layout.qr;
  page.drawImage(await pdf.embedPng(qrPng), { x: q.x * k, y: Y(q.y + q.lado), width: q.lado * k, height: q.lado * k });
  page.drawText(c.codigo, { x: layout.codigo.x * k, y: Y(layout.codigo.y) - 38 * k * 0.78, size: 38 * k, font: sansB, color: tinta });

  pdf.setTitle(`Certificado de Héroe del Club — ${c.codigo}`);
  pdf.setAuthor('El Club de la Ingeniería');
  pdf.setSubject(`Reconocimiento Kernel Cero otorgado a ${c.nombre}`);
  pdf.setKeywords([c.codigo, `huella:${c.huella}`, `firma:${c.firma}`, `verificar:${urlVerificacion(c.codigo)}`]);
  pdf.setProducer('El Club de la Ingeniería');
  pdf.setCreator('El Club de la Ingeniería');
  pdf.setCreationDate(new Date(c.emitidoEn));
  pdf.setModificationDate(new Date(c.emitidoEn));
  return Buffer.from(await pdf.save());
}

module.exports = { generarPdf, urlVerificacion };
