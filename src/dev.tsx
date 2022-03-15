import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

// NOTE: "env" is available via the DotEnv ES Build Plugin defined in serve.js
import { NODE_ENV, DEV_URL, STATIC_URL } from "env";

const host = NODE_ENV === "development" ? DEV_URL : STATIC_URL;
let sampleManifest: string = `${host}/fixtures/iiif/manifests/sample.json`;

const options: any = {
  ignoreCaptionLabels: ["Chapters"],
};

ReactDOM.render(
  <App manifestId={sampleManifest} options={options} />,
  document.getElementById("root"),
);
