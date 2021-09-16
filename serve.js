/**
 * Live Reloading MVP:
 * https://github.com/zaydek/esbuild-hot-reload/blob/master/serve.js
 */

require("esbuild")
  .serve(
    {
      servedir: "www",
    },
    {
      entryPoints: ["src/index.tsx"],
      outdir: "www/js",
      bundle: true,
      sourcemap: true,
    }
  )
  .then((server) => {
    console.log("App is running at: http://localhost:8000");
    // Stop web server when done
    //server.stop();
  })
  .catch((e) => console.error("error", e));
