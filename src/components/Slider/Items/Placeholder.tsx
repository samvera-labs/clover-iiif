import React from "react";
import { styled } from "src/styles/stitches.config";

interface PlaceholderProps {
  backgroundImage: string;
}

/**
 * What sits behind a slide's thumbnail until it loads.
 *
 * Its box has to be the thumbnail's box. It used to fix its own 1:1 ratio with a Radix
 * `AspectRatio.Root`, which was invisible while the card was always square — and became a
 * grey band hanging below the image the moment `--clover-thumbnail-height` could shorten it.
 * It follows the same rule as the image box now.
 */
const Placeholder: React.FC<PlaceholderProps> = ({ backgroundImage }) => {
  return (
    <StyledPlaceholder data-testid="slider-item-placeholder">
      <BackgroundImage
        css={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
    </StyledPlaceholder>
  );
};

const BackgroundImage = styled("div", {
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "50% 50%",
  filter: "blur(3em)",
  opacity: "0.7",
});

const StyledPlaceholder = styled("div", {
  position: "absolute",
  width: "100%",
  aspectRatio: "1",
  height: "var(--clover-thumbnail-height, auto)",
  overflow: "hidden",
  backgroundColor: "#716C6B",
});

export default Placeholder;
