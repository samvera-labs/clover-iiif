import { build } from "vite";
import { defineConfig } from "./base-config.mjs";
import { execa } from "execa";

(async () => {
  const DIST = "dist";

  await build(defineConfig());

  await build({
    resolve: {
      alias: {
        react: "preact/compat",
      },
    },
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "PFrag",
      jsxInject: `import { h, Fragment as PFrag } from 'preact'`,
    },
    build: {
      sourcemap: true,
      outDir: `${DIST}/web-components`,
      lib: {
        entry: "src/web-components/index.ts",
        formats: ["umd"],
        name: "CloverIIIFWC",
        fileName: (format) => {
          return `index.umd.js`;
        },
      },
      minify: "terser",
      plugins: [],
      rollupOptions: {
        treeshake: true,
        external: [],
        output: {
          globals: {},
          inlineDynamicImports: true,
        },
      },
    },
    define: { "process.env.NODE_ENV": '"production"' },
  });

  await execa("./node_modules/.bin/dts-bundle-generator", [
    `--out-file=${DIST}/index.d.ts`,
    "./src/index.tsx",
    "--no-check",
  ]);
})();
