// next.config.ts
import { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // if you’re on Next 13+ with the /app directory
    // appDir: true, // Removed as it is not a valid property
  },
  webpack(config) {
    // Alias `@data` → `<projectRoot>/data`
    // so you can import your catalog JSON like:
    //   import courses from '@data/dartmouth_courses.json';
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@data': path.resolve(__dirname, 'data'),
    }
    return config
  },
}

export default nextConfig
