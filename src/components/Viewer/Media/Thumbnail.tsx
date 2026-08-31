import { Icon, Tag } from "src/components/UI";
import * as RadioGroup from "@radix-ui/react-radio-group";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { CanvasNormalized } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";
import { convertTime } from "src/lib/utils";
import { getLabelAsString } from "src/lib/label-helpers";
import { getThumbnail } from "@iiif/helpers/thumbnail";

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
  const { configOptions, vault } = state;

  /*
   * The badge carries two separate things, and only one of them is an icon.
   *
   * `showResourceIcons` governs the type glyph. A duration is not an icon — it is the only
   * place the rail states how long a time-based canvas runs — so it keeps showing either
   * way, and the badge renders whenever it has something to say.
   */
  const hasDuration = ["Video", "Sound"].includes(type);
  const showResourceIcon = Boolean(configOptions.showResourceIcons);
  const showBadge = showResourceIcon || hasDuration;

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

  /*
   * Whether the thumbnail itself has arrived, which is a later moment than `load`.
   *
   * `load` records that the tile came on screen and the request may begin; this records that
   * the image is actually there to show. `onError` counts as settled on purpose — a
   * thumbnail that fails would otherwise stay at zero opacity, taking its alt text with it.
   */
  const [isLoaded, setIsLoaded] = useState(false);
  const settle = () => setIsLoaded(true);

  return (
    <RadioGroup.Item
      aria-checked={isActive}
      className="clover-viewer-media-item"
      data-testid="media-thumbnail"
      data-canvas={canvasIndex}
      onClick={() => handleChange(canvas.id)}
      value={canvas.id}
    >
      <figure>
        <div className="clover-viewer-media-image" data-loaded={isLoaded}>
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
                onError={settle}
                onLoad={settle}
                src={thumbnail}
              />
            )}
          </LazyLoad>
          <span className="clover-viewer-media-outline" />
          {showBadge && (
            <span className="clover-viewer-media-type">
              {/*
               * `isIcon` only when the glyph is there: the variant reserves room for it with
               * `paddingLeft`, which would otherwise leave a duration badge padded against
               * nothing.
               */}
              <Tag isIcon={showResourceIcon} data-testid="thumbnail-tag">
                {showResourceIcon && (
                  <>
                    <span className="clover-viewer-media-spacer" />
                    <Icon aria-label={type}>
                      <IconPath type={type} />
                    </Icon>
                  </>
                )}
                {hasDuration && (
                  <span className="clover-viewer-media-duration">
                    {convertTime(canvas.duration as number)}
                  </span>
                )}
              </Tag>
            </span>
          )}
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
