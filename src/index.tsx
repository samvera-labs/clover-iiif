import React, { useEffect, useState } from "react";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3";
import {
  ConfigOptions,
  ViewerProvider,
  useViewerState,
  useViewerDispatch,
  defaultState,
} from "@/context/viewer-context";
import { Vault } from "@iiif/vault";
import Viewer from "@/components/Viewer/Viewer";
import { createTheme } from "@stitches/react";
import { getRequest } from "@/services/xhr";

interface Props {
  canvasIdCallback?: (arg0: string) => void;
  customTheme?: any;
  id: string;
  manifestId?: string;
  options?: ConfigOptions;
}

const App: React.FC<Props> = ({
  canvasIdCallback = () => {},
  customTheme,
  id,
  manifestId,
  options,
}) => {
  return (
    <ViewerProvider
      initialState={{
        ...defaultState,
        vault: new Vault({
          customFetcher: (url: string) =>
            getRequest(url, {
              withCredentials: options?.withCredentials as boolean,
            }).then((response) => JSON.parse(response.data)),
        }),
      }}
    >
      <RenderViewer
        id={id}
        manifestId={manifestId}
        canvasIdCallback={canvasIdCallback}
        customTheme={customTheme}
        options={options}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<Props> = ({
  canvasIdCallback,
  customTheme,
  id,
  manifestId,
  options,
}) => {
  const dispatch: any = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @iiif/vault.
   */
  const store = useViewerState();
  const { activeCanvas, activeManifest, isLoaded, vault } = store;
  const [iiifResource, setIiifResource] = useState<
    CollectionNormalized | ManifestNormalized
  >();
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
    if (activeManifest)
      vault
        .loadManifest(activeManifest)
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
  }, [activeManifest]);

  useEffect(() => {
    let resource = id;

    /**
     * set resource as manifestIf if it exists
     */
    if (manifestId) resource = manifestId;

    dispatch({
      type: "updateConfigOptions",
      configOptions: options,
    });

    vault
      .load(resource)
      .then((data: any) => {
        setIiifResource(data);
      })
      .catch((error: any) => {
        console.error(`The IIIF resource ${resource} failed to load: ${error}`);
      });
  }, [id, options]);

  useEffect(() => {
    let manifests: string[] = [];

    if (iiifResource?.type === "Collection") {
      dispatch({
        type: "updateCollection",
        collection: iiifResource,
      });

      manifests = iiifResource.items
        .filter((item) => item.type === "Manifest")
        .map((manifest) => manifest.id);

      if (manifests.length > 0) {
        dispatch({
          type: "updateActiveManifest",
          manifestId: manifests[0],
        });
      }
    } else if (iiifResource?.type === "Manifest") {
      dispatch({
        type: "updateActiveManifest",
        manifestId: iiifResource.id,
      });
    }
  }, [iiifResource]);

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
   * that the manifest data is retrievable via vault.get() and we
   * will will set the activeCanvas to the first index and render the
   * <Viewer/> component.
   */
  return <Viewer manifest={manifest} theme={theme} key={manifest.id} />;
};

export default App;
