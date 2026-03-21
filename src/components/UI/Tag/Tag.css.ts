import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const tag = style({
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
  borderRadius: vars.radii.sm,
  padding: vars.space[1],
  marginBottom: vars.space[2],
  marginRight: vars.space[2],
  backgroundColor: vars.colors.backgroundMuted,
  color: vars.colors.foreground,
  textTransform: "uppercase",
  fontSize: vars.fontSizes[2],
  lineHeight: "1",
  selectors: {
    "&:last-child": {
      marginRight: 0,
    },
    '&[data-has-icon="true"]': {
      paddingLeft: vars.space[4],
    },
  },
});

globalStyle(`[data-ui-tag="true"] svg`, {
  height: vars.sizes[4],
  width: vars.sizes[4],
});
