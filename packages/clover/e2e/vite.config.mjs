import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

/** Serves the end-to-end harness (`e2e/app`) over the package's source. */
export default defineConfig({
  root: resolve(dirname(fileURLToPath(import.meta.url)), "app"),
  esbuild: { jsx: "automatic" },
  json: { stringify: true },
  server: { port: 4321, strictPort: true },
  logLevel: "warn",
});
