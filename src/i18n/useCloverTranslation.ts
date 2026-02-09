import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import en from "src/i18n/locales/en.json";
import { CLOVER_I18N_NAMESPACE } from "src/i18n/config";

const FALLBACK_MAP = en as Record<string, string>;

function getFallbackValue(key: string) {
  return FALLBACK_MAP[key] ?? key;
}

export function useCloverTranslation(namespace = CLOVER_I18N_NAMESPACE) {
  const translation = useTranslation(namespace as any);
  const { t } = translation;

  const safeTranslate = useCallback(
    (key: string, options?: unknown) => {
      const value = t(key, options as any);
      if (typeof value !== "string" || value === key) {
        return getFallbackValue(key);
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
