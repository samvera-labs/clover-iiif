import * as RadioGroup from "@radix-ui/react-radio-group";
import { Icon, Tag } from "src/components/UI";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { CanvasNormalized } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";
import { convertTime } from "src/lib/utils";
import { getLabelAsString } from "src/lib/label-helpers";
import { getThumbnail } from "@iiif/helpers/thumbnail";
import {
  thumbnailDuration,
  thumbnailFigureImage,
  thumbnailItem,
  thumbnailOutline,
  thumbnailSpacer,
  thumbnailType,
} from "./Thumbnail.css";

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
  type: string;
  handleChange: (arg0: string) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  canvas,
  canvasIndex,
  isActive,
  type,
  handleChange,
}) => {
  const [load, setLoad] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>();
  const state: ViewerContextStore = useViewerState();
  const { vault } = state;

  const size = 200;

  const label = canvas?.label
    ? (getLabelAsString(canvas?.label) as string)
    : String(canvasIndex + 1);

  useEffect(() => {
    if (!load) return;

    (async () => {
      try {
        // check canvas has a designated thumbnail
        if (canvas?.thumbnail?.length !== 0) {
          setThumbnail(canvas?.thumbnail[0]?.id);
        } else {
          // if not, attempt to generate a thumbnail
          const { best } = await getThumbnail(canvas, {
            vault,
            dereference: true,
            width: size,
            height: size,
          });
          setThumbnail(best?.id);
        }
      } catch (err) {
        console.error("Error fetching thumbnail", err);
      }
    })();
  }, [canvas, load]);

  const handleIsVisibleCallback = (isVisible: boolean) => {
    setLoad(isVisible);
  };

  return (
    <RadioGroup.Item
      className={thumbnailItem}
      aria-checked={isActive}
      data-testid="media-thumbnail"
      data-canvas={canvasIndex}
      onClick={() => handleChange(canvas.id)}
      value={canvas.id}
    >
      <figure>
        <div className={thumbnailFigureImage}>
          <LazyLoad
            isVisibleCallback={handleIsVisibleCallback}
            attributes={{
              className: "media-thumbnail-lazyload",
              "data-lazyload": String(load),
              "data-testid": "media-thumbnail-lazyload",
            }}
          >
            {thumbnail && (
              <img
                alt={label}
                data-testid="media-thumbnail-image"
                src={thumbnail}
              />
            )}
          </LazyLoad>
          <span className={thumbnailOutline} />
          <span className={thumbnailType}>
            <Tag isIcon data-testid="thumbnail-tag">
              <span className={thumbnailSpacer} />
              <Icon aria-label={type}>
                <IconPath type={type} />
              </Icon>
              {["Video", "Sound"].includes(type) && (
                <span className={thumbnailDuration}>
                  {convertTime(canvas.duration as number)}
                </span>
              )}
            </Tag>
          </span>
        </div>
        <figcaption data-testid="fig-caption">
          {canvas.label ? (
            <Label label={canvas.label} />
          ) : (
            (canvasIndex + 1).toString()
          )}
        </figcaption>
      </figure>
    </RadioGroup.Item>
  );
};

export default Thumbnail;
