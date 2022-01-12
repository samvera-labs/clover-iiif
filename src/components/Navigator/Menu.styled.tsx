import { styled, keyframes } from "stitches";

const spin = keyframes({
  from: { transform: "rotate(360deg)" },
  to: { transform: "rotate(0deg)" },
});

export const MenuStyled = styled("ul", {
  listStyle: "none",
  paddingLeft: "1rem",
  position: "relative",

  "&&:first-child": {
    paddingLeft: "0",
  },
});

export const MenuItemStyled = styled("li", {
  variants: {
    isActive: {
      true: {
        color: "$primary",
        backgroundColor: "$secondaryMuted",

        "&::before": {
          content: "",
          width: "6px",
          height: "6px",
          position: "absolute",
          backgroundColor: "transparent",
          border: "3px solid $accentMuted",
          borderRadius: "12px",
          left: "8px",
          top: "8px",
          marginTop: "4px",
          opacity: "1",
          animation: "1s linear infinite",
          animationName: spin,
          boxSizing: "content-box",

          "@sm": {
            content: "unset",
          },
        },

        "&::after": {
          content: "",
          width: "6px",
          height: "6px",
          position: "absolute",
          backgroundColor: "transparent",
          border: "3px solid $accent",
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          borderRadius: "12px",
          left: "8px",
          top: "8px",
          marginTop: "4px",
          opacity: "1",
          animation: "1.5s linear infinite",
          animationName: spin,
          boxSizing: "content-box",

          "@sm": {
            content: "unset",
          },
        },
      },
    },
  },
});
