import tsconfigPaths from "vite-tsconfig-paths";
import { colocatedCssPlugin, injectCssPlugin } from "./base-config.mjs";

export function webComponentsConfig() {
  return {
    publicDir: false,
    resolve: {
      alias: {
        react: "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "preact",
    },
    build: {
      sourcemap: false,
      outDir: "dist/web-components",
      lib: {
        entry: "src/web-components/index.ts",
        formats: ["es"],
        fileName: () => "index.mjs",
      },
      minify: "esbuild",
      rollupOptions: {
        treeshake: true,
        external: [],
        output: {
          chunkFileNames: "[name]-[hash].mjs",
          inlineDynamicImports: false,
        },
      },
    },
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      tsconfigPaths(),
      colocatedCssPlugin(),
      injectCssPlugin("web-components"),
    ],
  };
}
