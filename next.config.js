/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
  images: {
    domains: ['localhost', '127.0.0.1', '134.209.198.206'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: '134.209.198.206',
        port: '3000',
        pathname: '/**',
      },
    ],
  },

}

module.exports = nextConfig
