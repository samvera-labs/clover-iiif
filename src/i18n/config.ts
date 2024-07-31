import detector from "i18next-browser-languagedetector";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import locales from "src/i18n/locales";

const namespace = "clover";

/**
 * Namespaces locales by inserting a "clover"
 * key within each unique locale object.
 */
const namespacedLocales = Object.fromEntries(
  Object.entries(locales).map(([key, value]) => [
    key,
    { [`${namespace}`]: value },
  ]),
);

i18next
  .use(detector)
  .use(initReactI18next)
  .init({
    defaultNS: namespace,
    fallbackLng: "en",
    ns: [namespace],
    resources: { ...namespacedLocales },
  });

export default i18next;
