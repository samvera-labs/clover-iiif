import { Label, Summary } from "src/components/Primitives";

import { styled } from "src/styles/stitches.config";

const Width = styled("div", {
  position: "absolute",
  width: "100%",
  backgroundColor: "green",
});

const FigureStyled = styled("figure", {
  display: "flex",
  flexDirection: "column",
  margin: "0 0 $2",
  flexGrow: "0",
  flexShrink: "0",
  borderRadius: "3px",
  transition: "$all",

  img: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    objectFit: "cover",
    zIndex: "0",
    width: "100%",
    height: "100%",
    color: "transparent",
  },

  video: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    objectFit: "cover",
    zIndex: "1",
    width: "100%",
    height: "100%",
    color: "transparent",
    opacity: "0",
    transition: "$load",
    borderRadius: "3px",
  },

  figcaption: {
    display: "flex",
    flexDirection: "column",
    padding: "$2 0",
    transition: "$all",
  },

  variants: {
    isFocused: {
      true: {
        video: {
          opacity: "1",
        },

        figcaption: {
          color: "$accent",
        },
      },
    },
  },
});

const Placeholder = styled("span", {
  display: "flex",
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: "3px",
  boxShadow: "none",
  transition: "$all",
});

const Title = styled(Label, {
  fontSize: "$3",
  fontWeight: "700",
});

const Description = styled(Summary, {
  fontSize: "$2",
  marginTop: "$1",
});

export { FigureStyled, Placeholder, Title, Description, Width };
