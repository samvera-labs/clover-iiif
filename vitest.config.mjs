/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    environment: "jsdom",
    globals: true,
    include: ["./src/**/*.{test,tests,spec}.{js,mjs,cjs,ts,tsx,mts,cts}"],
    reporters: ["default"],
    setupFiles: "./src/setupTests.ts",
    // Avoid Node worker thread pool; use forked processes instead for stability in CI
    pool: 'forks',
    maxConcurrency: 1,
  },
});
