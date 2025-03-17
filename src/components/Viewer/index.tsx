import "src/i18n/config";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import {
  type ViewerConfigOptions,
  ViewerProvider,
  defaultState,
  expandAutoScrollOptions,
  useViewerDispatch,
  useViewerState,
  CustomDisplay,
  PluginConfig,
} from "src/context/viewer-context";

import { Vault } from "@iiif/helpers/vault";
import Viewer from "src/components/Viewer/Viewer/Viewer";
import { createTheme } from "@stitches/react";
import { getRequest } from "src/lib/xhr";
import {
  decodeContentStateContainerURI,
  getActiveCanvas,
  getActiveManifest,
} from "src/lib/iiif";
import { ContentSearchQuery } from "src/types/annotations";
import ViewerSkeleton from "./Viewer/ViewerSkeleton";

export interface CloverViewerProps {
  canvasIdCallback?: (arg0: string) => void;
  customDisplays?: Array<CustomDisplay>;
  plugins?: Array<PluginConfig>;
  customTheme?: any;
  iiifContent: string;
  id?: string;
  manifestId?: string;
  options?: ViewerConfigOptions;
  iiifContentSearchQuery?: ContentSearchQuery;
}

const CloverViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback = () => {},
  customDisplays = [],
  plugins = [],
  customTheme,
  iiifContent,
  id,
  manifestId,
  options,
  iiifContentSearchQuery,
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

  const autoScrollOptions = expandAutoScrollOptions(
    options?.informationPanel?.vtt?.autoScroll,
  );

  return (
    <ViewerProvider
      initialState={{
        ...defaultState,
        customDisplays,
        plugins,
        isAutoScrollEnabled: autoScrollOptions.enabled,
        isInformationOpen: Boolean(options?.informationPanel?.open),
        vault: new Vault({
          customFetcher: (url: string) =>
            getRequest(url, {
              withCredentials: options?.withCredentials as boolean,
              headers: options?.requestHeaders,
            }).then((response) => JSON.parse(response.data)),
        }),
      }}
    >
      <RenderViewer
        iiifContent={iiifResource}
        canvasIdCallback={canvasIdCallback}
        customTheme={customTheme}
        options={options}
        iiifContentSearchQuery={iiifContentSearchQuery}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback,
  customTheme,
  iiifContent,
  options,
  iiifContentSearchQuery,
}) => {
  const dispatch: any = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @iiif/helpers/vault.
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
  }, [activeCanvas, canvasIdCallback]);

  useEffect(() => {
    if (activeManifest)
      vault
        .load(activeManifest)
        .then((data: ManifestNormalized) => {
          setManifest(data);
          dispatch({
            type: "updateActiveCanvas",
            canvasId: getActiveCanvas(iiifContent, data),
          });
        })
        .catch((error: Error) => {
          console.error(`Manifest failed to load: ${error}`);
        })
        .finally(() => {
          dispatch({
            type: "updateIsLoaded",
            isLoaded: true,
          });
        });
  }, [iiifContent, activeManifest, dispatch, vault]);

  useEffect(() => {
    dispatch({
      type: "updateConfigOptions",
      configOptions: options,
    });
    const containerURI = decodeContentStateContainerURI(iiifContent);
    vault
      .load(containerURI)
      .then((data: CollectionNormalized | ManifestNormalized) => {
        setIiifResource(data);
      })
      .catch((error: Error) => {
        console.error(
          `The IIIF resource ${iiifContent} failed to load: ${error}`,
        );
      });
  }, [dispatch, iiifContent, options, vault]);

  useEffect(() => {
    if (iiifResource?.type === "Collection") {
      dispatch({
        type: "updateCollection",
        collection: iiifResource,
      });

      const manifestFromContentState = getActiveManifest(
        iiifContent,
        iiifResource,
      );
      if (manifestFromContentState) {
        dispatch({
          type: "updateActiveManifest",
          manifestId: manifestFromContentState,
        });
      }
    } else if (iiifResource?.type === "Manifest") {
      dispatch({
        type: "updateActiveManifest",
        manifestId: iiifResource.id,
      });
    }
  }, [dispatch, iiifContent, iiifResource]);

  /**
   * Render loading component while manifest is fetched and
   * loaded into React.Context as `vault`. Upon completion
   * (error or not) isLoaded will be set to true.
   */
  if (!isLoaded) {
    if (options?.customLoadingComponent) {
      const CustomLoadingComponent = options.customLoadingComponent;
      return <CustomLoadingComponent />;
    } else {
      return <ViewerSkeleton options={options} />;
    }
  }

  /**
   * If an error occurs during manifest fetch process used by
   * @iiif/helpers/vault, vault will not return a manifest
   * that is fully normalized, and be missing the items property.
   * This being undefined signals that something went wrong and we
   * will render a user-friendly error as a functional component.
   */

  if (!manifest || !manifest["items"]) {
    console.log(`The IIIF manifest ${iiifContent} failed to load.`);
    return <></>;
  }

  /**
   * If the manifest returned by @iiif/helpers/vault does not
   * contain any canvases, then we'll show an error to the screen. This
   * may be required if the viewer is rendered to preview manifests in
   * repository administration views.
   */
  if (manifest["items"].length === 0) {
    console.log(`The IIIF manifest ${iiifContent} does not contain canvases.`);
    return <></>;
  }

  /**
   * If manifest is normalized by @iiif/helpers/vault, we know
   * that the manifest data is retrievable via vault.get() and we
   * will will set the activeCanvas to the first index and render the
   * <Viewer/> component.
   */
  return (
    <Viewer
      manifest={manifest}
      theme={theme}
      key={manifest.id}
      iiifContentSearchQuery={iiifContentSearchQuery}
    />
  );
};

export default CloverViewer;
