import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases.json";

ReactDOM.render(
  <App manifestId={sampleManifest} />,
  document.getElementById("root"),
);
