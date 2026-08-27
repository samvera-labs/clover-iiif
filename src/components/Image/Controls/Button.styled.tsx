import { styled } from "src/styles/stitches.config";

const Item = styled("button", {
  display: "flex",
  height: "2rem",
  width: "2rem",
  borderRadius: "2rem",
  padding: "0",
  margin: "0",
  fontFamily: "inherit",
  background: "none",
  /*
   * Light chrome on dark imagery, inverting on interaction.
   *
   * These float over a canvas, so the resting state is the secondary surface with the
   * primary colour on top; hover and focus fill with the accent and flip the glyph back to
   * secondary. The foreground has to be restated in the hover block — at rest it is dark
   * now, so it no longer carries over the way it did when the button was already dark.
   */
  backgroundColor: "$secondary",
  border: "none",
  color: "$primary",
  cursor: "pointer",
  marginLeft: "0.618rem",
  transition: "$all",
  boxSizing: "content-box !important",

  "&:first-child": {
    marginLeft: "0",
  },

  "@xs": {
    marginBottom: "0.618rem",
    marginLeft: "0",

    "&:last-child": {
      marginBottom: "0",
    },
  },

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$primary",
    stroke: "$primary",
    transition: "$all",
    boxSizing: "inherit",
  },

  "&:hover, &:focus": {
    backgroundColor: "$accent",
    color: "$secondary",

    svg: {
      fill: "$secondary",
      stroke: "$secondary",
    },
  },

  "&[data-button=rotate-right]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=rotate-left]": {
    transform: "scaleX(-1)",

    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=reset]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "-15deg",
      },
    },
  },
});

export { Item };
