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
import {
  loadAnnotationCollection,
  loadAnnotationPage,
  getFirstManifestFromAnnotationCollection,
  getFirstAnnotationTarget,
} from "src/lib/annotation-collection";
import { zoomToOverlay } from "src/lib/openseadragon-helpers";
import { hashCode } from "src/lib/utils";

export interface CloverViewerProps {
  canvasIdCallback?: (arg0: string) => void;
  contentStateCallback?: (iiifContentState: object) => void;
  contentSearchCallback?: (query: string) => void;
  customDisplays?: Array<CustomDisplay>;
  plugins?: Array<PluginConfig>;
  customTheme?: any;
  iiifContent: string | object;
  id?: string;
  manifestId?: string;
  options?: ViewerConfigOptions;
  iiifContentSearchQuery?: ContentSearchQuery;
}

const CloverViewer: React.FC<CloverViewerProps> = ({
  canvasIdCallback,
  contentStateCallback,
  contentSearchCallback,
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
        contentSearchCallback={contentSearchCallback}
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
  contentSearchCallback,
  customTheme,
  iiifContent,
  options,
  iiifContentSearchQuery,
}) => {
  const dispatch = useViewerDispatch();

  /**
   * Retrieve state set by the wrapping <ViewerProvider/> and make
   * the normalized manifest available from @iiif/helpers/vault.
   */
  const store = useViewerState();
  const {
    activeCanvas,
    activeManifest,
    activeSelector,
    annotationCollection,
    configOptions,
    isLoaded,
    openSeadragonViewer,
    pendingAnnotationTarget,
    vault,
    visibleCanvases,
  } = store;
  const [iiifResource, setIiifResource] = useState<
    CollectionNormalized | ManifestNormalized | AnnotationNormalized | undefined
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
    dispatch({ type: "updateActiveSelector", selector: undefined });
  }, [activeCanvas, activeManifest]);

  /**
   * When a pendingAnnotationTarget is set, poll every 300ms until OSD has
   * drawn the overlay for the target annotation, then zoom to it using the
   * overlay's own bounds (mirrors the content-state highlight pattern).
   * The 300ms cadence also clears OSD's fitBoundsOnAllLoaded retries (~150ms)
   * so our zoom lands last and sticks.
   */
  useEffect(() => {
    if (!pendingAnnotationTarget) return;
    if (!openSeadragonViewer) return;
    if (activeCanvas !== pendingAnnotationTarget.canvasId) return;

    const { annotationId } = pendingAnnotationTarget;

    const intervalId = setInterval(() => {
      if (zoomToOverlay(openSeadragonViewer, annotationId)) {
        dispatch({
          type: "updatePendingAnnotationTarget",
          pendingAnnotationTarget: null,
        });
        clearInterval(intervalId);
      }
    }, 300);

    return () => clearInterval(intervalId);
  }, [pendingAnnotationTarget, openSeadragonViewer, activeCanvas]);

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
    if (!activeManifest) return;

    // When a manifest's internal `id` differs from the URL it was fetched from,
    // vault stores the entity under the internal id but tracks the *request* under
    // the fetch URL. A subsequent vault.load(internalId) finds no request entry
    // and tries to fetch from the internal id as a URL, which may not resolve.
    // Check vault.get first — it looks directly in entities and handles this case.
    const existingManifest = vault.get(activeManifest) as ManifestNormalized | null;
    const manifestLoader: Promise<ManifestNormalized> =
      existingManifest &&
      Array.isArray((existingManifest as any).items) &&
      (existingManifest as any).items.length > 0
        ? Promise.resolve(existingManifest)
        : (vault.load(activeManifest) as Promise<ManifestNormalized>);

    manifestLoader
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

        /**
         * Extract viewingDirection from manifest (defaults to left-to-right)
         * and check if behavior includes "paged"
         */
        // @ts-ignore - viewingDirection exists on IIIF manifest but may not be typed
        const viewingDirection = data.viewingDirection || "left-to-right";
        // @ts-ignore - behavior exists on IIIF manifest but may not be typed
        const behavior = data.behavior || [];
        const isPaged = Array.isArray(behavior)
          ? behavior.includes("paged")
          : behavior === "paged";

        dispatch({
          type: "updateViewingDirection",
          viewingDirection,
        });
        dispatch({
          type: "updateIsPaged",
          isPaged,
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

      /**
       * AnnotationCollection is not a IIIF Presentation 3 vault type.
       * Peek at the resource before passing to vault so we can intercept
       * and handle the collection loading path ourselves.
       */
      if (typeof contentState === "string") {
        try {
          const res = await fetch(contentState, {
            headers: { Accept: "application/json, application/ld+json" },
          });
          const json = await res.json();
          if (
            json?.type === "AnnotationCollection" ||
            json?.type === "AnnotationPage"
          ) {
            const collection =
              json.type === "AnnotationPage"
                ? await loadAnnotationPage(json)
                : await loadAnnotationCollection(json);
            dispatch({
              type: "updateAnnotationCollection",
              annotationCollection: collection,
            });
            const firstManifest =
              getFirstManifestFromAnnotationCollection(collection);
            const { canvasId: firstCanvasId, annotationId: firstAnnotationId } =
              getFirstAnnotationTarget(collection);
            if (firstManifest) {
              if (firstCanvasId) {
                dispatch({ type: "updateActiveCanvas", canvasId: firstCanvasId });
                if (firstAnnotationId) {
                  dispatch({
                    type: "updatePendingAnnotationTarget",
                    pendingAnnotationTarget: { canvasId: firstCanvasId, annotationId: firstAnnotationId },
                  });
                }
              }
              dispatch({ type: "updateActiveManifest", manifestId: firstManifest });
            } else {
              dispatch({ type: "updateIsLoaded", isLoaded: true });
            }
            return;
          }
          if (json?.type === "Canvas") {
            if (json.partOf?.[0]?.id) {
              dispatch({ type: "updateActiveCanvas", canvasId: json.id });
              dispatch({ type: "updateActiveManifest", manifestId: json.partOf[0].id });
            } else {
              const syntheticId = `${json.id}/manifest`;
              await vault.loadSync(syntheticId, {
                "@context": "http://iiif.io/api/presentation/3/context.json",
                id: syntheticId,
                type: "Manifest",
                label: json.label ?? { none: [""] },
                items: [json],
              });
              dispatch({ type: "updateActiveCanvas", canvasId: json.id });
              dispatch({ type: "updateActiveManifest", manifestId: syntheticId });
            }
            return;
          }
        } catch {
          // Not an AnnotationCollection/AnnotationPage/Canvas or fetch failed — fall through to vault.load
        }
      } else if (
        typeof contentState === "object" &&
        (contentState?.type === "AnnotationCollection" ||
          contentState?.type === "AnnotationPage")
      ) {
        const collection =
          contentState.type === "AnnotationPage"
            ? await loadAnnotationPage(contentState)
            : await loadAnnotationCollection(contentState);
        dispatch({
          type: "updateAnnotationCollection",
          annotationCollection: collection,
        });
        const firstManifest =
          getFirstManifestFromAnnotationCollection(collection);
        const { canvasId: firstCanvasId, annotationId: firstAnnotationId } =
          getFirstAnnotationTarget(collection);
        if (firstManifest) {
          if (firstCanvasId) {
            dispatch({ type: "updateActiveCanvas", canvasId: firstCanvasId });
            if (firstAnnotationId) {
              dispatch({
                type: "updatePendingAnnotationTarget",
                pendingAnnotationTarget: { canvasId: firstCanvasId, annotationId: firstAnnotationId },
              });
            }
          }
          dispatch({ type: "updateActiveManifest", manifestId: firstManifest });
        } else {
          dispatch({ type: "updateIsLoaded", isLoaded: true });
        }
        return;
      } else if (
        typeof contentState === "object" &&
        contentState?.type === "Canvas"
      ) {
        if (contentState.partOf?.[0]?.id) {
          dispatch({ type: "updateActiveCanvas", canvasId: contentState.id });
          dispatch({ type: "updateActiveManifest", manifestId: contentState.partOf[0].id });
        } else {
          const syntheticId = `${contentState.id}/manifest`;
          await vault.loadSync(syntheticId, {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            id: syntheticId,
            type: "Manifest",
            label: contentState.label ?? { none: [""] },
            items: [contentState],
          });
          dispatch({ type: "updateActiveCanvas", canvasId: contentState.id });
          dispatch({ type: "updateActiveManifest", manifestId: syntheticId });
        }
        return;
      }

      try {
        const data:
          | ManifestNormalized
          | CollectionNormalized
          | AnnotationNormalized
          | undefined =
          typeof contentState === "object" && contentState?.id
            ? await vault.loadSync(contentState?.id, contentState)
            : await vault.load(contentState);
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
          collection: iiifResource as CollectionNormalized,
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
      contentSearchCallback={contentSearchCallback}
    />
  );
};

export default CloverViewer;
