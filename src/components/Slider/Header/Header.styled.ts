import { styled } from "src/styles/stitches.config";

const HeaderContent = styled("div", {
  display: "flex",
  flexDirection: "column",
});

/**
 * The position readout, `3 / 138`.
 *
 * A plain label beside the arrows rather than a pill wrapped around them, which is how the
 * Viewer's media strip used to draw it. Wrapping the arrows made that bar a different shape
 * from the Slider's, and the arrows are the part that should look identical in both.
 */
const HeaderCounter = styled("span", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  flexShrink: 0,
  height: "2rem",
  padding: "0 $3",
  borderRadius: "2rem",
  backgroundColor: "$secondary",
  color: "$primary",
  fontSize: "0.7222rem",
  fontWeight: "bold",
  whiteSpace: "nowrap",

  em: {
    opacity: "0.25",
  },
});

/** The filter field, shown in place of the counter while filtering is open. */
const HeaderSearchInput = styled("input", {
  flexGrow: "1",
  minWidth: "0",
  width: "100%",
  maxWidth: "16rem",
  border: "none",
  backgroundColor: "$secondaryMuted",
  color: "$primary",
  height: "2rem",
  padding: "0 1rem",
  borderRadius: "2rem",
  fontFamily: "inherit",
  fontSize: "1rem",
  lineHeight: "1rem",

  "&::placeholder": {
    color: "$primaryMuted",
  },
});

const HeaderControls = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  // Spacing lives here now. The shared control carries no margin of its own, so that one
  // button can serve both this row and the media strip's tighter pager.
  gap: "$2",
  // Lets the filter field shrink rather than push the label out of the row.
  minWidth: "0",
  paddingLeft: "$5",
  paddingRight: "$4",

  "@xs": {
    width: "100%",
    justifyContent: "center",
    padding: "$4 $1 0 0",
  },
});

const HeaderStyled = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: "$4",
  margin: "0",
  lineHeight: "1.4em",
  alignItems: "flex-end",

  "@xs": {
    flexDirection: "column",
  },

  ".clover-slider-header-homepage": {
    textDecoration: "none",
  },

  ".clover-slider-header-label": {
    fontSize: "1.25rem",
    fontWeight: "400",
  },

  ".clover-slider-header-summary": {
    fontSize: "$4",
    marginTop: "$2",
  },
});

export {
  HeaderContent,
  HeaderControls,
  HeaderCounter,
  HeaderSearchInput,
  HeaderStyled,
};
