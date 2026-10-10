import { defineProject } from "vitest/config";

/** The @nulib/clover test project: jsdom, relative imports only (no `src/*` alias). */
export default defineProject({
  esbuild: { jsx: "automatic" },
  test: {
    name: "clover",
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/setupTests.ts"],
    pool: "forks",
  },
});
