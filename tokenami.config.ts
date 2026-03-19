import { createConfig } from "@tokenami/config";
import { designTokens, mediaQueries } from "./src/styles/design-tokens";

export default createConfig({
  include: ["src/**/*.{ts,tsx}", "docs/**/*.{ts,tsx}"],
  exclude: ["node_modules", "dist"],
  themeSelector: (mode) => (mode === "root" ? ":root" : `[data-theme="${mode}"]`),
  theme: designTokens,
  responsive: mediaQueries,
});
