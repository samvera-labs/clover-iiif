import React, { useState } from "react";

import { InternationalString } from "@iiif/presentation-3";
import { Label, Summary } from "src/components/Primitives";
import { Thumbnail } from "src/components/Primitives";

interface FigureProps {
  label: InternationalString;
  summary?: InternationalString;
  thumbnail: Array<any>;
  index: number;
  isFocused: boolean;
}

const Figure: React.FC<FigureProps> = ({
  isFocused,
  label,
  summary,
  thumbnail,
}) => {
  /*
   * Whether the thumbnail has arrived, so it can fade in rather than snap in.
   *
   * `LazyLoad` only says the slide is on screen; the image is still a request after that.
   * `onError` counts as done on purpose — a thumbnail that fails to load would otherwise sit
   * at zero opacity forever, hiding the alt text with it.
   */
  const [isLoaded, setIsLoaded] = useState(false);
  const settle = () => setIsLoaded(true);

  return (
    <figure
      className="clover-slider-figure"
      data-focused={isFocused}
      data-loaded={isLoaded}
    >
      {/*
       * No `AspectRatio.Root` wrapper. The ratio is a CSS rule on `Placeholder` now, which
       * is what lets `--clover-thumbnail-height` override it — a fixed `ratio` prop could
       * not be. It also drops a dependency and a wrapper element per slide.
       */}
      <span className="clover-slider-figure-placeholder">
        {/*
         * `onLoad` and `onError` reach the underlying `<img>`: the primitive spreads
         * whatever it is handed onto the element it renders.
         */}
        <Thumbnail
          altAsLabel={label}
          thumbnail={thumbnail}
          data-testid="figure-thumbnail"
          onLoad={settle}
          onError={settle}
        />
      </span>
      <figcaption>
        <Label className="clover-slider-figure-title" label={label} />
        {summary && (
          <Summary className="clover-slider-figure-summary" summary={summary} />
        )}
      </figcaption>
    </figure>
  );
};

export default Figure;
