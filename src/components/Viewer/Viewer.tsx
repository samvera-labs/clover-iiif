import React from "react";
import { styled } from "@stitches/react";
import { ManifestNormalized } from "@hyperion-framework/types";
import Media from "../Media/Media";
import Navigator from "../Navigator/Navigator";
import Player from "components/Player/Player";
import { getLabel } from "../../services/iiif";

interface ViewerProps {
  manifest: ManifestNormalized;
  activeCanvas: any;
}

const Viewer: React.FC<ViewerProps> = ({ manifest }) => {
  const streamingUrl: string =
    "https://meadow-streaming.rdc-staging.library.northwestern.edu/85/bd/1f/cd/-5/ff/6-/45/fb/-a/c5/1-/e4/56/44/6d/cb/00/6298d09f04833eb737504941812b0442e6253a4e286e79db3b11e16f9b39c604-1080.m3u8";
  const publicUrl: string =
    "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";

  return (
    <ViewerWrapper>
      <Header>
        <span>{getLabel(manifest.label, "en")}</span>
      </Header>
      <ViewerInner>
        <Main>
          <Player streamingUrl={publicUrl} />
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
