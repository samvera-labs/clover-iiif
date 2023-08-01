import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "../package.json" assert { type: "json" };

export function defineConfig(options) {
  return {
    build: {
      outDir: `dist`,
      sourcemap: true,
      lib: {
        name: "index",
        entry: "./src/index.tsx",
        formats: ["es", "cjs"],
        fileName: (format) => {
          if (format === "es") {
            return `index.mjs`;
          }
          return `index.js`;
        },
      },
      minify: "esbuild",
      rollupOptions: {
        external: [...Object.keys(pkg.dependencies || {})],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
          exports: "named",
          inlineDynamicImports: true,
        },
        treeshake: true,
      },
    },
    plugins: [tsconfigPaths()],
    test: {
      include: ["./src/**/*.{test,tests,spec}.{js,mjs,cjs,ts,tsx,mts,cts}"],
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/tests.ts",
    },
  };
}
