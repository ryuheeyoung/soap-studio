import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  transpilePackages: ["@soap-studio/types"],
  // Turbopack 명시적 활성화 (Next.js 16 기본값, webpack 충돌 방지)
  turbopack: {},
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
