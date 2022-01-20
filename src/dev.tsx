import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

let sampleManifest: string =
  "https://iiif.stack.rdc.library.northwestern.edu/public/7c/16/60/e9/-e/a9/4-/4a/a4/-a/e4/e-/b7/a0/29/4b/e7/ee-manifest.json";

ReactDOM.render(
  <App manifestId={sampleManifest} />,
  document.getElementById("root"),
);
