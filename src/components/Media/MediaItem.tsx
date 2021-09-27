import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import { getLabel } from "../../services/iiif";
import { CanvasNormalized } from "@hyperion-framework/types";

interface Props {
  index: number;
  canvas: CanvasNormalized;
  active: boolean;
}

const handleUpdate = (): any => {
  return;
};

const MediaItem: React.FC<Props> = ({ canvas }) => {
  return (
    <MediaItemWrapper onClick={handleUpdate()}>
      <figure>
        <img src="" />
        <figcaption>{getLabel(canvas.label, "en")}</figcaption>
      </figure>
    </MediaItemWrapper>
  );
};

const MediaItemWrapper = styled("a", {
  display: "flex",
  flexShrink: "0",
  margin: "0 1.618rem 0 0",
  cursor: "pointer",

  "&.active": {
    backgroundColor: "black",
  },

  figure: {
    margin: "0",
    width: "199px",

    img: {
      width: "199px",
      height: "123px",
      objectFit: "cover",
    },

    figcaption: {
      marginTop: "0.382rem",
      fontWeight: "400",
    },
  },
});

export default MediaItem;
