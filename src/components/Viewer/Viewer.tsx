import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import { Media } from "../Media/Media";
import { Navigator } from "../Navigator/Navigator";
import { Video } from "../Video/Video";
import { label } from "../../services/IIIF/presentation";

interface Props {
  manifest: object;
}

export const Viewer: React.FC<Props> = ({ manifest }) => {
  return (
    <ViewerWrapper>
      <Header>
        <span>{label({ en: ["manifest.label"] }, "en")}</span>
      </Header>
      <Main>
        <Video source="uri" poster="uri" tracks={{}} />
        <Media items={{}} activeItem={0} />
        <Navigator currentTime={100} tracks={{}} />
      </Main>
    </ViewerWrapper>
  );
};

const ViewerWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "row",
});

const Header = styled("header", {
  display: "flex",

  span: {
    fontSize: "1.25rem",
    padding: "1rem",
  },
});
