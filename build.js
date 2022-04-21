// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

const { build } = require("esbuild");

/**
 * Retrieve Clover IIIF dependencies
 */
const { dependencies } = require("./package.json");

/**
 * Selectively bundle `@iiif/*` packages in Clover IIIF and exclude
 * as externals for compatibility with create-react-app and webpack 4
 */
const packagesToBundle = ["@iiif/presentation-3", "@iiif/vault"];
const externals = Object.keys(dependencies).filter(
  (dep) => !packagesToBundle.includes(dep),
);

const entryFile = "src/index.tsx";
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: externals,
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
