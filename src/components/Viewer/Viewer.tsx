import React from "react";
import { styled } from "@stitches/react";
import {
  ExternalResourceTypes,
  IIIFExternalWebResource,
  InternationalString,
  ManifestNormalized,
} from "@hyperion-framework/types";
import { getCanvasPainting, getLabel } from "hooks/use-hyperion-framework";
import Media from "components/Media/Media";
import Navigator from "components/Navigator/Navigator";
import Player from "components/Player/Player";
import { useViewerState } from "context/viewer-context";
import ImageViewer from "components/ImageViewer/ImageViewer";

interface ViewerProps {
  manifest: ManifestNormalized;
}

const Viewer: React.FC<ViewerProps> = ({ manifest }) => {
  // Get Context state
  const viewerState: any = useViewerState();
  const { activeCanvas, vault } = viewerState;

  // Track some local state
  const [painting, setPainting] = React.useState<
    IIIFExternalWebResource | undefined
  >(undefined);
  const [isMedia, setIsMedia] = React.useState(false);

  // Runs every time a new viewer item is clicked
  React.useEffect(() => {
    const painting = getCanvasPainting(vault, activeCanvas);
    if (painting) {
      setIsMedia(
        ["Audio", "Video"].indexOf(painting.type as ExternalResourceTypes) > -1
          ? true
          : false,
      );
      setPainting({ ...painting });
    }
  }, [activeCanvas]);

  return (
    <ViewerWrapper>
      <Header>
        <span>{getLabel(manifest.label as InternationalString, "en")}</span>
      </Header>
      <ViewerInner>
        <Main>
          {isMedia ? (
            <Player {...(painting as IIIFExternalWebResource)} />
          ) : (
            <ImageViewer {...(painting as IIIFExternalWebResource)}>
              Ima placeholder for the image
            </ImageViewer>
          )}
          <Media items={manifest.items} activeItem={0} />
        </Main>
        <Aside>
          <Navigator currentTime={100} tracks={{}} />
        </Aside>
      </ViewerInner>
    </ViewerWrapper>
  );
};

const ViewerWrapper = styled("section", {
  display: "flex",
  flexDirection: "column",
  padding: "1.618rem",
  fontFamily: "inherit",
});

const ViewerInner = styled("div", {
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "0",
  flexShrink: "1",
  width: "61.8%",
});

const Aside = styled("aside", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  width: "38.2%",
});

const Header = styled("header", {
  display: "flex",

  span: {
    fontSize: "1.25rem",
    fontWeight: "700",
    padding: "1rem 0",
  },
});

export default Viewer;
