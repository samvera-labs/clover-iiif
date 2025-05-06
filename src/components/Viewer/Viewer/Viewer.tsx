import * as Collapsible from "@radix-ui/react-collapsible";

import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  ExternalResourceTypes,
  InternationalString,
  ManifestNormalized,
} from "@iiif/presentation-3";
import React, { useCallback, useEffect, useState } from "react";
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
import { Wrapper } from "src/components/Viewer/Viewer/Viewer.styled";
import { getVisibleCanvasesFromCanvasId } from "@iiif/helpers";
import { media } from "src/styles/stitches.config";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme?: unknown;
  iiifContentSearchQuery?: ContentSearchQuery;
}

const Viewer: React.FC<ViewerProps> = ({
  manifest,
  theme,
  iiifContentSearchQuery,
}) => {
  /**
   * Viewer State
   */
  const viewerState: ViewerContextStore = useViewerState();
  const viewerDispatch: any = useViewerDispatch();
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
      <Wrapper
        className={`${theme} clover-viewer`}
        css={{ background: configOptions?.background }}
        data-absolute-position={isAbsolutePosition}
        data-information-panel-open={isInformationOpen}
      >
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
            painting={painting}
            annotationResources={annotationResources}
            searchServiceUrl={searchServiceUrl}
            setContentSearchResource={setContentSearchResource}
            contentSearchResource={contentSearchResource}
            items={manifest.items}
            isAudioVideo={isAudioVideo}
          />
        </Collapsible.Root>
      </Wrapper>
    </ErrorBoundary>
  );
};

export default Viewer;
