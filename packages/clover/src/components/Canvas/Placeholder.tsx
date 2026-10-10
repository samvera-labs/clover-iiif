import React from "react";

import { Close, OpenViewer, Play } from "./glyphs";
import Button from "../../ui/Button";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";

export interface PlaceholderStill {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface PlaceholderProps {
  instance: string;
  /** The shown Canvases' placeholder images, in the order they are laid out. */
  stills: PlaceholderStill[];
  /** Laid out in a column (`top-to-bottom`, `bottom-to-top`) rather than a row. */
  vertical: boolean;
  /**
   * The Canvas is video or sound: the toggle is a large play button in the middle, as
   * a video player's is, and opening plays.
   */
  media: boolean;
  /** Whether the placeholder is showing, rather than the Canvas itself. */
  active: boolean;
  /**
   * The Canvas has been opened but has not drawn yet: the still stays in view, inert,
   * so opening does not flash an empty stage while the first tiles load.
   */
  lingering: boolean;
  onToggle: () => void;
}

/**
 * A Canvas's `placeholderContainer`, shown as the Viewer shows it: a still image fitted
 * to the stage and centred, in place of the Canvas until the reader opens it. Nothing
 * of the Canvas is fetched, and none of its controls shown, until then.
 *
 * The toggle in the top right opens the Canvas and, once open, goes back to the
 * placeholder; a click on the image opens it too. Several Canvases with placeholders (a
 * spread) are fitted together as one picture, edge to edge.
 */
const Placeholder: React.FC<PlaceholderProps> = ({
  instance,
  stills,
  vertical,
  media,
  active,
  lingering,
  onToggle,
}) => {
  const { t } = useCloverTranslation();
  // Each image's share of the run, at a common height (a row) or width (a column).
  const shares = stills.map(({ width, height }) =>
    vertical ? height / width : width / height,
  );
  const total = shares.reduce((sum, share) => sum + share, 0);
  const ratio = vertical ? 1 / total : total;

  return (
    <>
      {/* Named for the viewer it opens and closes, as the Viewer's toggle is. */}
      <Button
        className="clover-canvas-placeholder-toggle"
        id={`placeholder-${instance}`}
        label={
          media
            ? active
              ? t("playerPlay")
              : t("commonClose")
            : active
              ? t("imageViewerOpen")
              : t("imageViewerClose")
        }
        onClick={onToggle}
      >
        {active ? media ? <Play /> : <OpenViewer /> : <Close />}
      </Button>
      {(active || lingering) && (
        <div
          aria-hidden={active ? undefined : true}
          className="clover-canvas-placeholder"
          data-lingering={!active}
          data-media={media}
          data-testid="clover-canvas-placeholder"
          data-vertical={vertical}
          onClick={active ? onToggle : undefined}
        >
          <div
            className="clover-canvas-placeholder-frame"
            style={{ "--ratio": ratio } as React.CSSProperties}
          >
            {stills.map((still, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- This library also renders outside Next.js.
              <img
                alt={still.alt}
                key={index}
                src={still.src}
                style={{
                  [vertical ? "height" : "width"]:
                    `${(shares[index] / total) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Placeholder;
