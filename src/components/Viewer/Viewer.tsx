import React, { useEffect, useState } from "react";
import {
  ExternalResourceTypes,
  IIIFExternalWebResource,
  InternationalString,
  ManifestNormalized,
} from "@hyperion-framework/types";
import {
  getLabel,
  getPaintingResource,
  getSupplementingResources,
} from "hooks/use-hyperion-framework";
import Media from "components/Media/Media";
import Navigator from "components/Navigator/Navigator";
import Player from "components/Player/Player";
import { useViewerState } from "context/viewer-context";
import ImageViewer from "components/ImageViewer/ImageViewer";
import {
  ViewerWrapper,
  ViewerInner,
  Main,
  CollapsibleTrigger,
  CollapsibleContent,
  MediaWrapper,
  Header,
  Aside,
} from "./Viewer.styled";
import { Button } from "@nulib/design-system";
import { useMediaQuery } from "hooks/useMediaQuery";
import { useBodyLocked } from "hooks/useBodyLocked";
import { media } from "stitches";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import * as Collapsible from "@radix-ui/react-collapsible";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme?: any;
}

const Viewer: React.FC<ViewerProps> = ({ manifest, theme }) => {
  // context state
  const viewerState: any = useViewerState();
  const { activeCanvas, configOptions, vault } = viewerState;

  // local state
  const [painting, setPainting] = useState<IIIFExternalWebResource | undefined>(
    undefined,
  );
  const [resources, setResources] = useState<LabeledResource[]>([]);
  const [isMedia, setIsMedia] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isNavigator, setIsNavigator] = useState<boolean>(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(true);
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
      "text/vtt",
    );
    if (painting) {
      setIsMedia(
        ["Sound", "Video"].indexOf(painting.type as ExternalResourceTypes) > -1
          ? true
          : false,
      );
      setPainting({ ...painting });
    }
    setResources(resources);
    setIsNavigator(resources.length !== 0);
  }, [activeCanvas]);

  const handleCurrentTime = (t: number) => setCurrentTime(t);

  return (
    <ViewerWrapper
      className={theme}
      data-body-locked={isBodyLocked}
      data-navigator={isNavigator}
      data-navigator-open={isNavigatorOpen}
    >
      <Collapsible.Root
        open={isNavigatorOpen}
        onOpenChange={setIsNavigatorOpen}
      >
        {configOptions.showTitle && (
          <Header>
            <span>{getLabel(manifest.label as InternationalString, "en")}</span>
          </Header>
        )}
        <ViewerInner>
          <Main>
            {isMedia ? (
              <Player
                painting={painting as IIIFExternalWebResource}
                resources={resources}
                currentTime={handleCurrentTime}
              />
            ) : (
              <ImageViewer {...(painting as IIIFExternalWebResource)} />
            )}
            <CollapsibleTrigger data-navigator={isNavigator}>
              <Button as="span">
                {isNavigatorOpen ? "View Media Items" : "View Navigator"}
              </Button>
            </CollapsibleTrigger>
            <MediaWrapper>
              <Media items={manifest.items} activeItem={0} />
            </MediaWrapper>
          </Main>
          {isNavigator && (
            <Aside>
              <CollapsibleContent>
                <Navigator
                  activeCanvas={activeCanvas}
                  currentTime={currentTime}
                  defaultResource={resources[0].id as string}
                  resources={resources}
                />
              </CollapsibleContent>
            </Aside>
          )}
        </ViewerInner>
      </Collapsible.Root>
    </ViewerWrapper>
  );
};

export default Viewer;
