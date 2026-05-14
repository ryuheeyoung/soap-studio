import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // 커버리지 측정 대상 (DB·외부 의존성 제외)
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts"],
      // 임계값 미달 시 테스트 실패
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
