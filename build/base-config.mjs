import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "../package.json" assert { type: "json" };

export function defineConfig(options, key) {
  return {
    build: {
      outDir: `dist/${key}`,
      sourcemap: true,
      lib: { ...options.lib },
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
