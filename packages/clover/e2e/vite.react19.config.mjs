import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite";

import base from "./vite.config.mjs";

const react19 = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "react19/node_modules",
);

/** The same harness on React 19 (installed in `e2e/react19`), on its own port. */
export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^react-dom\/client$/,
          replacement: `${react19}/react-dom/client.js`,
        },
        { find: /^react-dom$/, replacement: `${react19}/react-dom/index.js` },
        {
          find: /^react\/jsx-runtime$/,
          replacement: `${react19}/react/jsx-runtime.js`,
        },
        {
          find: /^react\/jsx-dev-runtime$/,
          replacement: `${react19}/react/jsx-dev-runtime.js`,
        },
        { find: /^react$/, replacement: `${react19}/react/index.js` },
      ],
    },
    optimizeDeps: { force: true },
    cacheDir: resolve(dirname(fileURLToPath(import.meta.url)), "react19/.vite"),
    server: { port: 4322, strictPort: true },
  }),
);
