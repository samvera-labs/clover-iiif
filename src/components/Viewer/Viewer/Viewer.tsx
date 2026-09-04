import * as Collapsible from "@radix-ui/react-collapsible";

import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  CanvasNormalized,
  ExternalResourceTypes,
  InternationalString,
  ManifestNormalized,
} from "@iiif/presentation-3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import {
  getAnnotationResources,
  getContentSearchResources,
  getPaintingResource,
} from "src/hooks/use-iiif";

import { ContentSearchQuery } from "src/types/annotations";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import ViewerContent from "src/components/Viewer/Viewer/Content";
import ViewerHeader from "src/components/Viewer/Viewer/Header";
import { getLabelAsString } from "src/lib/label-helpers";
import { getVisibleCanvasesFromCanvasId } from "@iiif/helpers";
import { media } from "src/styles/media";
import ExitFullscreen from "src/components/Shared/Fullscreen/ExitFullscreen";
import useFullscreen from "src/hooks/useFullscreen";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface ViewerProps {
  manifest: ManifestNormalized;
  /** `customTheme` resolved to `--clover-*` declarations, applied inline. */
  themeStyle?: React.CSSProperties;
  iiifContentSearchQuery?: ContentSearchQuery;
  contentSearchCallback?: (query: string) => void;
}

