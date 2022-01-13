import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

const sampleManifest: string =
  "http://127.0.0.1:8080/fixtures/iiif/manifests/sample.json";

ReactDOM.render(
  <App manifestId={sampleManifest} />,
  document.getElementById("root"),
);
