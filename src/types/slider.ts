import { Collection, Manifest } from "@iiif/presentation-3";

export interface SliderBreakpointConfig {
  /**
   * How many slides a prev/next press advances.
   *
   * There is deliberately no `slidesPerView`. Slides are sized by their own content and
   * the track is the sum of their widths, so how many are visible follows from the
   * viewport rather than being divided into it. Set the card width in CSS with
   * `--clover-thumbnail-width`.
   */
  slidesPerGroup?: number;
  /**
   * Gutter between slides, as any CSS length — `"1rem"`, `"2ch"`, `"12px"`.
   *
   * A bare number is still accepted and treated as pixels, which is how this option has
   * always behaved, so existing `spaceBetween: 20` keeps working untouched. Clover's own
   * default is `"1rem"`, so the gutter tracks the root font size rather than being pinned
   * to a pixel count.
   */
  spaceBetween?: number | string;
}

export type SliderBreakpoints = Record<number, SliderBreakpointConfig>;

/**
 * @deprecated Use {@link SliderBreakpoints} instead.
 *
 * Backwards-compatible alias for the old Swiper-derived type. The Slider was
 * migrated to Embla Carousel (see #327), but external consumers of
 * `@samvera/clover-iiif/slider` may have imported `SwiperBreakpoints` to type
 * their own `breakpoints` prop. Removing it would be a breaking change in the
 * public type surface. Kept until the next major release.
 */
export type SwiperBreakpoints = SliderBreakpoints;

export interface ConfigOptions {
  breakpoints?: SliderBreakpoints;
  credentials?: FetchCredentials;
  customViewAll?: string;
}

export type CustomHomepage = Array<
  Omit<Collection["homepage"], "label"> & {
    label?: {
      none: string[];
    };
  }
>;

export type SliderItem = Omit<Collection | Manifest, "items"> & {
  homepage: CustomHomepage;
};

// https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
export type FetchCredentials = "omit" | "same-origin" | "include";

/**
 * A host's own position in a sequence, driving the header's arrows and counter.
 *
 * Supplied as one object because it describes one thing. The Viewer steps the active canvas
 * rather than scrolling the rail — the rail then follows the selection through
 * `activeIndex` — and it counts canvases while its slides are paged spreads, so neither the
 * position nor the arrows can be derived from the carousel.
 *
 * `current` is 1-based, matching what the counter displays. Availability follows from it:
 * the back arrow is dead at `1`, the forward arrow at `total`.
 */
export interface SliderPager {
  current: number;
  total: number;
  onStep: (step: -1 | 1) => void;
}
