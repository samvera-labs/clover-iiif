const { build } = require("esbuild");
const envFilePlugin = require("esbuild-envfile-plugin");
const fs = require("fs-extra");

const { OUT_DIR } = process.env;

const filterFunc = (src, dest) => {
  console.log("copying: ", src);
  return !src.includes("script.js");
};

async function emptyDir() {
  try {
    await fs.emptyDir(OUT_DIR);
    console.log("/static directory emptied");
  } catch (err) {
    console.error(err);
  }
}

async function copyFiles() {
  try {
    await fs.copy("public", OUT_DIR, { filter: filterFunc });
    console.log("Success copying files");
  } catch (err) {
    console.error("Error copying files: ", err);
  }
}

(async () => {
  await emptyDir();
  await copyFiles();

  await build({
    bundle: true,
    entryPoints: ["src/dev.tsx"],
    outfile: `${OUT_DIR}/script.js`,
    plugins: [envFilePlugin],
    sourcemap: true,
  });
})();
