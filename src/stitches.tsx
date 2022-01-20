import { createStitches } from "@stitches/react";

export const theme = {
  colors: {
    /*
     * Black and dark grays in a light theme.
     * Must contrast to 4.5 or greater with `secondary`.
     */
    primary: "#342F2E",
    primaryMuted: "#716C6B",
    primaryAlt: "#000000",

    /*
     * Key brand color(s).
     * Must contrast to 4.5 or greater with `secondary`.
     */
    accent: "#4E2A84",
    accentMuted: "#B6ACD1",
    accentAlt: "#401F68",

    /*
     * White and light grays in a light theme.
     * Must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#F0F0F0",
    secondaryAlt: "#CCCCCC",
  },
  fonts: {
    sans: "'Akkurat Pro Regular', Arial, sans-serif",
    sansBold: "Akkurat Pro Bold, Arial, sans-serif",
    display: "Campton, 'Akkurat Pro Regular', Arial, sans-serif",
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
