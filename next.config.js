const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  // Build liviano pensado para contenedores (ver Dockerfile). Solo se activa cuando
  // el propio Dockerfile define DOCKER_BUILD=1 antes de compilar -- activarlo siempre
  // rompe el build en Vercel (ENOENT en .next/next-server.js.nft.json: el tracing de
  // archivos de Vercel no es compatible con la salida "standalone" de Next).
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' } : {}),
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }];
  },
  async headers() {
    // Imágenes propias optimizadas (logo, foto de perfil): no cambian de contenido en
    // esta URL de un día para otro, así que se cachean de forma agresiva en vez del
    // caching por defecto de Next para /public. Si alguna vez se reemplaza el archivo
    // con contenido distinto, hay que cambiarle el nombre (no solo sobrescribirlo) para
    // que el navegador no siga sirviendo la versión vieja desde caché.
    return [
      {
        source: '/:file(logo\\.webp|logo-optimized\\.png|marlon-profile\\.webp|marlon-profile-optimized\\.jpg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

// El plugin de Sentry solo sube source maps si SENTRY_AUTH_TOKEN está configurado
// (paso opcional en CI/Vercel); sin esa variable, el build sigue funcionando igual,
// solo sin subir source maps al dashboard de Sentry.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
