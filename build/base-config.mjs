import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import pkg from "../package.json" with { type: "json" };
import { colocatedCssPlugin } from "./colocated-css.mjs";

// Only externalize peer dependencies by default. Runtime deps remain bundled
// to avoid forcing consumers to install transitive packages explicitly.
const PEER_NAMES = new Set([
  ...Object.keys(pkg.peerDependencies || {}),
]);

// Runtime dependencies that should always remain external to avoid
// bundling large libraries (OpenSeadragon, Swiper, IIIF helpers, etc.).
const FORCED_EXTERNALS = new Set([
  "@iiif/helpers",
  "@iiif/parser",
  "i18next",
  "react-i18next",
  "i18next-browser-languagedetector",
  "openseadragon",
  "swiper",
  // hls.js is loaded dynamically only for HLS sources. Externalising it
  // keeps it out of the always-bundled `dist/*/index.{mjs,cjs}` output and
  // lets consumer bundlers (or direct ESM resolution) load it on demand.
  "hls.js",
  // @allmaps/leaflet is loaded dynamically only when showImageOverlay is true.
  // Externalising it avoids bundling ~800 kB of georeferencing code for
  // consumers who never use the warped image overlay feature.
  "@allmaps/leaflet",
]);

function getPackageName(id) {
  if (!id) return null;
  if (id.startsWith("\0")) return null;
  if (id.startsWith(".")) return null;
  if (id[0] === "@") {
    return id.split("/", 2).join("/");
  }
  if (id.startsWith("/") || /node_modules[/\\]/.test(id)) {
    const parts = id.split(/[/\\]/);
    const nodeModulesIndex = parts.lastIndexOf("node_modules");
    if (nodeModulesIndex !== -1) {
      const scope = parts[nodeModulesIndex + 1];
      if (!scope) return null;
      if (scope.startsWith("@")) {
        return `${scope}/${parts[nodeModulesIndex + 2]}`;
      }
      return scope;
    }
  }
  return id.split("/", 1)[0];
}

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
  const name = getPackageName(id);
  if (!name) return false;
  if (FORCED_EXTERNALS.has(name)) return true;
  return PEER_NAMES.has(name);
}

/**
 * Ships Vite's emitted leaf-level CSS inside the JS, so a consumer needs no stylesheet import.
 *
 * Vite extracts imported `.css` into `dist/<pkg>/style.css` but does not inject it. The asset
 * is unreachable because `exports` lists no CSS entry and consumers have never needed a
 * stylesheet import. Capture it here, append one small runtime injector to the JS entry, then
 * remove the redundant asset from the bundle.
 *
 * Appended rather than prepended: the ESM and CJS outputs carry a `"use client";` banner that
 * has to stay the first statement in the file, and anything inserted above it would push the
 * directive out of position and silently disable it.
 *
 * Hand-rolled rather than a plugin dependency. It is a dozen lines against one more package to
 * track, and the point of this change is to carry less.
 */
function injectCssPlugin(key) {
  return {
    name: "clover-inject-css",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      /*
       * Bundled CSS first, then Clover's own — the order matters where the two overlap, and
       * Clover has to win.
       */
      const cssAssets = Object.entries(bundle).filter(
        ([, file]) => file.type === "asset" && file.fileName.endsWith(".css"),
      );
      const css = cssAssets.map(([, file]) => String(file.source)).join("\n");

      if (!css.trim()) return;

      for (const [fileName] of cssAssets) delete bundle[fileName];

      // A per-package id, so loading `/viewer` and `/slider` together injects both sheets
      // rather than the first one winning and the second seeing its marker already present.
      const id = `clover-iiif-${key}`;
      const literal = JSON.stringify(css);

      for (const file of Object.values(bundle)) {
        if (file.type !== "chunk" || !file.isEntry) continue;
        file.code += `\n;(function(){try{if(typeof document==="undefined")return;var i=${JSON.stringify(
          id,
        )};if(document.getElementById(i))return;var e=document.createElement("style");e.id=i;e.textContent=${literal};document.head.appendChild(e);}catch(_){}})();\n`;
      }
    },
  };
}

export { colocatedCssPlugin, injectCssPlugin };

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
    plugins: [tsconfigPaths(), colocatedCssPlugin(), injectCssPlugin(key)],
  };
}
