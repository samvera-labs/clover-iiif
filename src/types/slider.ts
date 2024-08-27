import { Collection, Manifest } from "@iiif/presentation-3";

import { SwiperProps } from "swiper/react";

export interface ConfigOptions {
  breakpoints?: SwiperBreakpoints;
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

export type SwiperBreakpoints = SwiperProps["breakpoints"];

// https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
export type FetchCredentials = "omit" | "same-origin" | "include";
