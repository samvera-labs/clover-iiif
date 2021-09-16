// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

const { build } = require("esbuild");
const { Generator } = require("npm-dts");
const { peerDependencies } = require("./package.json");

const entryFile = "src/index.tsx";
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: Object.keys(peerDependencies),
  minify: true,
  sourcemap: true,
};

build({
  ...shared,
  outfile: "dist/bundle.js",
});

build({
  ...shared,
  outfile: "dist/bundle.esm.js",
  format: "esm",
});

new Generator({
  entry: entryFile,
  output: "dist/index.d.ts",
}).generate();
