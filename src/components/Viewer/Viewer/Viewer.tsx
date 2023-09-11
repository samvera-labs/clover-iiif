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
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/Viewer/Viewer/ErrorFallback";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import ViewerContent from "src/components/Viewer/Viewer/Content";
import ViewerHeader from "src/components/Viewer/Viewer/Header";
import { Wrapper } from "src/components/Viewer/Viewer/Viewer.styled";
import { imaBlue } from "src/components/Viewer/Viewer/vanilla-extract2.css";
import { imaRed } from "src/components/Viewer/Viewer/vanilla-extract.css";
import { media } from "src/styles/stitches.config";
import { useBodyLocked } from "src/hooks/useBodyLocked";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme?: any;
}

const Viewer: React.FC<ViewerProps> = ({ manifest, theme }) => {
  /**
   * Viewer State
   */
  const viewerState: any = useViewerState();
  const viewerDispatch: any = useViewerDispatch();
  const { activeCanvas, informationOpen, vault, configOptions } = viewerState;

  /**
   * Local state
   */

  const [isInformationPanel, setIsInformationPanel] = useState<boolean>(false);
  const [isAudioVideo, setIsAudioVideo] = useState(false);
  const [painting, setPainting] = useState<IIIFExternalWebResource | undefined>(
    undefined
  );
  const [resources, setResources] = useState<LabeledResource[]>([]);

  const [isBodyLocked, setIsBodyLocked] = useBodyLocked(false);
  const isSmallViewport = useMediaQuery(media.sm);

  const setInformationOpen = (open: boolean) => {
    viewerDispatch({
      type: "updateInformationOpen",
      informationOpen: open,
    });
  };

  useEffect(() => {
    if (configOptions?.informationPanel.open)
      setInformationOpen(!isSmallViewport);
  }, [isSmallViewport]);

  useEffect(() => {
    if (!isSmallViewport) {
      setIsBodyLocked(false);
      return;
    }
    setIsBodyLocked(informationOpen);
  }, [informationOpen]);

  useEffect(() => {
    const painting = getPaintingResource(vault, activeCanvas);
    const resources = getSupplementingResources(
      vault,
      activeCanvas,
      "text/vtt"
    );
    if (painting) {
      setIsAudioVideo(
        ["Sound", "Video"].indexOf(painting.type as ExternalResourceTypes) > -1
          ? true
          : false
      );
      setPainting({ ...painting });
    }
    setResources(resources);
    setIsInformationPanel(resources.length !== 0);
  }, [activeCanvas]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper
        className={`${theme} clover-iiif`}
        css={{ background: configOptions?.background }}
        data-body-locked={isBodyLocked}
        data-information-panel={isInformationPanel}
        data-information-panel-open={informationOpen}
      >
        <Collapsible.Root
          open={informationOpen}
          onOpenChange={setInformationOpen}
        >
          <ViewerHeader
            manifestLabel={manifest.label as InternationalString}
            manifestId={manifest.id}
          />
          <div className={imaRed}>Testing a vanilla extract style</div>
          <div className={imaBlue}>Testing another style</div>
          <ViewerContent
            activeCanvas={activeCanvas}
            painting={painting as IIIFExternalWebResource}
            resources={resources}
            items={manifest.items}
            isAudioVideo={isAudioVideo}
          />
        </Collapsible.Root>
      </Wrapper>
    </ErrorBoundary>
  );
};

export default Viewer;
