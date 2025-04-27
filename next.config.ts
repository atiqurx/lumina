// next.config.ts
import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {},
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@data": path.resolve(__dirname, "data"),
    };
    return config;
  },
};

export default nextConfig;
