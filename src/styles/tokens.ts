import type { CSSProperties } from "react";

/**
 * Clover's design tokens.
 *
 * Every token is published as a CSS custom property under the `--clover-` prefix
 * with a literal fallback, so Clover styles itself correctly with no setup while
 * staying themeable from the outside. Anything that sets `--clover-color-accent`
 * on an ancestor wins, and the value cascades into every Clover component.
 *
 * Clover deliberately does not reference another design system's variables here.
 * These fallbacks are plain hex; mapping an external palette (Radix, Tailwind, a
 * consumer's own tokens) onto these names is the host page's job, not the
 * library's.
 */

/**
 * The literal defaults — the single source of truth for Clover's palette.
 * These are the exact equivalents of the HSL values they replaced, so adopting
 * the token layer is not a visual change:
 *
 *   accent      hsl(209 100% 38.2%) -> #0065C3
 *   accentMuted hsl(209  80% 61.8%) -> #50A0EC
 *   accentAlt   hsl(209  80% 30%)   -> #0F4F8A
 */
export const defaultColors = {
  /**
   * Black and dark grays in a light theme.
   * Must contrast to 4.5 or greater with `secondary`.
   */
  primary: "#1A1D1E",
  primaryMuted: "#26292B",
  primaryAlt: "#151718",

  /**
   * Key brand color(s).
   * Must contrast to 4.5 or greater with `secondary`.
   */
  accent: "#0065C3",
  accentMuted: "#50A0EC",
  accentAlt: "#0F4F8A",

  /**
   * White and light grays in a light theme.
   * Must contrast to 4.5 or greater with `primary` and `accent`.
   */
  secondary: "#FFFFFF",
  secondaryMuted: "#E6E8EB",
  secondaryAlt: "#C1C8CD",
} as const;

/**
 * Clover has never applied a font family of its own — components inherit from
 * the host page. `inherit` keeps that behavior while making the `fonts` half of
 * the documented `customTheme` prop actually take effect when it is set.
 */
export const defaultFonts = {
  sans: "inherit",
  display: "inherit",
} as const;

export type CloverColorToken = keyof typeof defaultColors;
export type CloverFontToken = keyof typeof defaultFonts;

/** `primaryMuted` -> `--clover-color-primary-muted` */
export const cssVarName = (group: string, token: string) =>
  `--clover-${group}-${token.replace(/([A-Z])/g, "-$1").toLowerCase()}`;

const toVarRefs = <T extends Record<string, string>>(
  group: string,
  defaults: T,
): Record<keyof T, string> =>
  Object.fromEntries(
    Object.entries(defaults).map(([token, fallback]) => [
      token,
      `var(${cssVarName(group, token)}, ${fallback})`,
    ]),
  ) as Record<keyof T, string>;

/**
 * The values handed to the style layer, e.g.
 * `accent: "var(--clover-color-accent, #0065C3)"`.
 */
export const colorVarRefs = toVarRefs("color", defaultColors);
export const fontVarRefs = toVarRefs("font", defaultFonts);

/**
 * Re-derives the style layer's own custom properties from the `--clover-*`
 * tokens.
 *
 * This exists because a custom property is substituted where it is *declared*,
 * not where it is used. The style layer declares `--colors-accent` once at the
 * document root, so an override applied further down the tree — the docs
 * playground scoping an accent to just its preview pane, say — would otherwise
 * be ignored. Spreading this onto each component's root wrapper makes the
 * substitution happen again below any such override.
 *
 * Phase 3 removes the need for it: once components reference
 * `var(--clover-color-accent)` at the point of use, substitution always happens
 * in the element's own context.
 */
export const themeVarBridge: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(colorVarRefs).map(([token, ref]) => [
      `--colors-${token}`,
      ref,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(fontVarRefs).map(([token, ref]) => [
      `--fonts-${token}`,
      ref,
    ]),
  ),
};

/**
 * Reads a token's *resolved* value from the DOM.
 *
 * Most of Clover styles itself with CSS, where a `var()` reference is all that is
 * needed. MapLibre is the exception: its paint properties are handed to WebGL,
 * which cannot parse `var(--clover-color-accent, #0065C3)`. Anything painting
 * outside of CSS — a WebGL layer, a canvas, an inline SVG attribute — has to ask
 * for the computed value instead.
 *
 * Pass the element the value should be resolved against so a scoped override is
 * honored; falls back to Clover's literal default when the property is unset or
 * there is no DOM (SSR).
 */
export const resolveCloverColor = (
  token: CloverColorToken,
  element?: Element | null,
): string => {
  const fallback = defaultColors[token];
  if (typeof window === "undefined") return fallback;

  const scope = element ?? document.documentElement;
  const resolved = window
    .getComputedStyle(scope)
    .getPropertyValue(cssVarName("color", token))
    .trim();

  return resolved || fallback;
};

/**
 * Maps a `customTheme` prop onto inline CSS custom properties.
 *
 * Accepts the shape Clover has always documented —
 * `{ colors: { accent, primary, ... }, fonts: { sans, display } }` — and returns
 * a style object of `--clover-*` declarations. Unknown keys are ignored so a
 * stale or partial theme cannot inject arbitrary CSS.
 */
export const customThemeToCssVars = (customTheme?: {
  colors?: Partial<Record<CloverColorToken, string>>;
  fonts?: Partial<Record<CloverFontToken, string>>;
}): CSSProperties => {
  if (!customTheme) return {};

  const style: Record<string, string> = {};

  Object.entries(customTheme.colors ?? {}).forEach(([token, value]) => {
    if (value && token in defaultColors)
      style[cssVarName("color", token)] = value;
  });

  Object.entries(customTheme.fonts ?? {}).forEach(([token, value]) => {
    if (value && token in defaultFonts)
      style[cssVarName("font", token)] = value;
  });

  return style as CSSProperties;
};
