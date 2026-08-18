import { InternationalString } from "@iiif/presentation-3";

export const getLabelEntries = (
  label?: InternationalString,
  lang: string = "none",
) => {
  /*
   * If no label exists, return an empty string.
   */
  if (!label) return null;

  /*
   * If label is not a IIIF Presentation API 3.0 shape, return the string
   */
  if (typeof label === "string") return [label];

  /*
   * If InternationalString code does not exist on label, then
   * return what may be there, ex: label.none[0] OR label.fr[0]
   */
  if (!label[lang]) {
    const codes: Array<string> = Object.getOwnPropertyNames(label);
    if (codes.length > 0) return label[codes[0]];
  }

  /*
   * Return label value for InternationalString code `en`
   */
  if (!label[lang]) return null;
  if (!Array.isArray(label[lang])) return null;

  return label[lang] as string[];
};

export const getLabelAsString = (
  label: InternationalString | undefined,
  lang: string = "none",
  delimiter: string = ", ",
) => {
  const entries = getLabelEntries(label, lang);
  return Array.isArray(entries) ? entries.join(`${delimiter}`) : entries;
};

const VIEWPORT_LABEL_FALLBACK = "Image";

interface ViewportLabelSource {
  label?: InternationalString | null;
}

const joinLevelLabels = (
  sources: ViewportLabelSource[],
  plural: string,
  lang: string,
): string | null => {
  if (sources.length === 0) return null;

  const labels = sources.map(
    (source) => getLabelAsString(source?.label ?? undefined, lang) || "",
  );

  // Skip the level unless every resource is labelled, so a viewport showing
  // several resources isn't named after whichever one happens to have a label.
  if (labels.some((label) => !label)) return null;
  if (labels.length === 1) return labels[0];

  // Past a handful, a count reads better than every label of a long Scroll.
  if (labels.length > 3) return `${labels.length} ${plural}`;

  return labels.join(", ");
};

/**
 * Accessible name for an image viewport, escalating in granularity from the
 * painting bodies to the annotations to the canvases.
 */
export const getViewportLabel = (
  levels: {
    bodies?: ViewportLabelSource[];
    annotations?: ViewportLabelSource[];
    canvases?: ViewportLabelSource[];
  },
  lang: string = "none",
): string => {
  const { bodies = [], annotations = [], canvases = [] } = levels;

  return (
    joinLevelLabels(bodies, "bodies", lang) ??
    joinLevelLabels(annotations, "annotations", lang) ??
    joinLevelLabels(canvases, "canvases", lang) ??
    VIEWPORT_LABEL_FALLBACK
  );
};
