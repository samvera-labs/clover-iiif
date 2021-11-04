import React, { createRef } from "react";
import { getLabel } from "hooks/use-hyperion-framework";
import { convertTime } from "services/utils";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
  InternationalString,
} from "@hyperion-framework/types";
import { MediaItemDuration, MediaItemWrapper } from "./MediaItem.styled";
export interface MediaItemProps {
  canvas: CanvasNormalized;
  active: boolean;
  thumbnail?: IIIFExternalWebResource;
  handleChange: (arg0: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  canvas,
  active,
  thumbnail,
  handleChange,
}) => {
  const refAnchor = createRef<HTMLAnchorElement>();
  return (
    <MediaItemWrapper
      onClick={() => handleChange(canvas.id)}
      data-testid="media-item-wrapper"
      data-active={active}
      ref={refAnchor}
    >
      <figure>
        <div>
          {thumbnail?.id && <img src={thumbnail.id} />}
          <MediaItemDuration>
            {convertTime(canvas.duration as number)}
          </MediaItemDuration>
        </div>
        <figcaption>
          {canvas.label && getLabel(canvas.label as InternationalString, "en")}
        </figcaption>
      </figure>
    </MediaItemWrapper>
  );
};

export default MediaItem;
