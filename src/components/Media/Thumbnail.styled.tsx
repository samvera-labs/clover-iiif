import * as RadioGroup from "@radix-ui/react-radio-group";
import { styled } from "stitches";

const Duration = styled("span", {
  display: "flex",
});

const Item = styled(RadioGroup.Item, {
  display: "flex",
  flexShrink: "0",
  margin: "0 1.618rem 0 0",
  padding: "0",
  cursor: "pointer",
  background: "none",
  border: "none",
  fontFamily: "inherit",
  lineHeight: "1.25em",
  fontSize: "1rem",
  textAlign: "left",

  figure: {
    margin: "0",
    width: "199px",

    "> div": {
      position: "relative",
      display: "flex",
      backgroundColor: "$secondaryAlt",
      width: "199px",
      height: "123px",
      overflow: "hidden",
      transition: "$all",

      img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "blur(0)",
        transform: "scale3d(1, 1, 1)",
        transition: "$all",
        color: "transparent",
      },

      [`& ${Duration}`]: {
        position: "absolute",
        right: "0",
        bottom: "0",
        padding: "0.25rem 0.5rem 0.2rem",
        backgroundColor: "$primaryAlt",
        color: "$secondary",
        fontSize: "0.8333rem",
        borderRadius: "1px",
        opacity: "1",
      },
    },

    figcaption: {
      marginTop: "0.5rem",
      color: "$primaryMuted",
      fontSize: "1rem",
      fontWeight: "400",
    },
  },

  "&[aria-checked='true']": {
    figure: {
      "> div": {
        backgroundColor: "$primaryAlt",

        "&::before": {
          position: "absolute",
          zIndex: "1",
          color: "$secondary",
          content: "Active Item",
          fontWeight: "700",
          textTransform: "uppercase",
          fontSize: "0.7222rem",
          letterSpacing: "0.03rem",
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

        [`& ${Duration}`]: {
          backgroundColor: "$accent",
        },
      },
    },

    figcaption: {
      fontWeight: "700",
      color: "$primary",
    },
  },
});

export { Duration, Item };
