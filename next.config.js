/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: process.env.NODE_ENV === 'production' 
      ? ['your-production-domain.com'] 
      : ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_APP_ENV: process.env.NODE_ENV,
    APP_VERSION: process.env.npm_package_version,
    SKIP_AUTH: process.env.SKIP_AUTH || 'true', // デフォルトで認証スキップ
  },
  // 環境別設定
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
    swcMinify: false,
  }),
  ...(process.env.NODE_ENV === 'production' && {
    reactStrictMode: false,
    swcMinify: true,
    compress: true,
  }),
}

module.exports = nextConfig