import { globalCss } from "@stitches/react";

const globalCloverImage = globalCss({
  ".clover-theme--image": {
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
    height: "100%",
    maxHeight: "100%",
    minHeight: "100%",
    backgroundColor: "var(--gray-4)",
  },
});

const globalCloverViewer = globalCss({});

export { globalCloverImage, globalCloverViewer };
