import { Collection, Manifest } from "@iiif/presentation-3";

export interface SliderBreakpointConfig {
  slidesPerView?: number;
  slidesPerGroup?: number;
  spaceBetween?: number;
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
