/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }];
  },
};

module.exports = nextConfig;
