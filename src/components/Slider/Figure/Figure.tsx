import * as AspectRatio from "@radix-ui/react-aspect-ratio";

import React from "react";

import { InternationalString } from "@iiif/presentation-3";
import { Thumbnail } from "src/components/Primitives";
import {
  sliderCaption,
  sliderDescription,
  sliderFigure,
  sliderFigureFocused,
  sliderPlaceholder,
  sliderTitle,
} from "./Figure.css";
import { Label, Summary } from "src/components/Primitives";

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
  return (
    <figure
      className={[sliderFigure, isFocused ? sliderFigureFocused : null]
        .filter(Boolean)
        .join(" ")}
    >
      <AspectRatio.Root ratio={1 / 1}>
        <div className={sliderPlaceholder}>
          <Thumbnail
            altAsLabel={label}
            thumbnail={thumbnail}
            data-testid="figure-thumbnail"
          />
        </div>
      </AspectRatio.Root>
      <figcaption className={sliderCaption}>
        <Label label={label} className={sliderTitle} />
        {summary && <Summary summary={summary} className={sliderDescription} />}
      </figcaption>
    </figure>
  );
};

export default Figure;
