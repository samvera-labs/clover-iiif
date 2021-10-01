import React, { createRef } from "react";
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
  active,
  thumbnail,
  handleChange,
}) => {
  const refAnchor = createRef<HTMLAnchorElement>();
  return (
    <MediaItemWrapper
      onClick={() => handleChange(canvasEntity.canvas.id)}
      data-testid="media-item-wrapper"
      data-active={active}
      ref={refAnchor}
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

  figure: {
    margin: "0",
    width: "199px",

    "> div": {
      position: "relative",
      display: "flex",
      backgroundColor: "#f1f1f1",
      overflow: "hidden",
      transition: "all 200ms ease-in-out",

      img: {
        width: "199px",
        height: "123px",
        objectFit: "cover",
        filter: "blur(0)",
        transform: "scale3d(1, 1, 1)",
        transition: "all 200ms ease-in-out",
      },

      [`& ${MediaItemDuration}`]: {
        position: "absolute",
        right: "0.25rem",
        bottom: "0.25rem",
        padding: "0.125rem 0.25rem",
        backgroundColor: "black",
        color: "white",
        fontWeight: "700",
        fontSize: "0.7272rem",
        borderRadius: "1px",
        transition: "all 200ms ease-in-out",
        opacity: "1",
      },
    },

    figcaption: {
      marginTop: "0.382rem",
      fontWeight: "400",
    },
  },

  "&[data-active='true']": {
    figure: {
      "> div": {
        backgroundColor: "black",

        "&::before": {
          position: "absolute",
          zIndex: "1",
          color: "white",
          textTransform: "uppercase",
          fontSize: "0.8333rem",
          fontWeight: "700",
          content: "Now Playing",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        },

        img: {
          opacity: "0.382",
          filter: "blur(2px)",
          transform: "scale3d(1.1, 1.1, 1.1)",
        },

        [`& ${MediaItemDuration}`]: {
          opacity: "0",
        },
      },
    },

    figcaption: {
      fontWeight: "700",
    },
  },
});

export default MediaItem;
