import * as Collapsible from "@radix-ui/react-collapsible";

import {
  ExternalResourceTypes,
  InternationalString,
  ManifestNormalized,
} from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import {
  getPaintingResource,
  getSupplementingResources,
} from "src/hooks/use-iiif";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/Viewer/Viewer/ErrorFallback";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import ViewerContent from "src/components/Viewer/Viewer/Content";
import ViewerHeader from "src/components/Viewer/Viewer/Header";
import { Wrapper } from "src/components/Viewer/Viewer/Viewer.styled";
import { media } from "src/styles/stitches.config";
import { useBodyLocked } from "src/hooks/useBodyLocked";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { useViewerState } from "src/context/viewer-context";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme?: any;
}

const Viewer: React.FC<ViewerProps> = ({ manifest, theme }) => {
  /**
   * Viewer State
   */
  const viewerState: any = useViewerState();
  const { activeCanvas, informationExpanded, vault, configOptions } =
    viewerState;

  /**
   * Local state
   */
  const [isMedia, setIsMedia] = useState(false);
  const [isNavigator, setIsNavigator] = useState<boolean>(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(true);
  const [painting, setPainting] = useState<IIIFExternalWebResource | undefined>(
    undefined
  );
  const [resources, setResources] = useState<LabeledResource[]>([]);

  /**
   * Hooks
   */
  const [isBodyLocked, setIsBodyLocked] = useBodyLocked(false);
  const isSmallViewport = useMediaQuery(media.sm);

  useEffect(() => {
    if (!isSmallViewport) {
      setIsNavigatorOpen(true);
      return;
    }
    setIsNavigatorOpen(false);
  }, [isSmallViewport]);

  useEffect(() => {
    if (!isSmallViewport) {
      setIsBodyLocked(false);
      return;
    }
    setIsBodyLocked(isNavigatorOpen);
  }, [isNavigatorOpen]);

  useEffect(() => {
    const painting = getPaintingResource(vault, activeCanvas);
    const resources = getSupplementingResources(
      vault,
      activeCanvas,
      "text/vtt"
    );
    if (painting) {
      setIsMedia(
        ["Sound", "Video"].indexOf(painting.type as ExternalResourceTypes) > -1
          ? true
          : false
      );
      setPainting({ ...painting });
    }
    setResources(resources);
    setIsNavigator(resources.length !== 0);
  }, [activeCanvas]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper
        className={`${theme} clover-iiif`}
        data-body-locked={isBodyLocked}
        data-navigator={isNavigator}
        data-navigator-open={isNavigatorOpen}
      >
        <Collapsible.Root
          open={isNavigatorOpen}
          onOpenChange={setIsNavigatorOpen}
        >
          <ViewerHeader
            manifestLabel={manifest.label as InternationalString}
            manifestId={manifest.id}
          />
          <ViewerContent
            activeCanvas={activeCanvas}
            painting={painting as IIIFExternalWebResource}
            resources={resources}
            items={manifest.items}
            isAbout={configOptions.renderAbout}
            isMedia={isMedia}
            isInformation={informationExpanded}
            isNavigator={isNavigator}
            isNavigatorOpen={isNavigatorOpen}
          />
        </Collapsible.Root>
      </Wrapper>
    </ErrorBoundary>
  );
};

export default Viewer;
