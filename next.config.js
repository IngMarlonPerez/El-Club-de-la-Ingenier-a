/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
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

module.exports = nextConfig;
