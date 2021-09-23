// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

const { build } = require("esbuild");
const { Generator } = require("npm-dts");
const { peerDependencies } = require("./package.json");

const entryFile = "src/index.tsx";
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: Object.keys(peerDependencies),
  logLevel: "info",
  minify: true,
  sourcemap: true,
};

build({
  ...shared,
  format: "esm",
  external: ["react", "react-dom"],
  outfile: "dist/bundle.js",
  target: ["esnext", "node12.22.0"],
});

new Generator({
  entry: entryFile,
  force: true,
  logLevel: "debug",
  output: "dist/index.d.ts",
}).generate();
