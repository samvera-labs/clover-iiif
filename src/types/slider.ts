import { SwiperProps } from "swiper/react";

export interface ConfigOptions {
  breakpoints?: SwiperBreakpoints;
  credentials?: FetchCredentials;
}

export type SwiperBreakpoints = SwiperProps["breakpoints"];

// https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
export type FetchCredentials = "omit" | "same-origin" | "include";
