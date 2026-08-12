import {
  colorVarRefs,
  cssVarName,
  customThemeToCssVars,
  defaultColors,
  defaultFonts,
  fontVarRefs,
  themeVarBridge,
} from "src/styles/tokens";

/**
 * The `customTheme` prop is public API and predates the CSS custom property layer.
 * These tests pin the exact shape published in the docs so the compatibility promise
 * cannot be broken silently — the theme object below is copied verbatim from the
 * "Custom Theme" example in `pages/docs/viewer.mdx`.
 */
const documentedCustomTheme = {
  colors: {
    primary: "#37474F",
    primaryMuted: "#546E7A",
    primaryAlt: "#263238",

    accent: "#C62828",
    accentMuted: "#E57373",
    accentAlt: "#B71C1C",

    secondary: "#FFFFFF",
    secondaryMuted: "#ECEFF1",
    secondaryAlt: "#CFD8DC",
  },
  fonts: {
    sans: "'Helvetica Neue', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

describe("customThemeToCssVars", () => {
  it("maps every colour and font key documented for customTheme", () => {
    const style = customThemeToCssVars(documentedCustomTheme) as Record<
      string,
      string
    >;

    Object.entries(documentedCustomTheme.colors).forEach(([token, value]) => {
      expect(style[cssVarName("color", token)]).toBe(value);
    });

    Object.entries(documentedCustomTheme.fonts).forEach(([token, value]) => {
      expect(style[cssVarName("font", token)]).toBe(value);
    });

    // Nine colours + two fonts, and nothing else invented along the way.
    expect(Object.keys(style)).toHaveLength(11);
  });

  it("uses kebab-case custom property names", () => {
    const style = customThemeToCssVars({
      colors: { primaryMuted: "#123456" },
    }) as Record<string, string>;

    expect(style).toEqual({ "--clover-color-primary-muted": "#123456" });
  });

  it("accepts a partial theme, leaving unset tokens to fall back", () => {
    const style = customThemeToCssVars({ colors: { accent: "#ff0000" } });

    expect(style).toEqual({ "--clover-color-accent": "#ff0000" });
  });

  it("returns nothing when no theme is passed", () => {
    expect(customThemeToCssVars()).toEqual({});
    expect(customThemeToCssVars(undefined)).toEqual({});
  });

  it("ignores keys that are not real tokens rather than emitting stray properties", () => {
    const style = customThemeToCssVars({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colors: { notAToken: "#000", accent: "#ff0000" } as any,
    });

    expect(style).toEqual({ "--clover-color-accent": "#ff0000" });
  });
});

describe("token plumbing", () => {
  /**
   * Guards the chain that makes `customTheme` and external theming reach the
   * components: the style layer's own `--colors-*` / `--fonts-*` properties are
   * re-derived from the `--clover-*` names that `customThemeToCssVars` writes. If a
   * token were renamed on one side only, theming would silently stop working.
   */
  it("bridges every colour and font token to a --clover-* reference", () => {
    Object.keys(defaultColors).forEach((token) => {
      expect(themeVarBridge[`--colors-${token}`]).toBe(
        `var(${cssVarName("color", token)}, ${
          defaultColors[token as keyof typeof defaultColors]
        })`,
      );
    });

    Object.keys(defaultFonts).forEach((token) => {
      expect(themeVarBridge[`--fonts-${token}`]).toBe(
        `var(${cssVarName("font", token)}, ${
          defaultFonts[token as keyof typeof defaultFonts]
        })`,
      );
    });
  });

  it("carries a literal fallback for every token so the library styles itself unaided", () => {
    Object.values({ ...colorVarRefs, ...fontVarRefs }).forEach((ref) => {
      expect(ref).toMatch(/^var\(--clover-[a-z-]+, .+\)$/);
    });
  });

  it("defines colours as plain hex, not as another design system's variables", () => {
    Object.values(defaultColors).forEach((value) => {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    });
  });
});
