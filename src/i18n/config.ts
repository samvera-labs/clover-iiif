import detector from "i18next-browser-languagedetector";
import i18next, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import locales from "src/i18n/locales";

export const CLOVER_I18N_NAMESPACE = "clover";

/**
 * Namespaces locales by inserting a "clover"
 * key within each unique locale object.
 */
const namespacedLocales = Object.fromEntries(
  Object.entries(locales).map(([key, value]) => [
    key,
    { [CLOVER_I18N_NAMESPACE]: value },
  ]),
);

const defaultOptions: InitOptions = {
  defaultNS: CLOVER_I18N_NAMESPACE,
  fallbackLng: "en",
  ns: [CLOVER_I18N_NAMESPACE],
  resources: { ...namespacedLocales },
};

const mergeResources = (
  base?: InitOptions["resources"],
  override?: InitOptions["resources"],
) => ({
  ...(base || {}),
  ...(override || {}),
});

let initialized = false;

function applyResourceOverrides(resources?: InitOptions["resources"]) {
  if (!resources) return;
  for (const [lng, namespaces] of Object.entries(resources)) {
    if (!namespaces) continue;
    for (const [namespace, resource] of Object.entries(namespaces)) {
      if (!resource) continue;
      i18next.addResourceBundle(lng, namespace, resource, true, true);
    }
  }
}

export function initCloverI18n(options: InitOptions = {}) {
  if (!initialized) {
    const resources = mergeResources(defaultOptions.resources, options.resources);
    i18next.use(detector).use(initReactI18next).init({
      ...defaultOptions,
      ...options,
      resources,
      // Preserve our namespace defaults unless explicitly overridden.
      ns: options.ns ?? defaultOptions.ns,
      defaultNS: options.defaultNS ?? defaultOptions.defaultNS,
      fallbackLng: options.fallbackLng ?? defaultOptions.fallbackLng,
    });
    initialized = true;
  } else {
    applyResourceOverrides(options.resources);
    if (options.lng) {
      i18next.changeLanguage(options.lng);
    }
    if (options.fallbackLng) {
      i18next.options.fallbackLng = options.fallbackLng;
    }
  }

  return i18next;
}

// Maintain backwards compatibility for callers that relied on the old
// side-effecting import by initializing immediately.
initCloverI18n();

export default i18next;
