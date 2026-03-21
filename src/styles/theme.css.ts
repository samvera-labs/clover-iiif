import { createGlobalTheme, createGlobalThemeContract } from "@vanilla-extract/css";
import { designTokens, mediaQueries } from "src/styles/design-tokens";

export const vars = createGlobalThemeContract(
  designTokens,
  (_value, path) => path.join("-"),
);

export const themeClass = createGlobalTheme(":root", vars, designTokens);

export { mediaQueries };
