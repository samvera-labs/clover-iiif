import { styled } from "src/styles/stitches.config";

const AboutContent = styled("div", {
  width: "100%",
  padding: " 0 1.618rem 2rem",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  position: "absolute",
  fontWeight: "400",
  fontSize: "1rem",
  zIndex: "0",

  /*
   * A bounding box rather than a crop: `object-fit: contain` keeps the whole image visible,
   * so these are maxima. Square by default — the height falls back to the width — and
   * `--clover-thumbnail-height` overrides that half alone.
   */
  img: {
    maxWidth: "var(--clover-thumbnail-width, 100px)",
    maxHeight:
      "var(--clover-thumbnail-height, var(--clover-thumbnail-width, 100px))",
    objectFit: "contain",
    color: "transparent",
    margin: "0 0 1rem",
    borderRadius: "3px",
    backgroundColor: "$secondaryMuted",
  },

  video: {
    display: "none",
  },

  "a, a:visited": {
    color: "$accent",
  },

  p: {
    fontSize: "1rem",
    lineHeight: "1.47em",
    margin: "0",
  },

  dl: {
    margin: "0",

    dt: {
      fontWeight: "700",
      margin: "1rem 0 0.25rem",
    },

    dd: {
      margin: "0",
    },
  },

  ".manifest-property-title": {
    fontWeight: "700",
    margin: "1rem 0 0.25rem",
  },

  "ul, ol": {
    padding: "0",
    margin: "0",

    li: {
      fontSize: "1rem",
      lineHeight: "1.45em",
      listStyle: "none",
      margin: "0.25rem 0 0.25rem",
    },
  },
});

const AboutStyled = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

export { AboutContent, AboutStyled };
