// Genera el par de claves Ed25519 del Club para firmar certificados.
// Uso:  node scripts/generar-clave-certificados.js
// Copia los dos valores a las variables de entorno de Vercel (CERT_SIGNING_PRIVATE_KEY y CERT_SIGNING_PUBLIC_KEY).
// La clave PRIVADA no se sube a GitHub ni se comparte. La pública puede publicarse.
const { generarPar } = require('../lib/certificado/core');
const p = generarPar();
console.log('\nCERT_SIGNING_PRIVATE_KEY=' + p.privada + '\n\nCERT_SIGNING_PUBLIC_KEY=' + p.publica + '\n');
