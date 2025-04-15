import {
  Navigator,
  Viewport,
  Wrapper,
} from "src/components/Image/Image.styled";
import OpenSeadragon, { Options } from "openseadragon";
import React, { useEffect, useRef, useState } from "react";

import { Annotation } from "@iiif/presentation-3";
import Controls from "src/components/Image/Controls/Controls";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";
import { getInfoResponse } from "src/lib/iiif";
import { parseAnnotationTarget } from "src/lib";
import { retry } from "src/lib/retry";
import { useViewerDispatch } from "src/context/viewer-context";

interface OSDProps {
  _cloverViewerHasPlaceholder: boolean;
  annotations?: Array<{
    annotation: Annotation;
    targetIndex: number;
  }>;
  ariaLabel?: string | null;
  config: Options;
  uri: string[];
  imageType: OpenSeadragonImageTypes;
  openSeadragonCallback?: (viewer: OpenSeadragon.Viewer) => void;
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getBaseItemWithRetry = async (
  world: OpenSeadragon.World,
  index,
  maxRetries = 3,
  delayMs = 300,
): Promise<OpenSeadragon.TiledImage> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const previousIndex = index ? index - 1 : 0;
    const item = world.getItemAt(previousIndex);
    if (item) return item;
    await wait(delayMs);
  }
  throw new Error("No base item found at index 0 after retries");
};

