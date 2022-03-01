import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

let sampleManifest: string =
  "http://127.0.0.1:8080/fixtures/iiif/manifests/audio-accompanying-canvas.json";

const options: any = {
  ignoreCaptionLabels: ["Chapters"],
};

ReactDOM.render(
  <App manifestId={sampleManifest} options={options} />,
  document.getElementById("root"),
);
