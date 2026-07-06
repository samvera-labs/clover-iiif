import React from "react";

import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { SceneCanvas } from "./Scene.styled";

// Declare the model-viewer custom element for JSX
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean | string;
          "camera-controls"?: boolean | string;
          "shadow-intensity"?: string;
          exposure?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

interface SceneProps {
  painting: LabeledIIIFExternalWebResource;
  ar?: boolean;
  cameraControls?: boolean;
  exposure?: number;
}

const Scene: React.FC<SceneProps> = ({
  painting,
  ar = false,
  cameraControls = true,
  exposure = 1,
}) => {
  const label = painting.label
    ? String(Object.values(painting.label)[0]?.[0] ?? "")
    : "";

  return (
    <SceneCanvas>
      <model-viewer
        src={painting.id}
        alt={label}
        camera-controls={cameraControls ? "camera-controls" : undefined}
        ar={ar ? "ar" : undefined}
        shadow-intensity="1"
        exposure={String(exposure)}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </SceneCanvas>
  );
};

export default Scene;
