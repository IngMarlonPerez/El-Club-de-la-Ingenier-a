const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  // Build liviano pensado para contenedores (ver Dockerfile) -- no afecta el
  // build/deploy en Vercel, que no usa esta salida.
  output: 'standalone',
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
