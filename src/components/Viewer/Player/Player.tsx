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
 * Chooses between Clover's controls and the browser's own.
 *
 * `options.player.controls` defaults to `"custom"`, the Vidstack-backed bar, which is where
 * the Manifest's captions, chapters and sources actually reach the UI. `"native"` opts back
 * out to `<video controls>`.
 *
 * Tested against the string rather than for its absence: the default is supplied by
 * `defaultConfigOptions`, but a consumer may construct state directly, and an unset value
 * should land on the default rather than on the fallback.
 */
const Player: React.FC<PlayerProps> = (props) => {
  const { configOptions } = useViewerState();

  if (configOptions.player?.controls === "native")
    return <NativePlayer {...props} />;

  return <CustomPlayer {...props} />;
};

export default Player;
