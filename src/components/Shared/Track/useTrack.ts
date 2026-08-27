import { useCallback, useEffect, useState } from "react";

import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import useEmblaCarousel from "embla-carousel-react";

/**
 * A track shared by Clover's two strips of IIIF thumbnails: the standalone `Slider` and
 * the `Viewer`'s canvas navigation.
 *
 * Embla is the engine, chosen to keep click-and-drag. Two things it does not do on its
 * own are added here, because both rails need them:
 *
 *  - **Wheel and trackpad scrolling**, via Embla's wheel-gestures plugin. Embla clips its
 *    viewport, so without this a rail cannot be scrolled by any means except dragging it
 *    or pressing a control — a regression from a plain scroll container.
 *  - **Addressing slides rather than snap points.** `scrollTo` takes a *snap* index, and
 *    snaps are built from `slidesToScroll`; passing a slide index to a track that pages
 *    six at a time overshoots roughly sixfold. Callers that need one-slide precision pass
 *    `slidesToScroll: 1`.
 */

export type TrackOrientation = "horizontal" | "vertical";

export interface UseTrackOptions {
  /** Where a scrolled-to slide comes to rest. */
  align?: "start" | "center" | "end";
  /** Free scrolling rather than settling on snap boundaries. */
  dragFree?: boolean;
  /** Right-to-left sequences. */
  isRtl?: boolean;
  /** Re-initialise when the number of slides changes. */
  itemCount?: number;
  /** Axis the track runs along. Vertical is plumbed here but not yet styled. */
  orientation?: TrackOrientation;
  /**
   * Slides per snap point.
   *
   * `1` for a selection rail, where a snap should mean a slide. `"auto"` for a carousel
   * that pages by whatever currently fits the viewport — the only correct answer when
   * slides are sized by their content, since a fixed count cannot know how many are on
   * screen and will page past what the reader can see.
   */
  slidesToScroll?: number | "auto";
}

export interface UseTrackApi {
  /** Attach to the viewport. Embla returns a callback ref — do not read `.current`. */
  ref: React.Ref<HTMLDivElement>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  /** Bring a slide to rest according to `align`. Indexes slides when `slidesToScroll` is 1. */
  scrollToIndex: (index: number) => void;
  /** Re-measure. Call after the slides change size. */
  measure: () => void;
}

export const useTrack = ({
  align = "start",
  dragFree = false,
  isRtl = false,
  itemCount = 0,
  orientation = "horizontal",
  slidesToScroll = 1,
}: UseTrackOptions = {}): UseTrackApi => {
  const [ref, api] = useEmblaCarousel(
    {
      align,
      axis: orientation === "vertical" ? "y" : "x",
      containScroll: "trimSnaps",
      direction: isRtl ? "rtl" : "ltr",
      dragFree,
      slidesToScroll,
    },
    [WheelGesturesPlugin()],
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const sync = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    // `settle` matters for free scrolling and for the wheel: neither necessarily ends on a
    // snap, so `select` alone would leave the controls with a stale disabled state.
    api.on("select", sync);
    api.on("reInit", sync);
    api.on("settle", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
      api.off("settle", sync);
    };
  }, [api, sync]);

  // The resolved breakpoint changes the snap size, and lazily-loaded slides change the
  // measurements, so Embla is re-initialised rather than merely re-rendered.
  useEffect(() => {
    if (!api) return;
    api.reInit({
      align,
      axis: orientation === "vertical" ? "y" : "x",
      direction: isRtl ? "rtl" : "ltr",
      dragFree,
      slidesToScroll,
    });
  }, [api, align, dragFree, isRtl, itemCount, orientation, slidesToScroll]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);
  const scrollToIndex = useCallback(
    (index: number) => api?.scrollTo(index),
    [api],
  );
  const measure = useCallback(() => api?.reInit(), [api]);

  return {
    ref,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollToIndex,
    measure,
  };
};

export default useTrack;
