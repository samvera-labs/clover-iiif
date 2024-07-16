import { Box, Card, Inset } from "@radix-ui/themes";

import { ToggleStyled } from "src/components/Viewer/Painting/Toggle.styled";
import { styled } from "src/styles/stitches.config";

const PaintingStyled = styled(Box, {
  position: "relative",
  zIndex: "0",
});

const PaintingCanvas = styled(Inset, {
  width: "100%",
  height: "100%",
  position: "relative",
  backgroundColor: "var(--gray-4)",
});

export { PaintingCanvas, PaintingStyled, ToggleStyled };
