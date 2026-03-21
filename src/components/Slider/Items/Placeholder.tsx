import * as AspectRatio from "@radix-ui/react-aspect-ratio";

import React from "react";
import {
  placeholderBackground,
  placeholderWrapper,
} from "./Placeholder.css";

interface PlaceholderProps {
  backgroundImage: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ backgroundImage }) => {
  return (
    <div className={placeholderWrapper} data-testid="slider-item-placeholder">
      <AspectRatio.Root
        className={placeholderBackground}
        ratio={1 / 1}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    </div>
  );
};

export default Placeholder;
