import { createStitches } from "@stitches/react";

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
    accent: "#006adc",
    accentMuted: "#5eb0ef",
    accentAlt: "#00254d",

    /*
     * White and light grays in a light theme.
     * Must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#e6e8eb",
    secondaryAlt: "#c1c8cd",
  },
  fonts: {
    sans: "'Inter', Arial, sans-serif",
    display: "'Calistoga', 'Inter', Arial, sans-serif",
  },
  transitions: {
    all: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export const media = {
  xxs: "(max-width: 349px)",
  xs: "(max-width: 575px)",
  sm: "(max-width: 767px)",
  md: "(max-width: 991px)",
  xl: "(max-width: 1199px)",
  lg: "(min-width: 1200px)",
};

export const { styled, css, keyframes, createTheme } = createStitches({
  theme,
  media,
});
