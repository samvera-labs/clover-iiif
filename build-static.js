const { build } = require("esbuild");
const envFilePlugin = require("esbuild-envfile-plugin");
const fs = require("fs-extra");
const { buildHTML } = require("./utils/html.js");

const { OUT_DIR } = process.env;

const filterFunc = (src, dest) => {
  const dontCopyFiles = ["script.js", "index.html"];
  const shouldCopy = !dontCopyFiles.some((file) => src.includes(file));

  if (shouldCopy) {
    console.log("copying: ", src);
  }

  return shouldCopy;
};

async function emptyDir() {
  try {
    await fs.emptyDir(OUT_DIR);
    console.log("/static directory emptied\n");
  } catch (err) {
    console.error(err);
  }
}

async function copyFiles() {
  try {
    await fs.copy("public", OUT_DIR, { filter: filterFunc });
    console.log("\nSuccess copying files");
  } catch (err) {
    console.error("\nError copying files: ", err);
  }
}

(async () => {
  await emptyDir();
  await copyFiles();

  /**
   * Build the /static HTML file
   */
  fs.writeFile("./static/index.html", await buildHTML(true), (error) => {
    if (error) {
      console.error("Error writing index.html file: ", error);
    }
  });

  await build({
    bundle: true,
    entryPoints: ["src/dev.tsx"],
    outfile: `${OUT_DIR}/script.js`,
    plugins: [envFilePlugin],
    sourcemap: true,
  });
})();
