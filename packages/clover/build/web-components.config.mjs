import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `<clover-viewer>`, standalone: Preact stands in for React (about 4 kB instead of 45),
 * everything else bundled, lazy parts kept as chunks beside `index.mjs`. As 3.x builds
 * its web components. Run by `npm run build:web-components`, after the main build.
 */
export default defineConfig({
  root,
  publicDir: false,
  // Relative: emitted files (MapLibre's worker) resolve against the module's own URL, so
  // the element works from any path or CDN, not only from the site root.
  base: "./",
  resolve: {
    alias: [
      { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
      { find: /^react-dom$/, replacement: "preact/compat" },
      { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
      { find: /^react$/, replacement: "preact/compat" },
    ],
  },
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  json: { stringify: true },
  define: { "process.env.NODE_ENV": '"production"' },
  worker: { format: "es" },
  build: {
    outDir: "dist/web-components",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    lib: {
      entry: resolve(root, "src/web-components/index.ts"),
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: [],
      output: { chunkFileNames: "[name]-[hash].mjs" },
    },
  },
});
