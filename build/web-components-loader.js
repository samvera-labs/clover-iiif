// Preserve the classic script URL while letting the browser load feature chunks.
// Resolve against this script, not the embedding page (including on a CDN).
(function () {
  var script = document.currentScript;
  if (!script || !script.src) {
    throw new Error("Load Clover web components using an external script src.");
  }
  import(new URL("./index.mjs", script.src).href);
})();
