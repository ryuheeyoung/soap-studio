import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts"],
      // 초기 단계 임시 임계값 — 테스트 추가에 따라 단계적으로 상향 예정 (목표: lines 80 / functions 80 / branches 70)
      thresholds: {
        lines: 5,
        functions: 5,
        branches: 5,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
