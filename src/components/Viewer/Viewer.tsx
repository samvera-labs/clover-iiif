import React from "react";
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
  Header,
  Aside,
} from "./Viewer.styled";

interface ViewerProps {
  manifest: ManifestNormalized;
  theme: any;
}

const Viewer: React.FC<ViewerProps> = ({ manifest, theme }) => {
  // Get Context state
  const viewerState: any = useViewerState();
  const { activeCanvas, vault } = viewerState;

  // Track some local state
  const [painting, setPainting] = React.useState<
    IIIFExternalWebResource | undefined
  >(undefined);
  const [isMedia, setIsMedia] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  // Runs every time a new viewer item is clicked
  React.useEffect(() => {
    const painting = getPaintingResource(vault, activeCanvas);
    if (painting) {
      setIsMedia(
        ["Sound", "Video"].indexOf(painting.type as ExternalResourceTypes) > -1
          ? true
          : false,
      );
      setPainting({ ...painting });
    }
  }, [activeCanvas]);

  const resources = getSupplementingResources(vault, activeCanvas, "text/vtt");

  const handleCurrentTime = (t: number) => {
    setCurrentTime(t);
  };

  return (
    <ViewerWrapper className={theme}>
      <Header>
        <span>{getLabel(manifest.label as InternationalString, "en")}</span>
      </Header>
      <ViewerInner>
        <Main>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
              currentTime={handleCurrentTime}
            />
          ) : (
            <ImageViewer {...(painting as IIIFExternalWebResource)}>
              Ima placeholder for the image
            </ImageViewer>
          )}
          <Media items={manifest.items} activeItem={0} />
        </Main>
        {resources.length > 0 && (
          <Aside>
            <Navigator
              activeCanvas={activeCanvas}
              currentTime={currentTime}
              defaultResource={resources[0].id as string}
              resources={resources}
            />
          </Aside>
        )}
      </ViewerInner>
    </ViewerWrapper>
  );
};

export default Viewer;
