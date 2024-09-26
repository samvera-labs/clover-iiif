import { Box } from "@radix-ui/themes";
import { styled } from "src/styles/stitches.config";

const Navigator = styled(Box, {
  zIndex: "1",
  backgroundColor: "var(--gray-12)",
  boxShadow: "var(--shadow-5)",
  objectFit: "cover",
  width: "161.8px",
  height: "100px",

  ".displayregion": {
    border: "2px solid var(--accent-10) !important",
    boxShadow: "var(--shadow-3)",
  },

  "@sm": {
    width: "123px",
    height: "76px",
  },

  "@xs": {
    width: "100px",
    height: "61.8px",
  },
});

const Viewport = styled(Box, {});

const Wrapper = styled(Box, {
  objectFit: "cover",
  background: "transparent",
  backgroundSize: "contain",
  boxShadow: "var(--shadow-4)",

  variants: {
    hasNavigator: {
      true: {
        [`${Navigator}`]: {
          display: "block",
        },
      },
      false: {
        [`${Navigator}`]: {
          display: "none",
        },
      },
    },
  },
});

export { Navigator, Viewport, Wrapper };
