import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ManifestNormalized } from "@hyperion-framework/types";
import {
  ViewerProvider,
  useViewerState,
  useViewerDispatch,
} from "context/viewer-context";
import Viewer from "./components/Viewer/Viewer";

interface Props {
  manifestId: string;
}

const sampleManifest: string =
  "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/new_airliner.json";

const App: React.FC<Props> = ({ manifestId }) => {
  return (
    <ViewerProvider>
      <RenderViewer manifestId={manifestId} />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<Props> = ({ manifestId }) => {
  const dispatch: any = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @hyperion-framework/vault.
   */
  const { isLoaded, vault } = useViewerState();
  const manifest: ManifestNormalized = vault.fromRef({
    id: manifestId,
    type: "Manifest",
  });

  /**
   * Loaded manifest and site using @hyperion-framework/vault.
   */
  useEffect(() => {
    vault
      .loadManifest(manifestId)
      .then((data) => {
        dispatch({
          type: "updateActiveCanvas",
          canvasId: data.items[0].id,
        });
      })
      .catch((error) => {
        console.error(`Manifest failed to load: ${error}`);
      })
      .finally(() => {
        dispatch({
          type: "updateIsLoaded",
          isLoaded: true,
        });
      });
  }, []);

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

  return <Viewer manifest={manifest} />;
};

ReactDOM.render(
  <App manifestId={sampleManifest} />,
  document.getElementById("root"),
);

export default App;
