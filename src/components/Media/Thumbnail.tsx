import React from "react";
import { getLabel } from "@/hooks/use-iiif";
import { convertTime } from "@/services/utils";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";
import { Icon, Tag } from "@nulib/design-system";
import {
  Duration,
  Item,
  Spacer,
  Type,
} from "@/components/Media/Thumbnail.styled";

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
  const label = getLabel(canvas.label as InternationalString, "en") as string;

  return (
    <Item
      aria-checked={isActive}
      data-testid="media-thumbnail"
      data-canvas={canvasIndex}
      onClick={() => handleChange(canvas.id)}
      value={canvas.id}
    >
      <figure>
        <div>
          {thumbnail?.id && <img src={thumbnail.id} alt={label} />}

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
        </div>
        <figcaption data-testid="fig-caption">{label}</figcaption>
      </figure>
    </Item>
  );
};

export default Thumbnail;
