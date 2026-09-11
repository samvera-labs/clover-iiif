import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import en from "src/i18n/locales/en.json";
import { CLOVER_I18N_NAMESPACE } from "src/i18n/config";

const FALLBACK_MAP = en as Record<string, string>;

/*
 * The fallback interpolates too. Without it a key carrying placeholders reaches the
 * reader verbatim ("Item {{index}} of {{total}}") whenever i18next hands the key back,
 * which it does when a consumer sets `fallbackLng: false`.
 */
export function getFallbackValue(key: string, options?: unknown) {
  const value = FALLBACK_MAP[key] ?? key;
  const values = options as Record<string, unknown> | undefined;

  if (!values) return value;

  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    name in values ? String(values[name]) : match,
  );
}

export function useCloverTranslation(namespace = CLOVER_I18N_NAMESPACE) {
  const translation = useTranslation(namespace as any);
  const { t } = translation;

  const safeTranslate = useCallback(
    (key: string, options?: unknown) => {
      const value = t(key, options as any);
      if (typeof value !== "string" || value === key) {
        return getFallbackValue(key, options);
      }
      return value;
    },
    [t],
  );

  return {
    ...translation,
    t: safeTranslate,
  };
}
