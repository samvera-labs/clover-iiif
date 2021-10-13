import React, { createRef } from "react";
import { styled } from "@stitches/react";
import { getLabel } from "hooks/use-hyperion-framework";
import { convertTime } from "services/utils";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
  InternationalString,
} from "@hyperion-framework/types";
import { theme } from "theme";

export interface MediaItemProps {
  canvas: CanvasNormalized;
  active: boolean;
  thumbnail?: IIIFExternalWebResource;
  handleChange: (arg0: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  canvas,
  active,
  thumbnail,
  handleChange,
}) => {
  const refAnchor = createRef<HTMLAnchorElement>();
  return (
    <MediaItemWrapper
      onClick={() => handleChange(canvas.id)}
      data-testid="media-item-wrapper"
      data-active={active}
      ref={refAnchor}
    >
      <figure>
        <div>
          {thumbnail?.id && <img src={thumbnail.id} />}
          <MediaItemDuration>
            {convertTime(canvas.duration as number)}
          </MediaItemDuration>
        </div>
        <figcaption>
          {canvas.label && getLabel(canvas.label as InternationalString, "en")}
        </figcaption>
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
      backgroundColor: theme.color.secondaryAlt,
      width: "199px",
      height: "123px",
      overflow: "hidden",
      transition: theme.transition.all,

      img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "blur(0)",
        transform: "scale3d(1, 1, 1)",
        transition: theme.transition.all,
      },

      [`& ${MediaItemDuration}`]: {
        position: "absolute",
        right: "0",
        bottom: "0",
        padding: "0.25rem 0.5rem 0.2rem",
        backgroundColor: theme.color.primaryAlt,
        color: theme.color.secondary,
        fontSize: "0.8333rem",
        borderRadius: "1px",
        opacity: "1",

        "&::after": {
          color: "white",
          width: "0",
          content: "Active Item",
          fontSize: "0",
        },
      },
    },

    figcaption: {
      marginTop: "0.5rem",
      color: theme.color.primaryMuted,
      fontSize: "1rem",
      fontWeight: "400",
    },
  },

  "&[data-active='true']": {
    figure: {
      "> div": {
        backgroundColor: theme.color.primary,

        "&::before": {
          position: "absolute",
          zIndex: "1",
          color: theme.color.secondary,
          textTransform: "uppercase",
          fontWeight: "700",
          content: "",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        },

        img: {
          opacity: "0.5",
          transform: "scale3d(1.1, 1.1, 1.1)",
          filter: "blur(1px)",
        },

        [`& ${MediaItemDuration}`]: {
          color: "transparent",
          fontSize: "0",
          backgroundColor: theme.color.accent,

          "&::after": {
            color: "white",
            width: "auto",
            content: "Active Item",
            fontSize: "0.8333rem",
          },
        },
      },
    },

    figcaption: {
      fontWeight: "700",
      color: theme.color.primary,
    },
  },
});

export default MediaItem;
