import { styled } from "src/styles/stitches.config";

const Wrapper = styled("div", {
  position: "absolute",
  zIndex: "1",
  top: "1rem",
  right: "1rem",
  display: "flex",

  "@xs": {
    flexDirection: "column",
    zIndex: "2",
  },

  variants: {
    hasPlaceholder: {
      true: {
        right: "3.618rem",
        "@xs": { top: "3.618rem", right: "1rem" },
      },
      false: {
        right: "1rem",
        "@xs": { top: "1rem", right: "1rem" },
      },
    },
    hasInformationToggle: {
      true: {},
      false: {},
    },
    panelOpen: {
      true: {},
      false: {},
    },
  },

  compoundVariants: [
    {
      hasPlaceholder: false,
      hasInformationToggle: true,
      panelOpen: false,
      css: { right: "3.618rem", "@xs": { top: "3.618rem", right: "1rem" } },
    },
    {
      hasPlaceholder: true,
      hasInformationToggle: true,
      panelOpen: false,
      css: { right: "6.236rem", "@xs": { top: "6.236rem", right: "1rem" } },
    },
    {
      hasPlaceholder: false,
      hasInformationToggle: true,
      panelOpen: true,
      css: { right: "1.382rem" },
    },
    {
      hasPlaceholder: true,
      hasInformationToggle: true,
      panelOpen: true,
      css: { right: "4rem" },
    },
  ],
});

export { Wrapper };
