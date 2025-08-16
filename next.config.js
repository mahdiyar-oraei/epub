/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/**',
      },
    ],
  },

}

module.exports = nextConfig
