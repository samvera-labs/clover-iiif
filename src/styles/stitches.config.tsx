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
    accent: `hsl(${hue} 100% 38.2%)`,
    accentMuted: `hsl(${hue} 80% 61.8%)`,
    accentAlt: `hsl(${hue} 80% 30%)`,

    /*
     * White and light grays in a light theme.
     * Must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#e6e8eb",
    secondaryAlt: "#c1c8cd",
  },
  fontSizes: {
    1: "12px",
    2: "13px",
    3: "15px",
    4: "17px",
    5: "19px",
    6: "21px",
    7: "27px",
    8: "35px",
    9: "59px",
  },
  lineHeights: {
    1: "12px",
    2: "13px",
    3: "15px",
    4: "17px",
    5: "19px",
    6: "21px",
    7: "27px",
    8: "35px",
    9: "59px",
  },
  sizes: {
    1: "5px",
    2: "10px",
    3: "15px",
    4: "20px",
    5: "25px",
    6: "35px",
    7: "45px",
    8: "65px",
    9: "80px",
  },
  space: {
    1: "5px",
    2: "10px",
    3: "15px",
    4: "20px",
    5: "25px",
    6: "35px",
    7: "45px",
    8: "65px",
    9: "80px",
  },
  radii: {
    1: "4px",
    2: "6px",
    3: "8px",
    4: "12px",
    round: "50%",
    pill: "9999px",
  },
  transitions: {
    all: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
  zIndices: {
    1: "100",
    2: "200",
    3: "300",
    4: "400",
    max: "999",
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

export type { CSS, VariantProps } from "@stitches/react";

export const { styled, css, keyframes, createTheme } = createStitches({
  theme,
  media,
});
