// @ts-nocheck

import {
  Navigator,
  Viewport,
  Wrapper,
} from "src/components/Image/Image.styled";
import OpenSeadragon, { Options, Overlay } from "openseadragon";
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
  const [srcDimensions, setSrcDimensions] = useState<
    Array<{
      width: number;
      height: number;
    }>
  >([]);
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
    handleOpenSeadragonCallback();
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

            /**
             * if the image is a simple image, we need to get the dimensions of the image
             * and set the height of the image to the height of the first image
             * this is because the simple image does not have a tile source
             * and we need to know the dimensions for annotations overlay coordinates
             */
            if (annotations) {
              const img = new Image();
              img.src = url;

              await img.decode();
              setSrcDimensions((prev) => [
                ...prev,
                {
                  width: img?.width,
                  height: img?.height,
                },
              ]);
            }

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
                  setOsdDrawn((prev) => [...prev, url]);
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });
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
                  setOsdDrawn((prev) => [...prev, url]);
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });
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

      // handles zoom to annotation on click
      openSeadragon?.addHandler("canvas-click", (event) => {
        const overlay: Overlay = openSeadragon?.getOverlayById(
          event.originalTarget.id,
        );

        if (overlay) {
          const bounds = overlay?.getBounds(openSeadragon.viewport);
          // add some padding to the bounds
          bounds.x -= 0.1;
          bounds.y -= 0.1;
          bounds.width += 0.2;
          bounds.height += 0.2;

          openSeadragon?.viewport.fitBounds(bounds, false);
          return (event.preventDefaultAction = true);
        }
      });
    }
  }, [osdDrawn]);

  useEffect(() => {
    function computeX(x, targetIndex, scale) {
      let computedX = x * scale;
      if (targetIndex === 0) return computedX;

      // get width of all previous items
      while (targetIndex > 0) {
        const item = openSeadragon?.world.getItemAt(targetIndex - 1);
        if (item) {
          const itemWidth = item.getBounds().width;
          computedX += itemWidth;
          targetIndex--;
        } else {
          break;
        }
      }

      return computedX;
    }

    if (annotations) {
      // remove previous overlays
      openSeadragon?.clearOverlays();

      annotations.forEach((entry) => {
        const { annotation, targetIndex } = entry;

        // get openseadragon scale
        const boundsWidth = openSeadragon?.viewport?.getBounds()?.width || 1;
        const item = openSeadragon?.world.getItemAt(targetIndex);
        const scale = item
          ? item?.getBounds().width / item?.getContentSize().x
          : srcDimensions[targetIndex]?.width / boundsWidth;

        const parsedAnnotationTarget = parseAnnotationTarget(
          annotation?.target,
        );

        const label = annotation?.body[0]?.value;

        if (parsedAnnotationTarget?.rect) {
          const { x, y, w, h } = parsedAnnotationTarget?.rect;
          const computedX = computeX(x, targetIndex, scale);
          const rect = new OpenSeadragon.Rect(
            computedX,
            y * scale,
            w * scale,
            h * scale,
          );

          const div = document.createElement("button");
          div.classList.add(annotationClassName);
          div.id = annotation.id;
          div.setAttribute("tabindex", "0");
          div.setAttribute("role", "button");
          div.setAttribute("data-active", "true");

          // add tabindex to div
          div.setAttribute("tabindex", "0");
          div.setAttribute("role", "button");
          div.setAttribute("data-active", "false");

          if (label) {
            // add aria-label to annotation
            div.setAttribute("aria-label", label);

            // append label to annotation
            const divLabel = document.createElement("label");
            divLabel.innerHTML = label;
            div.appendChild(divLabel);
          }

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

          // add keydown enter event to div
          div.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              e.preventDefault();

              const targetRect = new OpenSeadragon.Rect(
                rect.x - 0.1,
                rect.y - 0.1,
                rect.width + 0.2,
                rect.height + 0.2,
              );

              openSeadragon?.viewport.fitBounds(targetRect, false);
            }
          });

          div.addEventListener("focus", () => {
            div.setAttribute("data-active", "true");
          });

          div.addEventListener("mouseover", () => {
            div.setAttribute("data-active", "true");
          });

          // add blur AND mouseout event to div
          div.addEventListener("mouseout", () => {
            div.removeAttribute("data-active");
          });

          div.addEventListener("blur", () => {
            div.removeAttribute("data-active");
          });

          openSeadragon?.addOverlay(div, rect, OpenSeadragon.Placement.CENTER);
        }
      });

      handleOpenSeadragonCallback();
    }
  }, [osdDrawn, annotations]);

  function handleOpenSeadragonCallback() {
    if (openSeadragon) openSeadragonCallback?.(openSeadragon);
  }

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
