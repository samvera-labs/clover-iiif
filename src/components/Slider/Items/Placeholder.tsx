import * as AspectRatio from "@radix-ui/react-aspect-ratio";

import React from "react";
import { styled } from "src/styles/stitches.config";

interface PlaceholderProps {
  backgroundImage: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ backgroundImage }) => {
  return (
    <StyledPlaceholder data-testid="slider-item-placeholder">
      <BackgroundImage
        ratio={1 / 1}
        css={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
    </StyledPlaceholder>
  );
};

const BackgroundImage = styled(AspectRatio.Root, {
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "50% 50%",
  filter: "blur(3em)",
  opacity: "0.7",
});

const StyledPlaceholder = styled("div", {
  position: "absolute",
  width: "100%",
  overflow: "hidden",
  backgroundColor: "#716C6B",
});

export default Placeholder;
