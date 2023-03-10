import { styled } from "@/stitches";
import { Item as ButtonStyled } from "@/components/ImageViewer/Button.styled";

const PaintingStyled = styled("div", {
  position: "relative",
});

const Toggle = styled(ButtonStyled, {
  position: "absolute",
  width: "auto",
  top: "1rem",
  left: "1rem",
  zIndex: 100,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 1rem",
});

export { PaintingStyled, Toggle };
