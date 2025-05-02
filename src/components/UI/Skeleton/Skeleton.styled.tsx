import { keyframes, styled } from "src/styles/stitches.config";

const pulseAnimation = keyframes({
  "50%": { opacity: 0.5 },
});

const SkeletonStyled = styled("div", {
  animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;`,
  borderRadius: "0.375rem",
  backgroundColor: "rgb(17 24 39 / 0.4)",
});

export { SkeletonStyled };
