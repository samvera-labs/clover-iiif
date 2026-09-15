import React from "react";

import { AnnotationResources } from "src/types/annotations";
import CustomPlayer from "src/components/Viewer/Player/Custom/CustomPlayer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import NativePlayer from "src/components/Viewer/Player/NativePlayer";
import { useViewerState } from "src/context/viewer-context";

interface PlayerProps {
  allSources: LabeledIIIFExternalWebResource[];
  annotationResources: AnnotationResources;
  onEnded?: () => void;
  painting: LabeledIIIFExternalWebResource;
}

/**
 * Chooses between the browser's own controls and Clover's.
 *
 * `options.player.controls` defaults to `"native"`, so nothing changes for an existing
 * consumer. `"custom"` opts into the Vidstack-backed bar, which is where the Manifest's
 * captions, chapters and sources actually reach the UI.
 */
const Player: React.FC<PlayerProps> = (props) => {
  const { configOptions } = useViewerState();

  if (configOptions.player?.controls === "custom")
    return <CustomPlayer {...props} />;

  return <NativePlayer {...props} />;
};

export default Player;
