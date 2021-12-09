import * as RadioGroup from "@radix-ui/react-radio-group";
import { styled } from "stitches";
import { Tag } from "@nulib/design-system";

const Type = styled("span", {
  display: "flex",
});

const Spacer = styled("span", {
  display: "flex",
  width: "1.2111rem",
  height: "0.7222rem",
});

const Duration = styled("span", {
  display: "inline-flex",
  marginLeft: "5px",
  marginBottom: "-1px",
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

  "@sm": {
    margin: "0 1rem 0 0",

    "&:last-child": {
      marginRight: "0",
    },
  },

  figure: {
    margin: "0",
    width: "161.8px",

    "@sm": {
      width: "123px",
    },

    "> div": {
      position: "relative",
      display: "flex",
      backgroundColor: "$secondaryAlt",
      width: "inherit",
      height: "100px",
      overflow: "hidden",
      borderRadius: "3px",
      transition: "$all",

      "@sm": {
        height: "76px",
      },

      img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "blur(0)",
        transform: "scale3d(1, 1, 1)",
        transition: "$all",
        color: "transparent",
      },

      [`& ${Type}`]: {
        position: "absolute",
        right: "0.5rem",
        bottom: "0.5rem",

        "@sm": {
          right: "0",
          bottom: "0",
        },

        [`& ${Tag}`]: {
          margin: "0",
          paddingLeft: "0",
          fontSize: "0.7222rem",
          backgroundColor: "#000d",
          color: "$secondary",
          fill: "$secondary",

          "@sm": {
            borderBottomLeftRadius: "0",
            borderTopRightRadius: "0",
          },
        },
      },
    },

    figcaption: {
      marginTop: "0.5rem",
      color: "$primaryMuted",
      fontSize: "1rem",
      fontWeight: "400",

      "@sm": {
        fontSize: "0.8333rem",
      },
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

          "@sm": {
            fontSize: "0.6111rem",
          },
        },

        img: {
          opacity: "0.5",
          transform: "scale3d(1.1, 1.1, 1.1)",
          filter: "blur(1px)",
        },

        [`& ${Type}`]: {
          [`& ${Tag}`]: {
            backgroundColor: "$accent",
          },
        },
      },
    },

    figcaption: {
      fontWeight: "700",
      color: "$primary",
    },
  },
});

export { Duration, Item, Spacer, Type };