const OSD: React.FC<OSDProps> = ({
  annotations,
  ariaLabel,
  config,
  uri,
  _cloverViewerHasPlaceholder,
  imageType,
  openSeadragonCallback,
}) => {
  const [osdDrawn, setOsdDrawn] = useState<string[]>([]);
  const [osdUri, setOsdUri] = useState<string[]>([]);
  const [openSeadragon, setOpenSeadragon] = useState<OpenSeadragon.Viewer>();
  const dispatch: any = useViewerDispatch();
  const initializeOSD = useRef(false);

  const annotationClassName = "clover-iiif-image-openseadragon-annotation";

  useEffect(() => {
    if (!initializeOSD.current) {
      initializeOSD.current = true;
      if (!openSeadragon) setOpenSeadragon(OpenSeadragon(config));
    }
    return () => openSeadragon?.destroy();
  }, []);

  useEffect(() => {
    if (openSeadragon && openSeadragonCallback) {
      openSeadragonCallback(openSeadragon);
    }
  }, [openSeadragon, openSeadragonCallback]);

  useEffect(() => {
    if (openSeadragon && JSON.stringify(uri) !== JSON.stringify(osdUri)) {
      openSeadragon.forceRedraw();
      setOsdUri(uri);
    }
  }, [openSeadragon, osdUri, uri]);

  useEffect(() => {
    if (!osdUri.length || !openSeadragon) return;

    openSeadragon.close(); // remove previous images

    const load = async () => {
      switch (imageType) {
        case "simpleImage":
          let height = 1;
          let x = 0;
          for (let i = 0; i < osdUri.length; i++) {
            const url = osdUri[i];

            try {
              if (i !== 0) {
                const baseItem = await getBaseItemWithRetry(
                  openSeadragon.world,
                  i,
                );
                const baseBounds = baseItem.getBounds();
                x = baseBounds.x + baseBounds.width;
                height = baseBounds.height;
              }

              openSeadragon.addSimpleImage({
                url,
                x,
                y: 0,
                height,
                success: () => {
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });

              setOsdDrawn((prev) => [...prev, url]);
            } catch (e) {
              console.error(`Failed to load image at ${url}:`, e);
            }
          }
          break;

        case "tiledImage": {
          let height = 1;
          let x = 0;

          for (let i = 0; i < osdUri.length; i++) {
            const url = osdUri[i];
            try {
              const tileSource = await retry(
                () => getInfoResponse(url),
                3,
                1000,
              );

              if (!tileSource) throw new Error(`No tile source for ${url}`);

              if (i !== 0) {
                const baseItem = await getBaseItemWithRetry(
                  openSeadragon.world,
                  i,
                );
                const baseBounds = baseItem.getBounds();
                x = baseBounds.x + baseBounds.width;
                height = baseBounds.height;
              }

              openSeadragon.addTiledImage({
                tileSource,
                x,
                y: 0,
                height,
                success: () => {
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });

              setOsdDrawn((prev) => [...prev, url]);
            } catch (e) {
              console.error(`Failed to load tile at ${url}:`, e);
            }
          }
          break;
        }

        default:
          console.warn(`Unsupported imageType: "${imageType}"`);
          break;
      }
    };

    load().catch((error) => console.error("Error drawing tiles", error));
  }, [osdUri, imageType, openSeadragon]);

  useEffect(() => {
    if (osdDrawn) {
      const maxRetries = 3;
      let attempts = 0;
      const fitBounds = () => {
        if (attempts < maxRetries) {
          const bounds = openSeadragon?.world.getHomeBounds();
          if (bounds) {
            openSeadragon?.viewport.fitBounds(bounds, true);
          }
          attempts++;
          setTimeout(fitBounds, 50);
        }
      };
      fitBounds();

      //
      openSeadragon?.addHandler("canvas-click", (event) => {
        if (event.originalTarget?.classList?.contains(annotationClassName)) {
          console.log(event);

          // get rect for clicked item
          const item = openSeadragon?.world.getItemAt(
            event.originalEvent.target,
          );
          if (item) {
            const bounds = item.getBounds();
            const rect = new OpenSeadragon.Rect(
              bounds.x,
              bounds.y,
              bounds.width,
              bounds.height,
            );
            openSeadragon?.viewport.fitBounds(rect, true);
          }
          return (event.preventDefaultAction = true);
        }
        // return (event.preventDefaultAction = true);
      });

      openSeadragon?.addHandler("canvas-click", (event) => {
        return event;
      });

      function computeX(x, targetIndex) {
        let computedX = x;
        if (targetIndex === 0) return computedX;

        // if not targetIndex 0 get width of all previous items
        while (targetIndex > 0) {
          const item = openSeadragon?.world
            .getItemAt(targetIndex - 1)
            ?.getContentSize().x;
          if (item) {
            computedX += item;
            targetIndex--;
          } else {
            break;
          }
        }
        return computedX;
      }

      if (annotations) {
        const elements = document.querySelectorAll(`.${annotationClassName}`);
        if (elements && openSeadragon) {
          elements.forEach((element) => openSeadragon?.removeOverlay(element));
        }

        annotations.forEach((entry) => {
          const { annotation, targetIndex } = entry;

          // helps determines initial scale
          const scaleIndex = targetIndex; // eventually this could be index of current image
          const rootWidth = openSeadragon?.world
            .getItemAt(scaleIndex)
            ?.getContentSize().x;

          const scale = 1 / rootWidth;
          const parsedAnnotationTarget = parseAnnotationTarget(
            annotation?.target,
          );
          const label = annotation?.body[0]?.value;

          if (parsedAnnotationTarget?.rect) {
            const div = document.createElement("button");
            div.className = annotationClassName;
            div.style.position = "relative";
            div.style.backgroundColor = "rgba(255, 0, 0, 0.14)";
            div.style.border = `none`;
            div.style.outline = `2px solid transparent`;
            div.style.boxSizing = "content-box";
            div.style.borderRadius = "3px";
            div.style.boxShadow = `0px 0px 0px 5000px transparent`;
            div.style.transition = "box-shadow 382ms ease-in-out";

            // add tabindex to div
            div.setAttribute("tabindex", "0");
            div.setAttribute("role", "button");

            if (label) {
              div.setAttribute("title", label);
              div.setAttribute("aria-label", label);
            }

            div.setAttribute(
              "aria-describedby",
              "clover-iiif-image-openseadragon",
            );

            // add onClick event to div
            div.addEventListener("mousedown", (e) => {
              e.stopPropagation();
              e.preventDefault();
            });

            div.addEventListener("touchstart", (e) => {
              e.stopPropagation();
              e.preventDefault();
            });

            div.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
            });

            // add focus AND hover event to div
            div.addEventListener("focus", (e) => {
              div.style.backgroundColor = "transparent";
              div.style.boxShadow = `0px 0px 0px 5000px #6669`;
              div.style.zIndex = "99999999";
            });

            div.addEventListener("mouseover", (e) => {
              div.style.backgroundColor = "transparent";
              div.style.boxShadow = `0px 0px 0px 5000px #6669`;
              div.style.zIndex = "99999999";
            });

            // add blur AND mouseout event to div
            div.addEventListener("mouseout", (e) => {
              div.style.backgroundColor = "rgba(255, 0, 0, 0.14)";
              div.style.outlineColor = `transparent`;
              div.style.boxShadow = `none`;
              div.style.zIndex = "0";
            });

            div.addEventListener("blur", (e) => {
              div.style.backgroundColor = "rgba(255, 0, 0, 0.14)";
              div.style.outlineColor = `transparent`;
              div.style.boxShadow = `none`;
              div.style.zIndex = "0";
            });

            const { x, y, w, h } = parsedAnnotationTarget?.rect;

            // if first item, x should be x, if second, x should be x + width of first item, if third item, x should be x + width of first item + width of second item
            const computedX = computeX(x, targetIndex);

            const rect = new OpenSeadragon.Rect(
              computedX * scale,
              y * scale,
              w * scale,
              h * scale,
            );

            openSeadragon?.addOverlay(
              div,
              rect,
              OpenSeadragon.Placement.CENTER,
            );
          }
        });
      }
    }
  }, [osdDrawn]);

  return (
    <Wrapper
      className="clover-iiif-image-openseadragon"
      data-testid="clover-iiif-image-openseadragon"
      data-openseadragon-instance={config.id}
      hasNavigator={config.showNavigator}
    >
      <Controls
        _cloverViewerHasPlaceholder={_cloverViewerHasPlaceholder}
        config={config}
      />
      {config.showNavigator && (
        <Navigator
          id={config.navigatorId}
          data-testid="clover-iiif-image-openseadragon-navigator"
        />
      )}
      <Viewport
        id={config.id}
        data-testid="clover-iiif-image-openseadragon-viewport"
        role="img"
        {...(ariaLabel && { "aria-label": ariaLabel })}
      />
    </Wrapper>
  );
};

export default OSD;
