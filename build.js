// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

const { build } = require("esbuild");
const { peerDependencies } = require("./package.json");

const entryFile = "src/index.tsx";
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: Object.keys(peerDependencies),
  logLevel: "info",
  minify: true,
  outfile: "./dist/index.js",
  sourcemap: true,
};

build({
  ...shared,
  format: "esm",
  external: ["react", "react-dom"],
  target: ["esnext", "node12.22.0"],
});
