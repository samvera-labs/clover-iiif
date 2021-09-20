import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  poster: string;
  source: string;
  tracks: object;
}

export const Video: React.FC<Props> = ({ source }) => {
  return (
    <VideoWrapper>
      <video src={source}></video>
    </VideoWrapper>
  );
};

const VideoWrapper = styled("div", {
  width: "61.8%",

  video: {
    width: "100%",
    backgroundColor: "#e0e0e0",
  },
});
