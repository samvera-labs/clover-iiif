import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const panelResults = style({
  display: "flex",
  position: "relative",
  zIndex: 1,
  maxWidth: "100%",
  transition: vars.transitions.all,
});

export const panelResultsExpanded = style({
  opacity: 1,
  transform: "translateX(0)",
  zIndex: 1,
});

export const panelResultsCollapsed = style({
  opacity: 0,
  zIndex: -1,
  transform: `translateX(-${vars.space[6]})`,
  transition: "none",
});
