import { styled } from "src/styles/stitches.config";

const ItemsStyled = styled("div", {
  overflow: "hidden",
  width: "100%",

  "& .clover-slider-track": {
    touchAction: "pan-y pinch-zoom",
  },

  "& .clover-slider-slide": {
    transform: "translate3d(0, 0, 0)",
  },
});

export { ItemsStyled };
