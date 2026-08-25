import { useEffect, useState } from "react";

import { SliderBreakpoints } from "src/types/slider";

/**
 * Resolved layout for the current viewport.
 *
 * Lifted out of `Items` so the Slider root can own it: the track's step size depends on
 * `slidesPerGroup`, and the prev/next controls that drive the track live in `Header`, a
 * sibling of `Items`. Both need the same answer.
 */
export interface BreakpointConfig {
  /**
   * Only set when a consumer asks for it. Left undefined the track pages by what fits
   * the viewport, which is the only thing that tracks content-sized slides.
   */
  slidesPerGroup?: number;
  /** Always a CSS length by this point — see `toLength`. */
  spaceBetween: string;
}

/**
 * A configured gutter as a CSS length.
 *
 * `spaceBetween` has always been a pixel number in the public API, so a number is kept
 * meaning pixels. Clover's own defaults are `rem`, which is why this is a string
 * downstream and the slide arithmetic happens inside `calc()` rather than in JS.
 */
const toLength = (value: number | string): string =>
  typeof value === "number" ? `${value}px` : value;

/*
 * A flat `1rem` gutter, rather than one that grew with the viewport as it used to (20px
 * through 60px). A gap that widened as more slides came into view made a wide screen read
 * as scattered tiles instead of a row, and this is the gap the Viewer's rail inherits now
 * that spacing belongs to the carousel.
 */
export const defaultBreakpoints: SliderBreakpoints = {
  640: { spaceBetween: "1rem" },
  768: { spaceBetween: "1rem" },
  1024: { spaceBetween: "1rem" },
  1366: { spaceBetween: "1rem" },
  1920: { spaceBetween: "1rem" },
};

const fallback: BreakpointConfig = {
  spaceBetween: "1rem",
};

/**
 * Pick the config for the current width by taking the largest min-width breakpoint that
 * the viewport still satisfies. Server-side there is no width, so the fallback stands in.
 */
export const resolveBreakpoint = (
  breakpoints: SliderBreakpoints,
): BreakpointConfig => {
  if (typeof window === "undefined") return fallback;

  const width = window.innerWidth;
  const sorted = Object.entries(breakpoints)
    .map(([min, config]) => [Number(min), config] as const)
    .sort((a, b) => a[0] - b[0]);

  let active = fallback;
  for (const [min, config] of sorted) {
    if (width < min) continue;
    // Merged field by field rather than spread: `spaceBetween` arrives as a number or a
    // string and has to leave as a length, which a spread of the raw config would undo.
    active = {
      slidesPerGroup: config.slidesPerGroup ?? active.slidesPerGroup,
      spaceBetween:
        config.spaceBetween !== undefined
          ? toLength(config.spaceBetween)
          : active.spaceBetween,
    };
  }
  return active;
};

export const useBreakpoints = (
  breakpoints: SliderBreakpoints = defaultBreakpoints,
): BreakpointConfig => {
  const [config, setConfig] = useState(() => resolveBreakpoint(breakpoints));

  useEffect(() => {
    const onResize = () => setConfig(resolveBreakpoint(breakpoints));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoints]);

  return config;
};

export default useBreakpoints;
