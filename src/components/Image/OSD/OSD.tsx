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
  annotations?: Array<{ annotation: Annotation; targetIndex: number }>;
  ariaLabel?: string | null;
  clips?: (OpenSeadragon.Rect | undefined)[];
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
  clips,
  config,
  uri,
  _cloverViewerHasPlaceholder,
  imageType,
  openSeadragonCallback,
}) => {
  const [osdDrawn, setOsdDrawn] = useState<string[]>([]);
  const [osdUri, setOsdUri] = useState<string[]>([]);
  const [osdClips, setOsdClips] = useState<(OpenSeadragon.Rect | undefined)[]>(
    [],
  );
  const [openSeadragon, setOpenSeadragon] = useState<OpenSeadragon.Viewer>();
  const [srcDimensions, setSrcDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const dispatch = useViewerDispatch();
  const initializeOSD = useRef(false);
  const isFirstImageLoad = useRef(true);
  // Tracks which URIs are currently rendered in OSD so we can detect clip-only
  // changes and update the existing TiledImage in place instead of add/remove.
  const drawnUriRef = useRef<string[]>([]);
  // Maps clip-key strings to their preloaded TiledImage world items so we can
  // toggle opacity between animation frames without moving anything in world space.
  const clipItemsRef = useRef<Map<string, OpenSeadragon.TiledImage>>(new Map());

  const annotationClassName = "clover-iiif-image-openseadragon-annotation";

  /**
   * check the OSD config for scrollToZoom setting
   */
  const disableScrollToZoom = Boolean(
    config.gestureSettingsMouse.scrollToZoom === false,
  );

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
    if (!openSeadragon || !disableScrollToZoom) return;
    // Intercept wheel events in the capture phase on the outer container —
    // before they reach OSD's canvas listener — so OSD never calls
    // preventDefault() and the browser can scroll the page natively.
    const el = openSeadragon.element;
    const handleWheel = (e: WheelEvent) => e.stopPropagation();
    el.addEventListener("wheel", handleWheel, { capture: true });
    return () =>
      el.removeEventListener("wheel", handleWheel, { capture: true });
  }, [openSeadragon, disableScrollToZoom]);

  useEffect(() => {
    if (!openSeadragon) return;
    const serializeClips = (c) =>
      (c ?? [])
        .map((r) => (r ? `${r.x},${r.y},${r.width},${r.height}` : ""))
        .join("|");
    const uriChanged = JSON.stringify(uri) !== JSON.stringify(osdUri);
    const clipsChanged = serializeClips(clips) !== serializeClips(osdClips);
    if (uriChanged || clipsChanged) {
      openSeadragon.forceRedraw();
      setOsdUri(uri);
      setOsdClips(clips ?? []);
    }
  }, [disableScrollToZoom, openSeadragon, osdUri, uri, osdClips, clips]);

  useEffect(() => {
    if (!osdUri.length || !openSeadragon) return;

    // When the URI is unchanged but the clip changed (e.g., animation frames on
    // the same image service), toggle opacity between preloaded world items so
    // nothing ever moves — world bounds stay fixed and the navigator never oscillates.
    const isSameUri =
      osdUri.length === 1 &&
      drawnUriRef.current.length === 1 &&
      drawnUriRef.current[0] === osdUri[0];

    if (isSameUri) {
      const clip = osdClips[0] ?? null;
      const clipKey = clip
        ? `${clip.x},${clip.y},${clip.width},${clip.height}`
        : "__none__";

      if (clipItemsRef.current.has(clipKey)) {
        // Fast path: clip already in world — instant opacity swap, nothing moves.
        clipItemsRef.current.forEach((item, key) =>
          item.setOpacity(key === clipKey ? 1 : 0),
        );
        openSeadragon.forceRedraw();
        return;
      }

      // Slow path: first time seeing this clip — add at fixed world position so
      // future toggles never require moving anything in world space.
      (async () => {
        const url = osdUri[0];
        const tileSource = await retry(() => getInfoResponse(url), 3, 1000);
        if (!tileSource) return;
        const scale = tileSource.height ? 1 / tileSource.height : 0;
        openSeadragon.addTiledImage({
          tileSource,
          x: clip && scale > 0 ? -(clip.x * scale) : 0,
          y: clip && scale > 0 ? -(clip.y * scale) : 0,
          height: 1,
          clip: clip ?? undefined,
          opacity: 0,
          success: (event) => {
            const newItem = event?.item;
            if (!newItem) return;
            clipItemsRef.current.set(clipKey, newItem);
            clipItemsRef.current.forEach((item, key) =>
              item.setOpacity(key === clipKey ? 1 : 0),
            );
            openSeadragon.forceRedraw();
          },
        });
      })().catch(console.error);
      return;
    }

    // Only defer old-image removal for a true one-for-one swap: exactly 1 image
    // currently in the world and exactly 1 new image being loaded. This eliminates
    // the blank flash on single-image swaps (animation frames, canvas navigation)
    // while keeping the original close() behaviour for every other case (initial
    // load, multi-image/paged views, count mismatches).
    clipItemsRef.current.clear();
    const itemsToRemove = [];
    const isSingleImageSwap =
      openSeadragon.world.getItemCount() === 1 && osdUri.length === 1;
    if (!isSingleImageSwap) {
      openSeadragon.close();
    } else {
      itemsToRemove.push(openSeadragon.world.getItemAt(0));
    }

    const expectedCount = osdUri.length;
    let loadedCount = 0;

    const fitBoundsOnAllLoaded = (clip?, clipScale = 0) => {
      loadedCount++;
      if (!isFirstImageLoad.current || loadedCount < expectedCount) return;
      isFirstImageLoad.current = false;
      // For a single tiled image with a spatial clip the image is shifted so
      // the clip sits at world (0, 0) — fit to that origin-aligned region.
      if (clip && clipScale > 0 && expectedCount === 1) {
        openSeadragon?.viewport.fitBounds(
          new OpenSeadragon.Rect(
            0,
            0,
            clip.width * clipScale,
            clip.height * clipScale,
          ),
          true,
        );
        return;
      }
      const maxRetries = 3;
      let attempts = 0;
      const tryFit = () => {
        if (attempts >= maxRetries) return;
        const bounds = openSeadragon?.world.getHomeBounds();
        if (bounds) openSeadragon?.viewport.fitBounds(bounds, true);
        attempts++;
        setTimeout(tryFit, 50);
      };
      tryFit();
    };

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
                { width: img?.width, height: img?.height },
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
                clip: clips?.[i],
                success: () => {
                  drawnUriRef.current = osdUri.slice();
                  itemsToRemove.forEach((item) =>
                    openSeadragon.world.removeItem(item),
                  );
                  fitBoundsOnAllLoaded();
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

              const clip = clips?.[i];
              const clipScale = tileSource.height
                ? height / tileSource.height
                : 0;
              // Shift the image so the clip region is anchored at world (x, 0)
              // rather than at its pixel offset within the full source image.
              const imageX = clip ? x - clip.x * clipScale : x;
              const imageY = clip ? -(clip.y * clipScale) : 0;

              openSeadragon.addTiledImage({
                tileSource,
                x: imageX,
                y: imageY,
                height,
                clip,
                success: (event) => {
                  drawnUriRef.current = osdUri.slice();
                  if (event?.item && osdUri.length === 1) {
                    const clipKey = clip
                      ? `${clip.x},${clip.y},${clip.width},${clip.height}`
                      : "__none__";
                    clipItemsRef.current.set(clipKey, event.item);
                  }
                  itemsToRemove.forEach((item) =>
                    openSeadragon.world.removeItem(item),
                  );
                  fitBoundsOnAllLoaded(clip, clipScale);
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
  }, [osdUri, osdClips, imageType, openSeadragon]);

  useEffect(() => {
    if (!osdDrawn.length) return;

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

        const label = annotation?.body ? annotation?.body[0]?.value : undefined;

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
          });

          div.addEventListener("touchend", (e) => {
            e.stopPropagation();
            e.preventDefault();

            div.setAttribute("data-active", "true");
            dispatch({
              type: "updateActiveAnnotationId",
              activeAnnotationId: div.id,
            });

            const targetRect = new OpenSeadragon.Rect(
              rect.x - 0.1,
              rect.y - 0.1,
              rect.width + 0.2,
              rect.height + 0.2,
            );
            openSeadragon?.viewport.fitBounds(targetRect, false);
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
            dispatch({
              type: "updateActiveAnnotationId",
              activeAnnotationId: div.id,
            });
          });

          div.addEventListener("mouseover", () => {
            div.setAttribute("data-active", "true");
            dispatch({
              type: "updateActiveAnnotationId",
              activeAnnotationId: div.id,
            });
          });

          // add blur AND mouseout event to div
          div.addEventListener("mouseout", () => {
            div.removeAttribute("data-active");
            dispatch({
              type: "updateActiveAnnotationId",
              activeAnnotationId: null,
            });
          });

          div.addEventListener("blur", () => {
            div.removeAttribute("data-active");
            dispatch({
              type: "updateActiveAnnotationId",
              activeAnnotationId: null,
            });
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
