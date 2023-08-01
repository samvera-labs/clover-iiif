import Primitives, {
  CloverPrimitivesComposition,
} from "src/components/Primitives";
import React from "react";
import Slider, { CloverSliderProps } from "src/components/Slider";
import Viewer, { CloverViewerProps } from "src/components/Viewer";

interface CloverComposition {
  Primitives: CloverPrimitivesComposition;
  Slider: React.FC<CloverSliderProps>;
  Viewer: React.FC<CloverViewerProps>;
}

const Clover: React.FC<CloverViewerProps> & CloverComposition = (props) => (
  <Viewer {...props} />
);

Clover.Primitives = Primitives;
Clover.Slider = Slider;
Clover.Viewer = Viewer;

export { Primitives, Slider, Viewer };

export default Clover;
