import { build } from "vite";
import { defineConfig } from "./base-config.mjs";
import { execa } from "execa";
import fs from "fs";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const buildOptions = {
  image: {
    lib: {
      name: "CloverIIIFImage",
      entry: "./src/components/Image/index.tsx",
      fileName: "index",
    },
  },
  primitives: {
    lib: {
      name: "CloverIIIFPrimitives",
      entry: "./src/components/Primitives/index.tsx",
      fileName: "index",
    },
  },
  i18n: {
    lib: {
      name: "CloverIIIFI18n",
      entry: "./src/i18n/index.ts",
      fileName: "index",
    },
  },
  viewer: {
    lib: {
      name: "CloverIIIFViewer",
      entry: "./src/components/Viewer/index.tsx",
      fileName: "index",
    },
  },
  slider: {
    lib: {
      name: "CloverIIIFSlider",
      entry: "./src/components/Slider/index.tsx",
      fileName: "index",
    },
  },
  scroll: {
    lib: {
      name: "CloverIIIFScroll",
      entry: "./src/components/Scroll/index.tsx",
      fileName: "index",
    }
  },
  helpers: {
    lib: {
      name: "CloverIIIFHelpers",
      entry: "./src/lib/index.ts",
      fileName: "index",
    },
  },
};

const CLIENT_PREAMBLE = '"use client";';

const createWithStylesEntrypoint = (distRoot, key) => {
  const packageDir = path.join(distRoot, key);
  if (!fs.existsSync(packageDir)) return;

  const cssPath = path.join(packageDir, "style.css");
  const hasCss = fs.existsSync(cssPath);
  const esmLines = [CLIENT_PREAMBLE];

  if (hasCss) {
    const cssContent = fs.readFileSync(cssPath, "utf8");
    const serializedCss = JSON.stringify(cssContent);
    const styleId = `clover-iiif-${key}-styles`;

    esmLines.push(
      `const STYLE_ID = "${styleId}";`,
      `const CSS_TEXT = ${serializedCss};`,
      'const registry = (globalThis.__CLOVER_STYLES__ = globalThis.__CLOVER_STYLES__ || {});',
      'registry[STYLE_ID] = CSS_TEXT;',
      'if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {',
      '  const style = document.createElement("style");',
      '  style.id = STYLE_ID;',
      '  style.textContent = CSS_TEXT;',
      '  (document.head || document.body || document.documentElement).appendChild(style);',
      '}',
    );
  }

  esmLines.push('export * from "./index.mjs";');
  esmLines.push('export { default } from "./index.mjs";');

  fs.writeFileSync(
    path.join(packageDir, "index.with-styles.mjs"),
    esmLines.join("\n") + "\n",
  );
};

const createRootWithStylesEntrypoint = (distRoot) => {
  const entries = [
    { identifier: "Image", target: "./image/index.with-styles.mjs" },
    { identifier: "Primitives", target: "./primitives/index.with-styles.mjs" },
    { identifier: "Scroll", target: "./scroll/index.with-styles.mjs" },
    { identifier: "Slider", target: "./slider/index.with-styles.mjs" },
    { identifier: "Viewer", target: "./viewer/index.with-styles.mjs" },
    { identifier: "Helpers", target: "./helpers/index.with-styles.mjs" },
  ];

  const lines = [CLIENT_PREAMBLE];
  for (const { identifier, target } of entries) {
    lines.push(`import ${identifier} from "${target}";`);
  }

  lines.push("", "export {");
  entries.forEach(({ identifier }, index) => {
    const suffix = index === entries.length - 1 ? "" : ",";
    lines.push(`  ${identifier}${suffix}`);
  });
  lines.push("};", "", "export default Viewer;");

  fs.writeFileSync(path.join(distRoot, "index.with-styles.mjs"), lines.join("\n") + "\n");
};

