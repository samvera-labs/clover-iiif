import React from "react";

import { AnnotationResources } from "src/types/annotations";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { useViewerState } from "src/context/viewer-context";
import { usePlayerPoster } from "../usePlayerPoster";

export interface CustomPlayerProps {
  allSources: LabeledIIIFExternalWebResource[];
  annotationResources: AnnotationResources;
  onEnded?: () => void;
  painting: LabeledIIIFExternalWebResource;
}

/**
 * `@vidstack/react` registers custom elements as a side effect of being imported, and it is
 * by far the largest thing this component tree touches. Deferring the import means an
 * image-only Manifest never evaluates a line of it — the same treatment `hls.js`,
 * `maplibre-gl` and `marked` already get.
 *
 * `React.lazy` rather than a bare `await import()`: the control bar, the menus and the
 * waveform all need Vidstack's components too, and a lazy boundary lets them import it
 * normally instead of threading a module object down through props.
 */
const PlayerMedia = React.lazy(
  () => import("src/components/Viewer/Player/Custom/PlayerMedia"),
);

const CustomPlayer: React.FC<CustomPlayerProps> = (props) => {
  const { configOptions } = useViewerState();
  const poster = usePlayerPoster();

  return (
    <div
      className="clover-viewer-player-wrapper"
      data-testid="player-wrapper"
      style={{
        maxHeight: configOptions.canvasHeight,
        position: "relative",
      }}
    >
      <React.Suspense
        fallback={
          <div
            className="clover-viewer-player-loading"
            data-testid="player-loading"
          >
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element -- This library also renders outside Next.js.
              <img
                alt=""
                className="clover-viewer-player-poster"
                data-visible=""
                src={poster}
              />
            )}
          </div>
        }
      >
        <PlayerMedia {...props} />
      </React.Suspense>
    </div>
  );
};

export default CustomPlayer;
