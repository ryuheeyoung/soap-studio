import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@soap-studio/types", "@soap-studio/db"],
  // better-sqlite3는 네이티브 모듈이라 번들링에서 제외
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