const createStyleRegistryModule = (distRoot) => {
  const registryHelper =
    "const getRegistry = () => (globalThis.__CLOVER_STYLES__ = globalThis.__CLOVER_STYLES__ || {});";
  const esmLines = [
    registryHelper,
    "export const getCloverStyleElements = () => Object.entries(getRegistry()).map(([id, css]) => ({ id, css }));",
    "export const injectCloverStyles = (targetDocument = typeof document !== 'undefined' ? document : undefined) => {",
    "  if (!targetDocument) return;",
    "  getCloverStyleElements().forEach(({ id, css }) => {",
    "    if (targetDocument.getElementById && targetDocument.getElementById(id)) return;",
    "    const style = targetDocument.createElement ? targetDocument.createElement('style') : null;",
    "    if (!style) return;",
    "    style.id = id;",
    "    style.textContent = css;",
    "    if (targetDocument.head && targetDocument.head.appendChild) {",
    "      targetDocument.head.appendChild(style);",
    "    } else if (targetDocument.appendChild) {",
    "      targetDocument.appendChild(style);",
    "    }",
    "  });",
    "};",
  ];

  fs.writeFileSync(
    path.join(distRoot, "style-registry.mjs"),
    esmLines.join("\n") + "\n",
  );

  const cjsLines = [
    '"use strict";',
    registryHelper,
    "const getCloverStyleElements = () => Object.entries(getRegistry()).map(([id, css]) => ({ id, css }));",
    "const injectCloverStyles = (targetDocument = typeof document !== 'undefined' ? document : undefined) => {",
    "  if (!targetDocument) return;",
    "  getCloverStyleElements().forEach(({ id, css }) => {",
    "    if (targetDocument.getElementById && targetDocument.getElementById(id)) return;",
    "    const style = targetDocument.createElement ? targetDocument.createElement('style') : null;",
    "    if (!style) return;",
    "    style.id = id;",
    "    style.textContent = css;",
    "    if (targetDocument.head && targetDocument.head.appendChild) {",
    "      targetDocument.head.appendChild(style);",
    "    } else if (targetDocument.appendChild) {",
    "      targetDocument.appendChild(style);",
    "    }",
    "  });",
    "};",
    "module.exports = {",
    "  getCloverStyleElements,",
    "  injectCloverStyles,",
    "};",
  ];

  fs.writeFileSync(
    path.join(distRoot, "style-registry.cjs"),
    cjsLines.join("\n") + "\n",
  );

  const dtsLines = [
    "export interface CloverStyleElement {",
    "  id: string;",
    "  css: string;",
    "}",
    "export declare const getCloverStyleElements: () => CloverStyleElement[];",
    "export declare const injectCloverStyles: (targetDocument?: {",
    "  head?: { appendChild(node: any): void };",
    "  appendChild?(node: any): void;",
    "  getElementById?(id: string): any;",
    "  createElement?(tag: string): any;",
    "} | null) => void;",
  ];

  fs.writeFileSync(
    path.join(distRoot, "style-registry.d.ts"),
    dtsLines.join("\n") + "\n",
  );
};

(async () => {
  const DIST = "dist";

  // build root as a module
  fs.readFile(`./build/root.mjs`, "utf8", (err, data) => {
    if (err) throw err;

    // Ensure the destination directory exists
    if (!fs.existsSync(DIST)) {
      fs.mkdirSync(DIST);
    }

    // Write the content to the destination file
    fs.writeFile(`${DIST}/index.mjs`, data, (err) => {
      if (err) throw err;
    });
  });

  // build root as a umd
  fs.readFile(`./build/root.umd.js`, "utf8", (err, data) => {
    if (err) throw err;

    // Ensure the destination directory exists
    if (!fs.existsSync(DIST)) {
      fs.mkdirSync(DIST);
    }

    // Write the content to the destination file
    fs.writeFile(`${DIST}/index.umd.js`, data, (err) => {
      if (err) throw err;
    });
  });

  // also write a CJS-friendly root entry that mirrors the UMD wrapper
  fs.readFile(`./build/root.umd.js`, "utf8", (err, data) => {
    if (err) throw err;

    if (!fs.existsSync(DIST)) {
      fs.mkdirSync(DIST);
    }

    fs.writeFile(`${DIST}/index.cjs`, data, (err) => {
      if (err) throw err;
    });
  });

  // output types
  await execa("./node_modules/.bin/dts-bundle-generator", [
    `--out-file=${DIST}/index.d.ts`,
    `./src/index.tsx`,
    "--no-check",
  ]);



  // build sub packages
  for (const [key, value] of Object.entries(buildOptions)) {
    // Build packages
    await build(defineConfig(value, key));

    // Build types
    await execa("./node_modules/.bin/dts-bundle-generator", [
      `--out-file=${DIST}/${key}/index.d.ts`,
      value.lib.entry,
      "--no-check",
    ]);

    // Copy React shims alongside each subpackage output for ESM/CJS default compatibility
    fs.copyFileSync("build/shims/react-shim.mjs", `${DIST}/${key}/react-shim.mjs`);
    fs.copyFileSync("build/shims/react-dom-shim.mjs", `${DIST}/${key}/react-dom-shim.mjs`);
    fs.copyFileSync("build/shims/react-shim.cjs", `${DIST}/${key}/react-shim.cjs`);
    fs.copyFileSync("build/shims/react-dom-shim.cjs", `${DIST}/${key}/react-dom-shim.cjs`);

    createWithStylesEntrypoint(DIST, key);
  }

  createRootWithStylesEntrypoint(DIST);
  createStyleRegistryModule(DIST);

  // Copy react shims to the root dist for top-level entry usage
  fs.copyFileSync("build/shims/react-shim.mjs", `${DIST}/react-shim.mjs`);
  fs.copyFileSync("build/shims/react-dom-shim.mjs", `${DIST}/react-dom-shim.mjs`);
  fs.copyFileSync("build/shims/react-shim.cjs", `${DIST}/react-shim.cjs`);
  fs.copyFileSync("build/shims/react-dom-shim.cjs", `${DIST}/react-dom-shim.cjs`);

  // build web components
  await build({
    publicDir: false,
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
      sourcemap: false,
      outDir: `${DIST}/web-components`,
      lib: {
        entry: "src/web-components/index.ts",
        formats: ["umd"],
        name: "CloverIIIFWC",
        fileName: () => {
          return `index.umd.js`;
        },
      },
      minify: "esbuild",
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
    plugins: [tsconfigPaths()]
  });
})();
