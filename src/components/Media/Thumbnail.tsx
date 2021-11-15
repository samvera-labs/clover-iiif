import React from "react";
import { getLabel } from "hooks/use-hyperion-framework";
import { convertTime } from "services/utils";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
  InternationalString,
} from "@hyperion-framework/types";
import { Duration, Item } from "./Thumbnail.styled";

export interface ThumbnailProps {
  canvas: CanvasNormalized;
  isActive: boolean;
  thumbnail?: IIIFExternalWebResource;
  type: string;
  handleChange: (arg0: string) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  canvas,
  isActive,
  thumbnail,
  type,
  handleChange,
}) => {
  const label = getLabel(canvas.label as InternationalString, "en") as string;

  return (
    <Item
      aria-checked={isActive}
      data-testid="media-thumbnail"
      onClick={() => handleChange(canvas.id)}
      value={canvas.id}
    >
      <figure>
        <div>
          {thumbnail?.id && <img src={thumbnail.id} alt={label} />}
          {["Video", "Sound"].includes(type) && (
            <Duration>{convertTime(canvas.duration as number)}</Duration>
          )}
        </div>
        <figcaption>{label}</figcaption>
      </figure>
    </Item>
  );
};

export default Thumbnail;
