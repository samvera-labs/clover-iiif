import { getClosestLanguage } from "@iiif/helpers/i18n";

/**
 * IIIF language maps as text: the closest language to the reader's, and that language's
 * tag, so the text can carry a `lang` attribute.
 */
export type LanguageMapLike =
  | string
  | Record<string, string[] | string | undefined>
  | null
  | undefined;

export interface LocalizedValue {
  text: string;
  /** The tag the text is in; undefined for `none` (no language) or plain strings. */
  lang?: string;
}

/** The reader's languages: the browser's, then the page's. */
function readerLanguages(): string[] {
  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    return [...navigator.languages];
  }
  const page =
    typeof document !== "undefined" ? document.documentElement.lang : "";
  return page ? [page] : [];
}

export function localize(
  value: LanguageMapLike,
  language?: string,
  separator = ", ",
): LocalizedValue {
  if (!value) return { text: "" };
  if (typeof value === "string") return { text: value };

  const tags = Object.keys(value).filter((tag) => value[tag]?.length);
  if (!tags.length) return { text: "" };
  const [first, ...rest] = language ? [language] : readerLanguages();
  // Falls back to `none`, then to the first language given, when nothing matches.
  const tag = getClosestLanguage(first, tags, rest) ?? tags[0];

  const entry = value[tag];
  const text = Array.isArray(entry) ? entry.join(separator) : String(entry);
  return { text, lang: tag === "none" ? undefined : tag };
}
