const hue = 209;

export const designTokens = {
  colors: {
    foreground: "#1a1d1e",
    foregroundMuted: "#26292b",
    foregroundAlt: "#151718",
    background: "#ffffff",
    backgroundMuted: "#e6e8eb",
    backgroundAlt: "#c1c8cd",
    accent: `hsl(${hue} 100% 38.2%)`,
    accentMuted: `hsl(${hue} 80% 61.8%)`,
    accentAlt: `hsl(${hue} 80% 30%)`,
    overlay: "#101314d9",
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
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
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
} as const;

export const mediaQueries = {
  xxs: "(max-width: 349px)",
  xs: "(max-width: 575px)",
  sm: "(max-width: 767px)",
  md: "(max-width: 991px)",
  lg: "(max-width: 90rem)",
  xl: "(min-width: calc(90rem + 1px))",
} as const;

export type DesignTokens = typeof designTokens;
