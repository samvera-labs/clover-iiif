import { styled } from "src/styles/stitches.config";

const highlightColor = "255, 197, 32"; // #FFC520

const TextualBody = styled("div", {
  paddingTop: "1.618rem",

  "span.highlight": {
    position: "relative",
    fontWeight: "bold",

    "&::before": {
      top: "0",
      position: "absolute",
      display: "inline",
      content: "",
      width: "calc(100% + 4px)",
      height: "calc(100% + 2px) ",
      marginLeft: "-2px",
      borderRadius: "3px",
      border: `1px solid rgba(${highlightColor}, 0.2)`,
      borderBottom: `1px solid rgba(${highlightColor}, 0.618)`,
      boxShadow: `1px 1px 1px #6661`,
    },

    "&::after": {
      left: "0",
      top: "0",
      position: "absolute",
      display: "inline",
      content: "",
      width: "calc(100% + 4px)",
      height: "calc(100% + 2px) ",
      marginLeft: "-2px",
      marginTop: "-1px",
      borderRadius: "3px",
      backgroundColor: `rgba(${highlightColor}, 0.2)`,
      zIndex: -1,
    },
  },
});

export { TextualBody };
