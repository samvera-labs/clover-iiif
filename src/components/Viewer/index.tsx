import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import {
  ViewerConfigOptions,
  ViewerProvider,
  defaultState,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import { Vault } from "@iiif/vault";
import Viewer from "src/components/Viewer/Viewer/Viewer";
import { createTheme } from "@stitches/react";
import { getRequest } from "src/lib/xhr";

export interface CloverViewerProps {
  canvasIdCallback?: (arg0: string) => void;
  customTheme?: any;
  iiifContent: string;
  id?: string;
  manifestId?: string;
  options?: ViewerConfigOptions;
}

const CloverViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback = () => {},
  customTheme,
  iiifContent,
  id,
  manifestId,
  options,
}) => {
  /**
   * Legacy `id` and `manifestId` prop support.
   * If an id is passed, use that as the iiifResource. Otherwise,
   * use the manifestId. If neither are passed, use the iiifContent
   * prop.
   */
  let iiifResource = iiifContent;
  if (id) iiifResource = id;
  if (manifestId) iiifResource = manifestId;

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
        iiifContent={iiifResource}
        canvasIdCallback={canvasIdCallback}
        customTheme={customTheme}
        options={options}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback,
  customTheme,
  iiifContent,
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
    dispatch({
      type: "updateConfigOptions",
      configOptions: options,
    });

    vault
      .load(iiifContent)
      .then((data: any) => {
        setIiifResource(data);
      })
      .catch((error: any) => {
        console.error(
          `The IIIF resource ${iiifContent} failed to load: ${error}`
        );
      });
  }, [iiifContent, options]);

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
    console.log(`The IIIF manifest ${iiifContent} failed to load.`);
    return <></>;
  }

  /**
   * If the manifest returned by @iiif/vault does not
   * contain any canvases, then we'll show an error to the screen. This
   * may be required if the viewer is rendered to preview manifests in
   * repository administration views.
   */
  if (manifest["items"].length === 0) {
    console.log(`The IIIF manifest ${iiifContent} does not contain canvases.`);
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

export default CloverViewer;
