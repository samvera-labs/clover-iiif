// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

const { build } = require("esbuild");

/**
 * Retrieve Clover IIIF dependencies
 */
const { dependencies } = require("./package.json");

const entryFile = "src/index.tsx";
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: Object.keys(dependencies),
  logLevel: "info",
  minify: true,
  sourcemap: true,
  target: ["es2019", "node12.22.0"],
};

build({
  ...shared,
  format: "esm",
  outfile: "./dist/index.esm.js",
});

build({
  ...shared,
  format: "cjs",
  outfile: "./dist/index.cjs.js",
});
