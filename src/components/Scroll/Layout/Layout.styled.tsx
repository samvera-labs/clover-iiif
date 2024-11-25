import { styled } from "src/styles/stitches.config";

const StyledScrollSearch = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  background: "$primary",
  filter: "drop-shadow(2px 2px 5px #0002)",
  borderRadius: "2rem",
});

const StyledScrollPanel = styled("div", {
  position: "absolute",
  zIndex: 10,
  overflow: "hidden",
  height: "2rem",
  justifyContent: "space-between",
});

const StyledScrollHeader = styled("header", {
  fontSize: "1",
  paddingBottom: "1.618rem",
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  zIndex: 2,

  ".clover-scroll-header-label": {
    fontWeight: "400",
    fontSize: "1.25rem",
  },
});

const StyledScrollWrapper = styled("section", {
  margin: "0",
  gap: "1rem",
  position: "relative",
  zIndex: 0,
});

export {
  StyledScrollPanel,
  StyledScrollSearch,
  StyledScrollHeader,
  StyledScrollWrapper,
};
