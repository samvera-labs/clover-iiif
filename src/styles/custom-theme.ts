import type { CSSProperties } from "react";
import { designTokens, type DesignTokens } from "src/styles/design-tokens";

type LegacyColorKey =
  | "primary"
  | "primaryMuted"
  | "primaryAlt"
  | "secondary"
  | "secondaryMuted"
  | "secondaryAlt";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

type CustomThemeColors = Partial<
  DesignTokens["colors"] & Record<LegacyColorKey, string>
>;

type CustomThemeFonts = {
  sans?: string;
  display?: string;
};

export type CustomTheme = DeepPartial<Omit<DesignTokens, "colors">> & {
  colors?: CustomThemeColors;
  fonts?: CustomThemeFonts;
};

const legacyColorMap: Record<LegacyColorKey, keyof DesignTokens["colors"]> = {
  primary: "foreground",
  primaryMuted: "foregroundMuted",
  primaryAlt: "foregroundAlt",
  secondary: "background",
  secondaryMuted: "backgroundMuted",
  secondaryAlt: "backgroundAlt",
};

const supportedColorKeys = new Set(
  Object.keys(designTokens.colors) as Array<keyof DesignTokens["colors"]>,
);

const normalizeColors = (colors?: CustomThemeColors) => {
  if (!colors) return undefined;

  const normalized: Partial<
    Record<keyof DesignTokens["colors"], string>
  > = {};

  Object.entries(colors).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const resolvedKey =
      legacyColorMap[key as LegacyColorKey] ??
      (key as keyof DesignTokens["colors"]);

    if (!supportedColorKeys.has(resolvedKey)) return;

    normalized[resolvedKey] = String(value);
  });

  return normalized;
};

const flattenThemeObject = (
  value: unknown,
  path: string[],
  cssVars: Record<string, string>,
) => {
  if (value === undefined || value === null) return;

  if (typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value as Record<string, unknown>).forEach(
      ([key, entryValue]) => {
        flattenThemeObject(entryValue, [...path, key], cssVars);
      },
    );
    return;
  }

  const cssVar = `--${path.join("-")}`;
  cssVars[cssVar] = String(value);
};

export const customThemeToCssVars = (
  theme?: CustomTheme,
): CSSProperties | undefined => {
  if (!theme) return undefined;

  const cssVars: Record<string, string> = {};
  const normalizedColors = normalizeColors(theme.colors);

  const normalizedTheme: Record<string, unknown> = {
    ...theme,
    ...(normalizedColors ? { colors: normalizedColors } : {}),
  };

  Object.entries(normalizedTheme).forEach(([key, value]) => {
    if (key === "fonts") return;
    flattenThemeObject(value, [key], cssVars);
  });

  if (theme.fonts) {
    Object.entries(theme.fonts).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      cssVars[`--fonts-${key}`] = String(value);
    });
  }

  return Object.keys(cssVars).length ? (cssVars as CSSProperties) : undefined;
};
