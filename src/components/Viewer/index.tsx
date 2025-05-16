import "src/i18n/config";
import {
  AnnotationNormalized,
  CollectionNormalized,
  ManifestNormalized,
} from "@iiif/presentation-3";
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

import { encodeContentState, getManifestSequence } from "@iiif/helpers";
import { Vault } from "@iiif/helpers/vault";
import Viewer from "src/components/Viewer/Viewer/Viewer";
import { createTheme } from "@stitches/react";
import { getRequest } from "src/lib/xhr";
import {
  decodeContentStateContainerURI,
  getActiveCanvas,
  getActiveManifestFromCollection,
  parseContentStateJson,
} from "src/lib/iiif";
import { ContentSearchQuery } from "src/types/annotations";
import { contentStateSpecificResource } from "src/lib/content-state";
import { hashCode } from "src/lib/utils";

export interface CloverViewerProps {
  canvasIdCallback?: (arg0: string) => void;
  contentStateCallback?: (iiifContentState: object) => void;
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
  canvasIdCallback,
  contentStateCallback,
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
        contentStateCallback={contentStateCallback}
        customTheme={customTheme}
        options={options}
        iiifContentSearchQuery={iiifContentSearchQuery}
      />
    </ViewerProvider>
  );
};

const RenderViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback,
  contentStateCallback,
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
  const {
    activeCanvas,
    activeManifest,
    activeSelector,
    isLoaded,
    vault,
    visibleCanvases,
  } = store;
  const [iiifResource, setIiifResource] = useState<
    CollectionNormalized | ManifestNormalized | AnnotationNormalized
  >();
  const [manifest, setManifest] = useState<ManifestNormalized>();

  /**
   * Overrides the baseline stitches theme when set.
   */
  let theme = {};
  if (customTheme) theme = createTheme("custom", customTheme);

  /**
   * Update activeSelector when the canvas or manifest changes.
   */
  useEffect(() => {
    dispatch({
      type: "updateActiveSelector",
      selector: undefined,
    });
  }, [activeCanvas, activeManifest]);

  /**
   * On change, pass the activeCanvas up to the wrapping `<App/>`
   * component to be handed off to a consuming application.
   */
  useEffect(() => {
    if (canvasIdCallback) {
      canvasIdCallback(activeCanvas);
    }

    if (contentStateCallback && activeManifest && activeCanvas) {
      const targetSourceId = visibleCanvases[0]?.id || activeCanvas;
      const annotationId = `${activeManifest}/state/${hashCode(targetSourceId + JSON.stringify(activeSelector))}`;

      const json = {
        ...contentStateSpecificResource,
        id: annotationId,
        target: {
          type: "SpecificResource",
          source: {
            id: targetSourceId,
            type: "Canvas",
            partOf: [
              {
                id: activeManifest,
                type: "Manifest",
              },
            ],
          },
          selector: activeSelector,
        },
      };
      contentStateCallback({
        json,
        encoded: encodeContentState(JSON.stringify(json)),
      });
    }
  }, [
    activeCanvas,
    activeManifest,
    activeSelector,
    canvasIdCallback,
    contentStateCallback,
    visibleCanvases,
  ]);

  useEffect(() => {
    if (activeManifest)
      vault
        .load(activeManifest)
        .then((data: ManifestNormalized) => {
          if (!data) return;

          setManifest(data);

          /**
           * ignoring as ManifestNormalized mismatches across helper libraries
           */

          // @ts-ignore
          const sequence = getManifestSequence(vault, data);
          const canvasId = activeCanvas || getActiveCanvas(data);

          dispatch({
            type: "updateActiveCanvas",
            canvasId: canvasId,
          });
          dispatch({
            type: "updateManifestSequence",
            sequence,
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

    const loadResource = async () => {
      if (!iiifContent) return;

      const contentState = decodeContentStateContainerURI(iiifContent);
      try {
        const data:
          | ManifestNormalized
          | CollectionNormalized
          | AnnotationNormalized
          | undefined = await vault.load(contentState);
        setIiifResource(data);
      } catch (error) {
        if (!contentState || !contentState.id)
          console.error(`Failed to load resource: ${error}`);

        /**
         * because Content State annotations may be ephemeral, we
         * need to handle cases where `id` is not dereferenceable
         * and side-load the resource from a decoded json object.
         */
        if (
          contentState?.id &&
          contentState?.type === "Annotation" &&
          contentState?.motivation?.includes("contentState")
        ) {
          const data: AnnotationNormalized | undefined = await vault.loadSync(
            contentState.id,
            contentState,
          );
          if (data) setIiifResource(data);
        } else if (
          contentState?.id &&
          ["Canvas", "Manifest"].includes(contentState?.type)
        ) {
          /**
           * If the resource is a Canvas or Manifest, we need to account for an implied content state
           * annotation, see https://iiif.io/api/content-state/1.0/#225-limitations-of-simple-uris
           */
          const data = await vault.loadSync(contentState.id, contentState);
          if (data)
            setIiifResource({
              ...contentStateSpecificResource,
              target: contentState,
            });
        }
      }
    };

    loadResource();
  }, [dispatch, iiifContent, options, vault]);

  useEffect(() => {
    if (!iiifResource) return;

    switch (iiifResource.type) {
      case "Annotation":
        if (
          iiifResource?.motivation &&
          (Array.isArray(iiifResource?.motivation)
            ? iiifResource?.motivation.includes("contentState")
            : iiifResource?.motivation === "content-state")
        ) {
          const { active } = parseContentStateJson(iiifResource);

          dispatch({
            type: "updateActiveManifest",
            manifestId: active.manifest,
          });
          dispatch({
            type: "updateActiveCanvas",
            canvasId: active.canvas,
          });
          dispatch({
            type: "updateContentStateAnnotation",
            contentStateAnnotation: iiifResource,
          });
        }
        break;
      case "Collection":
        const manifestId = getActiveManifestFromCollection(
          iiifResource as CollectionNormalized,
        );
        dispatch({
          type: "updateCollection",
          collection: iiifResource,
        });
        if (manifestId) {
          dispatch({
            type: "updateActiveManifest",
            manifestId: manifestId,
          });
        }
        break;
      case "Manifest":
        dispatch({
          type: "updateActiveManifest",
          manifestId: iiifResource.id,
        });
        break;
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
      return <>Loading</>;
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
