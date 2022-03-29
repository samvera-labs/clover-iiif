/**
 * Live Reloading MVP:
 * https://github.com/zaydek/esbuild-hot-reload/blob/master/serve.js
 */

const { build } = require("esbuild");
const chokidar = require("chokidar");
const liveServer = require("live-server");
const envFilePlugin = require("esbuild-envfile-plugin");
const fs = require("fs-extra");
const { buildHTML } = require("./utils/html.js");

(async () => {
  /**
   * Build the /public HTML file
   */
  fs.writeFile("./public/index.html", await buildHTML(), (error) => {
    if (error) {
      console.error("Error writing index.html file: ", error);
    }
  });

  const builder = await build({
    bundle: true,
    // Defines env variables for bundled JavaScript; here `process.env.NODE_ENV`
    // is propagated with a fallback.
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
    entryPoints: ["src/dev.tsx"],
    // Uses incremental compilation (see `chokidar.on`).
    incremental: true,
    outfile: "public/script.js",
    sourcemap: true,
    plugins: [envFilePlugin],
  });

  chokidar
    // Watches TypeScript and React TypeScript.
    .watch("src/**/*.{ts,tsx}", {
      interval: 0, // No delay
    })
    // Rebuilds esbuild (incrementally -- see `build.incremental`).
    .on("all", () => {
      builder.rebuild();
    });

  liveServer.start({
    // Opens the local server on start.
    open: true,
    // Uses `PORT=...` or 8080 as a fallback.
    port: +process.env.PORT || 8080,
    // Uses `public` as the local server folder.
    root: "public",
  });
})();
