import { styled } from "src/styles/stitches.config";

const AboutContent = styled("div", {
  padding: "var(--space-4)",
  display: "flex",
  flexDirection: "column",
  overflow: "scroll",
  position: "absolute",
  zIndex: "0",

  img: {
    maxWidth: "100px",
    maxHeight: "100px",
    objectFit: "contain",
    color: "transparent",
    margin: "0 0 1rem",
    borderRadius: "3px",
    backgroundColor: "$secondaryMuted",
  },

  video: {
    display: "none",
  },

  dl: {
    margin: "calc(var(--space-4) * 1.25) 0 0",
  },
});

const AboutStyled = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

export { AboutContent, AboutStyled };
