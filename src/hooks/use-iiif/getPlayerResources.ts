import {
  CanvasNormalized,
  ManifestNormalized,
  RangeNormalized,
} from "@iiif/presentation-3";

import { AnnotationResources } from "src/types/annotations";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { getLabel } from "src/hooks/use-iiif/getLabel";
import {
  collectCaptionResources,
  parseAnnotationTarget,
} from "src/lib/annotation-helpers";

export interface PlayerCaption {
  src: string;
  label: string;
  language: string;
  default: boolean;
}

export interface PlayerChapter {
  startTime: number;
  endTime?: number;
  text: string;
}

export interface PlayerSource {
  src: string;
  type?: string;
  label: string;
}

export interface PlayerResources {
  captions: PlayerCaption[];
  chapters: PlayerChapter[];
  sources: PlayerSource[];
  duration?: number;
}

/**
 * The Manifest already describes almost everything a transport bar wants to show. This turns
 * that description into plain data, with no player library in sight — which is what makes it
 * testable against a Vault and replaceable if the player ever changes.
 */

/**
 * `getLabel` hands back whatever sits under the language code, and in a normalized
 * InternationalString that is an array of strings. Every caller has to flatten it; doing it
 * here keeps the flattening in one place.
 */
function labelToString(label: unknown, language = "en"): string {
  const value = getLabel(label as any, language);
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

/**
 * `"30"`, `"0,30"` and `"0,"` are all legal time fragments. Returns undefined rather than
 * NaN so a malformed fragment drops the chapter instead of producing one at time NaN.
 */
function parseTimeFragment(
  t?: string,
): { start: number; end?: number } | undefined {
  if (!t) return undefined;

  const [rawStart, rawEnd] = t.split(",");

  const start = Number(rawStart);
  if (rawStart === "" || Number.isNaN(start)) return undefined;

  if (rawEnd === undefined || rawEnd === "") return { start };

  const end = Number(rawEnd);
  return Number.isNaN(end) ? { start } : { start, end };
}

/**
 * Captions, from `supplementing` annotations whose bodies a text track can actually fetch.
 *
 * `isCaptionResource` is the same gate the native `<track>` path uses, so the two paths agree
 * on what counts as a caption. `ignoreCaptionLabels` is applied here rather than at render
 * time so the menu and the loaded tracks can never disagree.
 */
export function getPlayerCaptions(
  vault: any,
  annotationResources: AnnotationResources,
  ignoreCaptionLabels: string[] = [],
): PlayerCaption[] {
  const captions: PlayerCaption[] = [];

  collectCaptionResources(vault, annotationResources as any).forEach(
    (resource: LabeledIIIFExternalWebResource) => {
      /**
       * Match the native `<track>` path exactly: `Track.tsx` tests every value in the
       * label array against `ignoreCaptionLabels`, not just the first. A caption whose
       * label is `["Chapters", "Kapitel"]` is ignored if either spelling is listed.
       */
      const rawLabel = getLabel(resource.label as any, "en");
      const labelValues = Array.isArray(rawLabel)
        ? rawLabel
        : [rawLabel].filter(Boolean);
      if (
        labelValues.some((value: string) => ignoreCaptionLabels.includes(value))
      )
        return;

      captions.push({
        src: String(resource.id),
        label: labelToString(resource.label),
        /**
         * The native path hardcoded `srcLang="en"`. A caption body may declare its own
         * language, and when it does it is better information than a guess — which is the
         * whole point of a manifest carrying one track per language.
         */
        language: normalizeLanguage(resource) ?? "en",
        default: false,
      });
    },
  );

  // Only one track may be the default, and only if there is one to pick.
  if (captions.length > 0) captions[0].default = true;

  return captions;
}

function normalizeLanguage(
  resource: LabeledIIIFExternalWebResource,
): string | undefined {
  const language = (resource as any)?.language;
  if (!language) return undefined;
  const value = Array.isArray(language) ? language[0] : language;
  return typeof value === "string" && value ? value : undefined;
}

/**
 * Chapters, from `structures`.
 *
 * A IIIF Range that targets this canvas with a time fragment is a chapter: `#t=0,30` on the
 * Range's canvas item, or a `FragmentSelector` carrying `t=`. `parseAnnotationTarget` already
 * understands every spelling of that, including the `&t=` form the Vault normalizes oddly.
 *
 * Ranges nest, and a nested Range is still a chapter of the same canvas, so this walks the
 * whole tree rather than only the top level. Chapters come back sorted by start time with
 * gaps closed, because a scrubber renders them as contiguous regions.
 */
export function getPlayerChapters(
  vault: any,
  manifestId: string,
  canvasId: string,
  canvasDuration?: number,
): PlayerChapter[] {
  const manifest = vault.get(manifestId) as ManifestNormalized;
  if (!manifest?.structures?.length) return [];

  const chapters: PlayerChapter[] = [];
  const visited = new Set<string>();

  const walk = (rangeRef: { id: string }) => {
    // Ranges may reference one another; a cycle would otherwise hang the walk.
    if (!rangeRef?.id || visited.has(rangeRef.id)) return;
    visited.add(rangeRef.id);

    const range = vault.get(rangeRef.id) as RangeNormalized;
    if (!range) return;

    const text = labelToString(range.label);

    range.items?.forEach((item: any) => {
      if (item?.type === "Range") {
        walk(item);
        return;
      }

      /**
       * A Range item is either a bare Canvas reference or a SpecificResource wrapping one.
       * Only the latter can carry a time, but both spellings reach `parseAnnotationTarget`
       * as either a string or an object, so hand it whichever we have.
       */
      const target = item?.source ? item : item?.id;
      if (!target) return;

      const parsed = parseAnnotationTarget(target);
      if (!parsed?.id || stripFragment(parsed.id) !== canvasId) return;

      const time = parseTimeFragment(parsed.t);
      if (!time) return;

      chapters.push({
        startTime: time.start,
        endTime: time.end,
        text,
      });
    });
  };

  manifest.structures.forEach((structure: any) => walk(structure));

  chapters.sort((a, b) => a.startTime - b.startTime);

  /**
   * Close the gaps. A Range may declare only a start, and a scrubber needs each chapter to
   * run up to the next one — otherwise the markers render as slivers with dead space between.
   */
  return chapters.map((chapter, index) => {
    const next = chapters[index + 1];
    const endTime = chapter.endTime ?? next?.startTime ?? canvasDuration;
    return { ...chapter, endTime };
  });
}

function stripFragment(id: string) {
  return String(id).split("#")[0];
}

/**
 * Sources, from the painting annotation. A `Choice` becomes a source menu; a single body
 * becomes a menu of one, which the control bar hides.
 */
export function getPlayerSources(
  allSources: LabeledIIIFExternalWebResource[],
): PlayerSource[] {
  return (allSources ?? [])
    .filter((source) => Boolean(source?.id))
    .map((source, index) => ({
      src: String(source.id),
      type: source.format,
      label:
        labelToString(source.label) || source.format || `Source ${index + 1}`,
    }));
}

/**
 * Everything the player needs from IIIF, in one call.
 *
 * `duration` comes off the Canvas rather than the media body: it is known before any bytes
 * are fetched, so the scrubber can render at full width immediately instead of snapping when
 * `loadedmetadata` fires.
 */
export function getPlayerResources(
  vault: any,
  {
    manifestId,
    canvasId,
    annotationResources,
    allSources,
    ignoreCaptionLabels,
  }: {
    manifestId: string;
    canvasId: string;
    annotationResources: AnnotationResources;
    allSources: LabeledIIIFExternalWebResource[];
    ignoreCaptionLabels?: string[];
  },
): PlayerResources {
  const canvas = vault.get(canvasId) as CanvasNormalized;
  const duration =
    typeof canvas?.duration === "number" && canvas.duration > 0
      ? canvas.duration
      : undefined;

  return {
    captions: getPlayerCaptions(
      vault,
      annotationResources,
      ignoreCaptionLabels,
    ),
    chapters: getPlayerChapters(vault, manifestId, canvasId, duration),
    sources: getPlayerSources(allSources),
    duration,
  };
}
