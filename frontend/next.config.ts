import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    PORT: process.env.PORT || '3001',
  },
};

export default nextConfig;
