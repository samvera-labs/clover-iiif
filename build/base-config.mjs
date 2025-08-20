import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import pkg from "../package.json" assert { type: "json" };

// Only externalize peer dependencies by default. Runtime deps remain bundled
// to avoid forcing consumers to install transitive packages explicitly.
const PEER_NAMES = new Set([
  ...Object.keys(pkg.peerDependencies || {}),
]);

// Rollup external predicate that also catches React subpaths
function isExternal(id) {
  if (!id) return false;
  // Always externalize React entrypoints and subpaths
  if (
    id === "react" ||
    id === "react-dom" ||
    id.startsWith("react/") ||
    id.startsWith("react-dom/")
  ) {
    return true;
  }
  // Also catch resolved file paths from node_modules for React 18/19 runtimes
  if (/node_modules[/\\]react[/\\]/.test(id) || /node_modules[/\\]react-dom[/\\]/.test(id)) {
    return true;
  }
  // Map an import id to a package name (@scope/name or name)
  const name = id[0] === "@" ? id.split("/", 2).join("/") : id.split("/", 1)[0];
  return PEER_NAMES.has(name);
}

export function defineConfig(options, key) {
  return {
    // Prevent Vite from copying ./public into each package outDir
    publicDir: false,
    resolve: {
      alias: {
        // Keep JSX runtime aligned to React version; leave main react/react-dom unmapped
        // so we can rewrite them per-format via Rollup output.paths.
        "react/jsx-runtime": path.resolve(process.cwd(), "build/shims/jsx-runtime-shim.mjs"),
        "react/jsx-dev-runtime": path.resolve(process.cwd(), "build/shims/jsx-runtime-shim.mjs"),
      },
    },
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      outDir: `dist/${key}`,
      sourcemap: false,
      lib: { ...options.lib },
      minify: "esbuild",
      rollupOptions: {
        external: isExternal,
        output: [
          {
            // ESM output
            format: "es",
            entryFileNames: () => `index.mjs`,
            banner: '"use client";',
            // Rewrite externals to local ESM shim files
            paths: {
              react: "./react-shim.mjs",
              "react-dom": "./react-dom-shim.mjs",
            },
            exports: "named",
            inlineDynamicImports: true,
          },
          {
            // CJS output
            format: "cjs",
            entryFileNames: () => `index.cjs`,
            banner: '"use client";',
            // Rewrite externals to local CJS shim files
            paths: {
              react: "./react-shim.cjs",
              "react-dom": "./react-dom-shim.cjs",
            },
            exports: "named",
            inlineDynamicImports: true,
          },
        ],
        treeshake: true,
      },
    },
    plugins: [tsconfigPaths()],
  };
}
