import React, { useEffect } from "react";
import { styled } from "@stitches/react";
import { getLabel } from "services/iiif";
import { convertTime } from "services/utils";

interface Props {
  canvasEntity: object;
  active: boolean;
  thumbnail: object;
  handleChange: (arg0: string) => void;
}

const MediaItem: React.FC<Props> = ({
  canvasEntity,
  thumbnail,
  handleChange,
}) => {
  return (
    <MediaItemWrapper
      onClick={() => handleChange(canvasEntity.canvas.id)}
      data-testid="media-item-wrapper"
    >
      <figure>
        <div>
          <img src={thumbnail.src} />
          <MediaItemDuration>
            {convertTime(canvasEntity.canvas.duration)}
          </MediaItemDuration>
        </div>
        <figcaption>{getLabel(canvasEntity.canvas.label, "en")}</figcaption>
      </figure>
    </MediaItemWrapper>
  );
};

const MediaItemDuration = styled("span", {
  display: "flex",
});

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

    "> div": {
      position: "relative",
      display: "flex",
      boxShadow: "2px 2px 5px #00000011",
      backgroundColor: "#f1f1f1",

      [`& ${MediaItemDuration}`]: {
        position: "absolute",
        right: "0.25rem",
        bottom: "0.25rem",
        padding: "0.125rem 0.25rem",
        backgroundColor: "black",
        color: "white",
        fontWeight: "700",
        fontSize: "0.722rem",
        borderRadius: "1px",
      },
    },

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
