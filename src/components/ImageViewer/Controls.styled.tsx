import { styled } from "@/stitches";

const Wrapper = styled("div", {
  position: "absolute",
  zIndex: "1",
  top: "1rem",
  display: "flex",

  "@xs": {
    flexDirection: "column",
    zIndex: "2",
  },

  variants: {
    hasPlaceholder: {
      true: {
        right: "3.618rem",

        "@xs": {
          top: "3.618rem",
          right: "1rem",
        },
      },

      false: {
        right: "1rem",

        "@xs": {
          top: "1rem",
          right: "1rem",
        },
      },
    },
  },
});

export { Wrapper };
