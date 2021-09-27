import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Vault } from "@hyperion-framework/vault";
import { Manifest, ManifestNormalized } from "@hyperion-framework/types";
import Viewer from "./components/Viewer/Viewer";
import { VaultProvider } from "context/vault-context";

interface Props {
  manifestUri: string;
}
const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json";

const App: React.FC<Props> = ({ manifestUri }) => {
  return (
    <VaultProvider manifestUri={manifestUri}>
      <Viewer />
    </VaultProvider>
  );
};

ReactDOM.render(
  <App manifestUri={sampleManifest} />,
  document.getElementById("root"),
);

export default App;
