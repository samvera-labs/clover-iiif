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
        // Ensure our bundles don’t rely on default exports from React/DOM
        react: path.resolve(process.cwd(), "build/shims/react-shim.mjs"),
        "react-dom": path.resolve(process.cwd(), "build/shims/react-dom-shim.mjs"),
        // Ensure all references (ESM or CJS) to the JSX runtime resolve to a passthrough shim
        "react/jsx-runtime": path.resolve(process.cwd(), "build/shims/jsx-runtime-shim.mjs"),
        "react/jsx-dev-runtime": path.resolve(process.cwd(), "build/shims/jsx-runtime-shim.mjs"),
      },
    },
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      outDir: `dist/${key}`,
      sourcemap: true,
      lib: { ...options.lib },
      minify: "esbuild",
      rollupOptions: {
        external: isExternal,
        output: {
          // Ensure client components are marked explicitly for Next.js / RSC environments
          banner: '"use client";',
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
            "react/jsx-dev-runtime": "jsxDevRuntime",
            "react-dom/client": "ReactDOMClient",
          },
          // Rewrite external React imports to our local shim that provides a default export
          paths: {
            react: "./react-shim.mjs",
            "react-dom": "./react-dom-shim.mjs",
          },
          exports: "named",
          inlineDynamicImports: true,
        },
        treeshake: true,
      },
    },
    plugins: [tsconfigPaths()],
  };
}
