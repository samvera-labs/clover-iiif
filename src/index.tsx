import React from "react";
import ReactDOM from "react-dom";
import { ManifestNormalized } from "@hyperion-framework/types";
import {
  VaultProvider,
  useVaultState,
  useVaultDispatch,
} from "context/vault-context";
import Viewer from "./components/Viewer/Viewer";

interface Props {
  manifestId: string;
}

const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json";

const App: React.FC<Props> = ({ manifestId }) => {
  return (
    <VaultProvider manifestId={manifestId}>
      <RenderViewer />
    </VaultProvider>
  );
};

const RenderViewer: React.FC = () => {
  const dispatch: any = useVaultDispatch();
  /**
   * Retrieve state set by the wrapping <VaultProvider/> and make
   * the normalized manifest available from @hyperion-framework/vault.
   */
  const state = useVaultState();
  const { manifestId, activeCanvas, vault, isLoaded } = state;
  const manifest: ManifestNormalized = vault.fromRef({
    id: manifestId,
    type: "Manifest",
  });

  /**
   * Render loading component while manifest is fetched and
   * loaded into React.Context as `vault`. Upon completion
   * (error or not) isLoaded will be set to true.
   */
  if (!isLoaded) return <>Loading</>;

  /**
   * If an error occurs during manifest fetch process used by
   * @hyperion-framework/vault, vault will not return a manifest
   * that is fully normalized, and be missing the @context property.
   * This being undefined signals that something went wrong and we
   * will render a user-friendly error as a functional component.
   */
  if (manifest["@context"] === undefined)
    return <>The IIIF manifest {manifestId} failed to load.</>;

  /**
   * If manifest is normalized by @hyperion-framework/vault, we know
   * that the manifest data is retrievable via vault.fromRef() and we
   * will will set the activeCanvas to the first index and render the
   * <Viewer/> component.
   */
  if (!activeCanvas)
    dispatch({
      type: "updateActiveCanvas",
      canvasId: manifest.items[0].id,
    });

  return <Viewer manifest={manifest} activeCanvas={activeCanvas} />;
};

ReactDOM.render(
  <App manifestId={sampleManifest} />,
  document.getElementById("root"),
);

export default App;
