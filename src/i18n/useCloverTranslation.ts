import { useCallback, useSyncExternalStore } from "react";

import { CLOVER_I18N_NAMESPACE, cloverI18n } from "src/i18n/config";

/**
 * Clover's strings in the current language. Re-renders when `initCloverI18n` changes the
 * language or adds strings.
 */
export function useCloverTranslation(namespace = CLOVER_I18N_NAMESPACE) {
  const version = useSyncExternalStore(
    cloverI18n.subscribe,
    cloverI18n.getSnapshot,
    cloverI18n.getSnapshot,
  );

  const t = useCallback(
    (key: string, values?: Record<string, unknown>) =>
      cloverI18n.t(key, values, namespace),
    // `version` stands for "the strings changed": a new `t` re-renders memoised readers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [namespace, version],
  );

  return { t, i18n: cloverI18n };
}
