import locales from "src/i18n/locales";

/**
 * Clover's translations, without a translation library.
 *
 * Clover needs a key lookup with a fallback chain, `{{name}}` interpolation and browser
 * language detection. i18next did that at about 20 kB gzipped across three packages;
 * this does it in well under one. Languages are still defined the way i18next defines
 * them, so existing `initCloverI18n` calls keep working:
 *
 *     initCloverI18n({
 *       lng: "de",
 *       fallbackLng: ["de", "en"],
 *       resources: { de: { clover: { informationPanelTabsAbout: "Über" } } },
 *     });
 */

export const CLOVER_I18N_NAMESPACE = "clover";

/** `resources[language][namespace][key]` — i18next's resource shape. */
export type CloverI18nResources = Record<
  string,
  Record<string, Record<string, string>>
>;

export interface CloverI18nOptions {
  /** The language to use. Detected from the browser when not given. */
  lng?: string;
  /** Languages to try, in order, when a key is missing. English is always last. */
  fallbackLng?: string | readonly string[] | false;
  /** Strings to add or override, merged into what Clover ships. */
  resources?: CloverI18nResources;
}

const resources: CloverI18nResources = Object.fromEntries(
  Object.entries(locales).map(([lng, strings]) => [
    lng,
    { [CLOVER_I18N_NAMESPACE]: { ...strings } },
  ]),
);

let language: string | undefined;
let fallbacks: string[] = [];
let version = 0;
const listeners = new Set<() => void>();

function notify() {
  version++;
  listeners.forEach((listener) => listener());
}

/** `pt-BR` → `pt-BR`, `pt`: a regional tag falls back to its base language. */
function withBase(lng: string): string[] {
  const base = lng.split("-")[0];
  return base && base !== lng ? [lng, base] : [lng];
}

/** The reader's languages, most preferred first: the browser's, then the page's. */
function preferredLanguages(): string[] {
  const found: string[] = [];
  if (typeof navigator !== "undefined") {
    found.push(...(navigator.languages ?? []), navigator.language);
  }
  if (typeof document !== "undefined")
    found.push(document.documentElement.lang);
  return found.filter(Boolean);
}

/** Every language to look in, in order, ending with English. */
function lookupChain(): string[] {
  const requested = language ? [language] : preferredLanguages();
  return [
    ...new Set([...requested, ...fallbacks].flatMap(withBase).concat("en")),
  ];
}

export const cloverI18n = {
  /** The language set, or else the first of the reader's that Clover has strings for. */
  get language(): string {
    return language ?? lookupChain().find((lng) => resources[lng]) ?? "en";
  },

  changeLanguage(lng: string) {
    language = lng;
    notify();
  },

  t(
    key: string,
    values?: Record<string, unknown>,
    namespace: string = CLOVER_I18N_NAMESPACE,
  ): string {
    let text = key;
    for (const lng of lookupChain()) {
      const value = resources[lng]?.[namespace]?.[key];
      if (value !== undefined) {
        text = value;
        break;
      }
    }
    if (!values) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, name) =>
      name in values ? String(values[name]) : match,
    );
  },

  /** For `useSyncExternalStore`: re-render readers when the language or strings change. */
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): number {
    return version;
  },
};

export type CloverI18n = typeof cloverI18n;

/**
 * Set Clover's language and add or override strings. Safe to call more than once: each
 * call merges its `resources` and applies any `lng` or `fallbackLng` it is given.
 */
export function initCloverI18n(options: CloverI18nOptions = {}): CloverI18n {
  for (const [lng, namespaces] of Object.entries(options.resources ?? {})) {
    for (const [namespace, strings] of Object.entries(namespaces ?? {})) {
      resources[lng] ??= {};
      resources[lng][namespace] = {
        ...resources[lng][namespace],
        ...strings,
      };
    }
  }
  if (options.fallbackLng !== undefined) {
    fallbacks =
      options.fallbackLng === false ? [] : [options.fallbackLng].flat();
  }
  if (options.lng) language = options.lng;
  notify();
  return cloverI18n;
}
