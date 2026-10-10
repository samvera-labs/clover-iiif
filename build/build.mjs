import { build } from "vite";
import { defineConfig } from "./base-config.mjs";
import { webComponentsConfig } from "./web-components-config.mjs";
import { execa } from "execa";
import fs from "fs";

const buildOptions = {
  image: {
    lib: {
      name: "CloverIIIFImage",
      entry: "./src/components/Image/index.tsx",
      fileName: "index",
    },
  },
  map: {
    lib: {
      name: "CloverIIIFMap",
      entry: "./src/components/Map/index.tsx",
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
    },
  },
  helpers: {
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
    fs.copyFileSync(
      "build/shims/react-shim.mjs",
      `${DIST}/${key}/react-shim.mjs`,
    );
    fs.copyFileSync(
      "build/shims/react-dom-shim.mjs",
      `${DIST}/${key}/react-dom-shim.mjs`,
    );
    fs.copyFileSync(
      "build/shims/react-shim.cjs",
      `${DIST}/${key}/react-shim.cjs`,
    );
    fs.copyFileSync(
      "build/shims/react-dom-shim.cjs",
      `${DIST}/${key}/react-dom-shim.cjs`,
    );
  }

  // Copy react shims to the root dist for top-level entry usage
  fs.copyFileSync("build/shims/react-shim.mjs", `${DIST}/react-shim.mjs`);
  fs.copyFileSync(
    "build/shims/react-dom-shim.mjs",
    `${DIST}/react-dom-shim.mjs`,
  );
  fs.copyFileSync("build/shims/react-shim.cjs", `${DIST}/react-shim.cjs`);
  fs.copyFileSync(
    "build/shims/react-dom-shim.cjs",
    `${DIST}/react-dom-shim.cjs`,
  );

  // UMD cannot split dynamic imports. Keep its script URL as a small bootstrap
  // for a self-contained ESM build with shared Preact and deferred player code.
  await build(webComponentsConfig());
  fs.copyFileSync(
    "build/web-components-loader.js",
    `${DIST}/web-components/index.umd.js`,
  );
})();
