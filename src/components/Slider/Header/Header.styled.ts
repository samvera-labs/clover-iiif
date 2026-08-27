import { SearchInput } from "src/components/Shared/Search/Search.styled";
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

  /*
   * The ceiling on the shared field belongs here, not in the field itself. This row also
   * holds the label and the controls, so the filter has to stop somewhere; the content
   * search form has the panel to itself and wants none.
   */
  [`& ${SearchInput}`]: {
    maxWidth: "16rem",
  },
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

export { HeaderContent, HeaderControls, HeaderCounter, HeaderStyled };
