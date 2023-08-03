import { createStitches } from "@stitches/react";

const hue = 209;

export const theme = {
  colors: {
    /*
     * Black and dark grays in a light theme.
     * Must contrast to 4.5 or greater with `secondary`.
     */
    primary: "#1a1d1e",
    primaryMuted: "#26292b",
    primaryAlt: "#151718",

    /*
     * Key brand color(s).
     * Must contrast to 4.5 or greater with `secondary`.
     */
    accent: `hsl(${hue} 100% 45%)`,
    accentMuted: `hsl(${hue} 80% 61.8%)`,
    accentAlt: `hsl(${hue} 80% 38.2%)`,

    /*
     * White and light grays in a light theme.
     * Must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#e6e8eb",
    secondaryAlt: "#c1c8cd",
  },
  transitions: {
    all: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export const media = {
  xxs: "(max-width: 349px)",
  xs: "(max-width: 575px)",
  sm: "(max-width: 767px)",
  md: "(max-width: 991px)",
  lg: "(max-width: 90rem)",
  xl: "(min-width: calc(90rem + 1px))",
};

export const { styled, css, keyframes, createTheme } = createStitches({
  theme,
  media,
});
