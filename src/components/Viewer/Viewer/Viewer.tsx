import * as Collapsible from "@radix-ui/react-collapsible";

import {
  ExternalResourceTypes,
  InternationalString,
  ManifestNormalized,
  CanvasNormalized,
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import React, { useCallback, useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import {
  getAnnotationResources,
  getPaintingResource,
  getContentSearchResources,
} from "src/hooks/use-iiif";
import {
  addOverlaysToViewer,
  removeOverlaysFromViewer,
} from "src/lib/openseadragon-helpers";

import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import ViewerContent from "src/components/Viewer/Viewer/Content";
import ViewerHeader from "src/components/Viewer/Viewer/Header";
import { Wrapper } from "src/components/Viewer/Viewer/Viewer.styled";
import { media } from "src/styles/stitches.config";
import { useBodyLocked } from "src/hooks/useBodyLocked";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme?: unknown;
  iiifContentSearch?: string;
}

const Viewer: React.FC<ViewerProps> = ({
  manifest,
  theme,
  iiifContentSearch,
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

  const [isBodyLocked, setIsBodyLocked] = useBodyLocked(false);
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
  }, [
    isSmallViewport,
    configOptions?.informationPanel?.open,
    setInformationOpen,
  ]);

  useEffect(() => {
    if (!isSmallViewport) {
      setIsBodyLocked(false);
      return;
    }
    setIsBodyLocked(isInformationOpen);
  }, [isInformationOpen, isSmallViewport, setIsBodyLocked]);

  useEffect(() => {
    const painting = getPaintingResource(vault, activeCanvas);

    if (painting) {
      setIsAudioVideo(
        ["Sound", "Video"].indexOf(painting[0].type as ExternalResourceTypes) >
          -1
          ? true
          : false,
      );
      setPainting(painting);
    }

    const resources = getAnnotationResources(vault, activeCanvas);

    if (resources.length > 0) {
      viewerDispatch({
        type: "updateInformationOpen",
        isInformationOpen: true,
      });
    }

    setAnnotationResources(resources);
    setIsInformationPanel(resources.length !== 0);
  }, [activeCanvas, vault, viewerDispatch]);

  // make request to content search service using iiifContentSearch prop
  useEffect(() => {
    if (iiifContentSearch === undefined) return;
    if (configOptions.informationPanel?.renderContentSearch === false) return;

    getContentSearchResources(
      contentSearchVault,
      iiifContentSearch,
      configOptions.localeText?.contentSearch?.tabLabel as string,
    ).then((contentSearch) => {
      setContentSearchResource(contentSearch);
    });
  }, [iiifContentSearch, contentSearchVault, configOptions]);

  // add overlays for content search
  useEffect(() => {
    if (!openSeadragonViewer) return;
    if (!contentSearchResource) return;

    const canvas: CanvasNormalized = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });

    removeOverlaysFromViewer(openSeadragonViewer);
    addContentSearchOverlays(
      contentSearchVault,
      contentSearchResource,
      openSeadragonViewer,
      canvas,
      configOptions,
    );
  }, [
    contentSearchVault,
    configOptions,
    openSeadragonViewer,
    activeCanvas,
    vault,
    contentSearchResource,
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

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper
        className={`${theme} clover-viewer`}
        css={{ background: configOptions?.background }}
        data-body-locked={isBodyLocked}
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
          />
        </Collapsible.Root>
      </Wrapper>
    </ErrorBoundary>
  );
};

export default Viewer;

function addContentSearchOverlays(
  contentSearchVault: any,
  contentSearch: AnnotationPageNormalized,
  openSeadragonViewer,
  canvas: CanvasNormalized,
  configOptions,
) {
  const annotations: Array<AnnotationNormalized> = [];
  contentSearch?.items?.forEach((item) => {
    const annotation = contentSearchVault.get(item.id) as AnnotationNormalized;

    if (typeof annotation.target === "string") {
      if (annotation.target.startsWith(canvas.id)) {
        annotations.push(annotation as unknown as AnnotationNormalized);
      }
    }
  });

  if (openSeadragonViewer) {
    addOverlaysToViewer(
      openSeadragonViewer,
      canvas,
      configOptions,
      annotations,
    );
  }
}
