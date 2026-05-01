import { styled } from "src/styles/stitches.config";

const FooterStyled = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  borderTop: "1px solid $secondaryMuted",
});

const LoadMoreButtonStyled = styled("button", {
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: "600",
  padding: "0.35rem 0.9rem",
  border: "none",
  borderRadius: "3px",
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  transition: "$all",

  "&:disabled": {
    cursor: "wait",
    opacity: "0.6",
  },

  "&:hover:not(:disabled)": {
    backgroundColor: "$accentAlt",
  },
});

const ErrorStyled = styled("span", {
  fontSize: "0.85rem",
  color: "tomato",
});

export { FooterStyled, LoadMoreButtonStyled, ErrorStyled };
