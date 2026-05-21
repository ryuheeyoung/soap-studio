import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@soap-studio/types", "@soap-studio/db"],
};

export default nextConfig;
