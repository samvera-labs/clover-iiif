import {
  CanvasNormalized,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import {
  Duration,
  FigureImage,
  Item,
  Outline,
  Spacer,
  Type,
} from "src/components/Viewer/Media/Thumbnail.styled";
import { Icon, Tag } from "src/components/UI";

import { Label } from "src/components/Primitives";
import { LazyLoadImage } from "react-lazy-load-image-component";
import React from "react";
import { convertTime } from "src/lib/utils";
import { getLabel } from "src/hooks/use-iiif";

/**
 * Determine appropriate icon by resource type
 */
interface IconPathProps {
  type: string;
}

const IconPath: React.FC<IconPathProps> = ({ type }) => {
  switch (type) {
    case "Sound":
      return <Icon.Audio />;
    case "Image":
      return <Icon.Image />;
    case "Video":
      return <Icon.Video />;
    default:
      return <Icon.Image />;
  }
};

/**
 * Render thumbnail for IIIF canvas item
 */
export interface ThumbnailProps {
  canvas: CanvasNormalized;
  canvasIndex: number;
  isActive: boolean;
  thumbnail?: IIIFExternalWebResource;
  type: string;
  handleChange: (arg0: string) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  canvas,
  canvasIndex,
  isActive,
  thumbnail,
  type,
  handleChange,
}) => {
  const label = canvas?.label
    ? getLabel(canvas.label)
    : (canvasIndex + 1).toString();

  return (
    <Item
      aria-checked={isActive}
      data-testid="media-thumbnail"
      data-canvas={canvasIndex}
      onClick={() => handleChange(canvas.id)}
      value={canvas.id}
    >
      <figure>
        <FigureImage>
          {thumbnail?.id && (
            <LazyLoadImage
              src={thumbnail.id}
              alt={label as string}
              loading="lazy"
            />
          )}
          <Outline />
          <Type>
            <Tag isIcon data-testid="thumbnail-tag">
              <Spacer />
              <Icon aria-label={type}>
                <IconPath type={type} />
              </Icon>
              {["Video", "Sound"].includes(type) && (
                <Duration>{convertTime(canvas.duration as number)}</Duration>
              )}
            </Tag>
          </Type>
        </FigureImage>
        <figcaption data-testid="fig-caption">
          {canvas.label ? (
            <Label label={canvas.label} />
          ) : (
            (canvasIndex + 1).toString()
          )}
        </figcaption>
      </figure>
    </Item>
  );
};

export default Thumbnail;
