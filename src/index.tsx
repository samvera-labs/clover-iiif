import React, { useEffect, useState } from "react";
import { ManifestNormalized } from "@iiif/presentation-3";
import {
  ConfigOptions,
  ViewerProvider,
  useViewerState,
  useViewerDispatch,
} from "context/viewer-context";
import Viewer from "components/Viewer/Viewer";
import { createTheme } from "@stitches/react";

interface Props {
  manifestId: string;
  canvasIdCallback?: (arg0: string) => void;
  customTheme?: any;
  options?: ConfigOptions;
}

const App: React.FC<Props> = ({
  manifestId,
  canvasIdCallback = () => {},
  customTheme,
  options,
}) => {
  return (
    <ViewerProvider>
      <RenderViewer
        manifestId={manifestId}
        canvasIdCallback={canvasIdCallback}
        customTheme={customTheme}
        options={options}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<Props> = ({
  manifestId,
  canvasIdCallback,
  customTheme,
  options,
}) => {
  const dispatch: any = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @iiif/vault.
   */
  const store = useViewerState();
  const { activeCanvas, isLoaded, vault } = store;
  const [manifest, setManifest] = useState<ManifestNormalized>();

  /**
   * Overrides the baseline stitches theme when set.
   */
  let theme = {};
  if (customTheme) theme = createTheme("custom", customTheme);

  /**
   * On change, pass the activeCanvas up to the wrapping `<App/>`
   * component to be handed off to a consuming application.
   */
  useEffect(() => {
    if (canvasIdCallback) canvasIdCallback(activeCanvas);
  }, [activeCanvas]);

  useEffect(() => {
    // Update with user config options
    dispatch({
      type: "updateConfigOptions",
      configOptions: options,
    });

    /**
     * Loaded manifest and site using @iiif/vault.
     */
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
   * @iiif/vault, vault will not return a manifest
   * that is fully normalized, and be missing the items property.
   * This being undefined signals that something went wrong and we
   * will render a user-friendly error as a functional component.
   */

  if (!manifest || !manifest["items"]) {
    console.log(`The IIIF manifest ${manifestId} failed to load.`);
    return <></>;
  }

  /**
   * If the manifest returned by @iiif/vault does not
   * contain any canvases, then we'll show an error to the screen. This
   * may be required if the viewer is rendered to preview manifests in
   * repository administration views.
   */
  if (manifest["items"].length === 0) {
    console.log(`The IIIF manifest ${manifestId} does not contain canvases.`);
    return <></>;
  }

  /**
   * If manifest is normalized by @iiif/vault, we know
   * that the manifest data is retrievable via vault.fromRef() and we
   * will will set the activeCanvas to the first index and render the
   * <Viewer/> component.
   */
  return <Viewer manifest={manifest} theme={theme} />;
};

export default App;
