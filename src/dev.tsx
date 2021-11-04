import React from "react";
import ReactDOM from "react-dom";
import App from "./index";

const sampleManifest: string =
  "http://127.0.0.1:8080/fixtures/iiif/manifests/assortedCanvases.json";

const handleCanvasIdCallback = (canvasId) => {
  console.log(`canvasId`, canvasId);
};

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "#37474F",
    primaryMuted: "#546E7A",
    primaryAlt: "#263238",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "#C62828",
    accentMuted: "#E57373",
    accentAlt: "#B71C1C",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#ECEFF1",
    secondaryAlt: "#CFD8DC",
  },
  fonts: {
    sans: "'Avenir', 'Helvetica Neue', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

ReactDOM.render(
  <App
    manifestId={sampleManifest}
    canvasIdCallback={handleCanvasIdCallback}
    customTheme={customTheme}
  />,
  document.getElementById("root"),
);
