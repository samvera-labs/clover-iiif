import * as Collapsible from "@radix-ui/react-collapsible";

import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  CanvasNormalized,
  ExternalResourceTypes,
  InternationalString,
  ManifestNormalized,
  Reference,
} from "@iiif/presentation-3";
import React, { useCallback, useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import {
  addContentSearchOverlays,
  handleSelectorZoom,
  removeOverlaysFromViewer,
} from "src/lib/openseadragon-helpers";
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
    activeSelector,
    isInformationOpen,
    vault,
    contentSearchVault,
    configOptions,
    openSeadragonViewer,
  } = viewerState;

  const absoluteCanvasHeights = ["100%", "auto"];
  const isAbsolutePosition =
    configOptions?.canvasHeight &&
    absoluteCanvasHeights.includes(configOptions?.canvasHeight);

  /**
   * Local state
   */
  const [isInformationPanel, setIsInformationPanel] = useState<boolean>(false);
  const [isAudioVideo, setIsAudioVideo] = useState(false);
  const [painting, setPainting] = useState<IIIFExternalWebResource[]>([]);
  const [annotationResources, setAnnotationResources] =
    useState<AnnotationResources>([]);
  const [contentSearchResource, setContentSearchResource] =
    useState<AnnotationResource>();

  const isSmallViewport = useMediaQuery(media.sm);
  const [searchServiceUrl, setSearchServiceUrl] = useState();
  const [visibleCanvases, setVisibleCanvases] = useState<Reference<"Canvas">[]>(
    [],
  );

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

    setVisibleCanvases(visibleCanvases);

    getAnnotationResources(vault, activeCanvas).then((resources) => {
      if (resources.length > 0 && !isSmallViewport) {
        viewerDispatch({
          type: "updateInformationOpen",
          isInformationOpen: true,
        });
      }
      setAnnotationResources(resources);
      setIsInformationPanel(resources.length !== 0);
    });

    // Handle selector zoom when canvas is drawn
    if (openSeadragonViewer && activeCanvas && activeSelector) {
      const canvas = vault.get({
        id: activeCanvas,
        type: "Canvas",
      }) as CanvasNormalized;

      // Add a small delay to ensure the image is loaded
      setTimeout(() => {
        handleSelectorZoom(
          activeSelector,
          openSeadragonViewer,
          canvas,
          configOptions,
        );
      }, 300);
    }
  }, [
    activeCanvas,
    activeSelector,
    annotationResources.length,
    isSmallViewport,
    manifest,
    vault,
    viewerDispatch,
    openSeadragonViewer,
    configOptions,
  ]);

  const hasSearchService = manifest.service.some(
    (service: any) => service.type === "SearchService2",
  );

  // check if search service exists in the manifest
  useEffect(() => {
    if (hasSearchService) {
      const searchService: any = manifest.service.find(
        (service: any) => service.type === "SearchService2",
      );
      if (searchService) {
        setSearchServiceUrl(searchService.id);
      }
    }
  }, [manifest, hasSearchService]);

  // make request to content search service using iiifContentSearchQuery prop
  useEffect(() => {
    if (!searchServiceUrl) return;
    if (configOptions.informationPanel?.renderContentSearch === false) return;

    getContentSearchResources(
      contentSearchVault,
      searchServiceUrl,
      configOptions.localeText?.contentSearch?.tabLabel as string,
      iiifContentSearchQuery,
    ).then((contentSearch) => {
      setContentSearchResource(contentSearch);
    });
  }, [searchServiceUrl]);

  // add overlays for content search
  useEffect(() => {
    if (!openSeadragonViewer) return;
    if (!contentSearchResource) return;

    const canvas = vault.get({
      id: activeCanvas,
      type: "Canvas",
    }) as CanvasNormalized;

    removeOverlaysFromViewer(openSeadragonViewer, "content-search-overlay");
    addContentSearchOverlays(
      contentSearchVault,
      contentSearchResource,
      openSeadragonViewer,
      canvas,
      configOptions,
    );
  }, [openSeadragonViewer, contentSearchResource]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper
        className={`${theme} clover-viewer`}
        css={{ background: configOptions?.background }}
        data-absolute-position={isAbsolutePosition}
        data-information-panel={isInformationPanel}
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
            visibleCanvases={visibleCanvases}
          />
        </Collapsible.Root>
      </Wrapper>
    </ErrorBoundary>
  );
};

export default Viewer;
