import {
  cssVarName,
  customThemeToCssVars,
  defaultColors,
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
  it("maps every colour key documented for customTheme", () => {
    const style = customThemeToCssVars(documentedCustomTheme) as Record<
      string,
      string
    >;

    Object.entries(documentedCustomTheme.colors).forEach(([token, value]) => {
      expect(style[cssVarName("color", token)]).toBe(value);
    });

    // Nine colours plus the font family, and nothing else invented along the way.
    expect(Object.keys(style)).toHaveLength(10);
  });

  /*
   * There is no font custom property to map onto. Components inherit their type, so a
   * documented `fonts.sans` becomes a plain `font-family` on the wrapper they sit in —
   * which is the only thing that can work without a token to point at. `display` is
   * accepted and ignored, as it always effectively was: nothing referenced it.
   */
  it("applies a documented font as font-family rather than a custom property", () => {
    const style = customThemeToCssVars(documentedCustomTheme) as Record<
      string,
      string
    >;

    expect(style.fontFamily).toBe(documentedCustomTheme.fonts.sans);
    expect(style[cssVarName("font", "sans")]).toBeUndefined();
    expect(style[cssVarName("font", "display")]).toBeUndefined();
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
  it("defines colours as plain hex, not as another design system's variables", () => {
    Object.values(defaultColors).forEach((value) => {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    });
  });
});
