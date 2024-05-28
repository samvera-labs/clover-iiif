import { build } from "vite";
import { defineConfig } from "./base-config.mjs";
import { execa } from "execa";
import fs from "fs";
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
  'helpers': {
    lib: {
      name: "CloverIIIFHelpers",
      entry: "./src/lib/index.ts",
      fileName: "index",
    },
  },
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
  }

  // build web components
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
