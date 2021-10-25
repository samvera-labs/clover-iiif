import { styled } from "@stitches/react";
import { theme } from "theme";

export const PlayerWrapper = styled("div", {
  flexGrow: "0",
  flexShrink: "0",
  maxHeight: "61.8vh",

  video: {
    display: "flex",
    objectFit: "cover",
    width: "100%",
    height: "100%",
    backgroundColor: theme.color.secondaryMuted,
  },
});
