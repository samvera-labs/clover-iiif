import React, { useEffect, useState } from "react";
import { ManifestNormalized } from "@hyperion-framework/types";
import {
  ViewerProvider,
  useViewerState,
  useViewerDispatch,
} from "context/viewer-context";
import Viewer from "components/Viewer/Viewer";

interface Props {
  manifestId: string;
  canvasIdCallback: (arg0: string) => void;
}

const App: React.FC<Props> = ({ manifestId, canvasIdCallback = () => {} }) => {
  return (
    <ViewerProvider>
      <RenderViewer
        manifestId={manifestId}
        canvasIdCallback={canvasIdCallback}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<Props> = ({ manifestId, canvasIdCallback }) => {
  const dispatch: any = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @hyperion-framework/vault.
   */
  const store = useViewerState();
  const { activeCanvas, isLoaded, vault } = store;
  const [manifest, setManifest] = useState<ManifestNormalized>();

  /**
   * On change, pass the activeCanvas up to the wrapping `<App/>`
   * component to be handed off to a consuming application.
   */
  useEffect(() => {
    canvasIdCallback(activeCanvas);
  }, [activeCanvas]);

  /**
   * Loaded manifest and site using @hyperion-framework/vault.
   */
  useEffect(() => {
    vault
      .loadManifest(manifestId)
      .then((data: any) => {
        setManifest(data);
        dispatch({
          type: "updateActiveCanvas",
          canvasId: data.items[0] && data.items[0].id,
        });
      })
      .catch((error: any) => {
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
   * that is fully normalized, and be missing the label property.
   * This being undefined signals that something went wrong and we
   * will render a user-friendly error as a functional component.
   */
  if (!manifest || !manifest["label"])
    return <>The IIIF manifest {manifestId} failed to load.</>;

  /**
   * If the manifest returned by @hyperion-framework/vault does not
   * contain any canvases, then we'll show an error to the screen. This
   * may be required if the viewer is rendered to preview manifests in
   * repository administration views.
   */
  if (manifest["items"].length === 0)
    return <>The IIIF manifest {manifestId} does not contain any canvases.</>;

  /**
   * If manifest is normalized by @hyperion-framework/vault, we know
   * that the manifest data is retrievable via vault.fromRef() and we
   * will will set the activeCanvas to the first index and render the
   * <Viewer/> component.
   */
  return <Viewer manifest={manifest} />;
};

export default App;
