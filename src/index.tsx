import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Vault } from "@hyperion-framework/vault";
import { Manifest, ManifestNormalized } from "@hyperion-framework/types";
import Viewer from "./components/Viewer/Viewer";
import { VaultProvider, useVaultState } from "context/vault-context";

interface Props {
  manifestUri: string;
}
const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json";

const App: React.FC<Props> = ({ manifestUri }) => {
  return (
    <VaultProvider manifestUri={manifestUri}>
      <TheViewer />
    </VaultProvider>
  );
};

const TheViewer: React.FC<Props> = () => {
  const state = useVaultState();
  const { manifestUri, vault, isLoaded } = state;
  const manifest: ManifestNormalized = vault.fromRef({
    id: manifestUri,
    type: "Manifest",
  });

  if (!isLoaded) return <>Loading...</>;

  if (manifest["@context"] === undefined)
    return <>The IIIF manifest {manifestUri} failed to load.</>;

  return <Viewer manifest={manifest} />;
};

ReactDOM.render(
  <App manifestUri={sampleManifest} />,
  document.getElementById("root"),
);

export default App;