const Viewer: React.FC<ViewerProps> = ({
  manifest,
  themeStyle,
  iiifContentSearchQuery,
  contentSearchCallback,
}) => {
  /*
   * The root element, and whether it is the one full screen.
   *
   * Held in state rather than a ref so the hook re-runs once the element exists: assigning a
   * ref does not re-render, and the listener has to know what to compare against.
   */
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const isFullscreen = useFullscreen(rootElement);

  /**
   * Viewer State
   */
  const viewerState: ViewerContextStore = useViewerState();
  const viewerDispatch = useViewerDispatch();
  const {
    activeCanvas,
    isInformationOpen,
    vault,
    configOptions,
    visibleCanvases,
  } = viewerState;

  const absoluteCanvasHeights = ["100%", "auto"];
  const isAbsolutePosition =
    configOptions?.canvasHeight &&
    absoluteCanvasHeights.includes(configOptions?.canvasHeight);

  /**
   * Local state
   */
  const [isAudioVideo, setIsAudioVideo] = useState(false);
  const [painting, setPainting] = useState<IIIFExternalWebResource[]>([]);
  const [annotationResources, setAnnotationResources] =
    useState<AnnotationResources>([]);
  const [contentSearchResource, setContentSearchResource] =
    useState<AnnotationResource>();

  const isSmallViewport = useMediaQuery(media.sm);
  const [searchServiceUrl, setSearchServiceUrl] = useState();
  const [canvasAnnouncement, setCanvasAnnouncement] = useState("");
  const previousCanvas = useRef<string | undefined>(undefined);
  const { t } = useCloverTranslation();

  const setInformationOpen = useCallback(
    (open: boolean) => {
      viewerDispatch({
        type: "updateInformationOpen",
        isInformationOpen: open,
      });
    },
    [viewerDispatch],
  );

  useEffect(() => {
    if (configOptions?.informationPanel?.open) {
      setInformationOpen(!isSmallViewport);
    }
  }, [isSmallViewport, configOptions?.informationPanel?.open]);

  useEffect(() => {}, [isSmallViewport]);

  /*
   * Changing canvas replaces the image in place, which a screen reader has no reason to
   * report, so stepping through with the next control was silent (WCAG 4.1.3). The first
   * canvas is skipped: it is what the viewer opened on, not a change.
   */
  useEffect(() => {
    if (!activeCanvas) return;

    if (previousCanvas.current === undefined) {
      previousCanvas.current = activeCanvas;
      return;
    }
    if (previousCanvas.current === activeCanvas) return;
    previousCanvas.current = activeCanvas;

    const canvas = vault.get(activeCanvas) as CanvasNormalized | undefined;
    const label = getLabelAsString(canvas?.label as InternationalString);

    if (label) {
      setCanvasAnnouncement(label);
      return;
    }

    // Canvases often carry no label, and an empty announcement tells the reader nothing.
    // Position at least confirms the move happened and says how far it went.
    const index = manifest.items?.findIndex((item) => item.id === activeCanvas);

    setCanvasAnnouncement(
      index !== undefined && index > -1
        ? t("canvasPosition", {
            index: index + 1,
            total: manifest.items?.length,
          })
        : "",
    );
  }, [activeCanvas, manifest, t, vault]);

  useEffect(() => {
    const canvasPainting = getPaintingResource(vault, activeCanvas);

    if (canvasPainting) {
      setIsAudioVideo(
        ["Sound", "Video"].indexOf(
          canvasPainting[0].type as ExternalResourceTypes,
        ) > -1
          ? true
          : false,
      );
      setPainting(canvasPainting);
    }

    const visibleCanvases = getVisibleCanvasesFromCanvasId(
      vault,
      // @ts-ignore
      manifest,
      activeCanvas,
    );

    viewerDispatch({
      type: "updateVisibleCanvases",
      visibleCanvases,
    });
  }, [activeCanvas, isSmallViewport, manifest, vault, viewerDispatch]);

  /**
   * Get all annotation resources for visible canvases
   */
  useEffect(() => {
    (async () => {
      const visibleAnnotations = await Promise.all(
        visibleCanvases.map((canvas) =>
          getAnnotationResources(vault, canvas.id),
        ),
      );

      setAnnotationResources(visibleAnnotations.flat());
    })();
  }, [visibleCanvases]);

  const hasSearchService = manifest.service.some((service: any) =>
    ["SearchService1", "SearchService2"].includes(
      service.type || service["@type"],
    ),
  );

  // check if search service exists in the manifest
  useEffect(() => {
    if (hasSearchService) {
      const searchService: any = manifest.service.find((service: any) =>
        ["SearchService1", "SearchService2"].includes(
          service.type || service["@type"],
        ),
      );
      if (searchService) {
        setSearchServiceUrl(searchService.id || searchService["@id"]);
      }
    }
  }, [manifest, hasSearchService]);

  // make request to content search service using iiifContentSearchQuery prop
  useEffect(() => {
    if (!searchServiceUrl) return;
    if (configOptions.informationPanel?.renderContentSearch === false) return;

    getContentSearchResources(
      vault,
      searchServiceUrl,
      iiifContentSearchQuery,
    ).then((contentSearch) => setContentSearchResource(contentSearch));
  }, [searchServiceUrl]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className="clover-viewer"
        /*
         * `background` travels as a custom property, not as an inline `background`
         * declaration.
         *
         * It used to be a Stitches `css` prop, which generated a class — so the
         * `[data-fullscreen]` rule, being two selectors deep, outranked it and full screen
         * got its own surface. An inline declaration outranks every rule instead, which
         * left a full-screen viewer transparent. A custom property keeps the value dynamic
         * while leaving the cascade where it was.
         */
        style={
          {
            ...themeStyle,
            "--clover-viewer-background": configOptions?.background,
          } as React.CSSProperties
        }
        data-absolute-position={isAbsolutePosition}
        data-fullscreen={isFullscreen}
        data-information-panel-open={isInformationOpen}
        ref={setRootElement}
      >
        {/*
         * Shown by CSS only while this root is full screen — see the `[data-fullscreen]`
         * block in Viewer.css. A standalone `Image` renders its own, so whichever root
         * the browser put in full screen is the one offering a way back.
         */}
        <ExitFullscreen />
        {/*
         * `polite` so the name of the canvas the reader moved to waits for them to stop
         * typing or navigating, rather than cutting across it.
         */}
        <div
          aria-live="polite"
          className="clover-viewer-announcer"
          data-testid="canvas-announcer"
        >
          {canvasAnnouncement}
        </div>
        <Collapsible.Root
          open={isInformationOpen}
          onOpenChange={setInformationOpen}
        >
          <ViewerHeader
            manifestLabel={manifest.label as InternationalString}
            manifestId={manifest.id}
          />
          <ViewerContent
            activeCanvas={activeCanvas}
            isFullscreen={isFullscreen}
            painting={painting}
            annotationResources={annotationResources}
            searchServiceUrl={searchServiceUrl}
            setContentSearchResource={setContentSearchResource}
            contentSearchResource={contentSearchResource}
            contentSearchCallback={contentSearchCallback}
            initialSearchQuery={iiifContentSearchQuery?.q}
            items={manifest.items}
            isAudioVideo={isAudioVideo}
          />
        </Collapsible.Root>
      </div>
    </ErrorBoundary>
  );
};

export default Viewer;
