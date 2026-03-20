import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const sliderItems = style({
  width: "100%",
});

export const sliderItem = style({
  position: "relative",
  zIndex: 0,
  borderRadius: vars.radii.sm,
});

export const sliderItemAnchor = style({
  textDecoration: "none",
  color: "inherit",
  display: "block",
  borderRadius: vars.radii.sm,
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.accentMuted}`,
      outlineOffset: "2px",
    },
  },
});
