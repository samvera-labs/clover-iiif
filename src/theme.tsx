import { createTheme } from "@stitches/react";

export const theme = createTheme("light", {
  color: {
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
  font: {
    sans: "'Akkurat Pro Regular', Arial, sans-serif",
    display: "Campton, 'Akkurat Pro Regular', Arial, sans-serif",
  },
  transition: {
    all: "all 200ms ease-in-out",
  },
});
