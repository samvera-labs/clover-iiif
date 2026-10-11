import { demoResources } from "docs/lib/demo-resources";

/**
 * The homepage playground's templates and their knobs, described as data, so the panel,
 * the share link and the generated code read from one source.
 *
 * Each knob is a prop of the template. Only a value that differs from the template's own
 * default is passed, and only those are printed in the generated code.
 */

export type TemplateKey = "default" | "document" | "gallery" | "text";

export interface ToggleControl {
  kind: "toggle";
  prop: string;
  label: string;
  hint?: string;
  default: boolean;
}

export interface SelectControl {
  kind: "select";
  prop: string;
  label: string;
  hint?: string;
  /** `false` and `true` are passed as booleans; anything else as a string. */
  options: { value: string; label: string }[];
  default: string;
}

export type Control = ToggleControl | SelectControl;

export interface TemplateSpec {
  key: TemplateKey;
  /** The tab's label, and the component's name in `@nulib/clover/templates`. */
  name: string;
  /** One line, for the tab's title. */
  blurb: string;
  defaultResource: string;
  docsHref: string;
  controls: Control[];
}

const panelLayout = (fallback: "accordion" | "tabs"): SelectControl => ({
  kind: "select",
  prop: "panelLayout",
  label: "Information panel",
  options: [
    { value: "accordion", label: "Accordion" },
    { value: "tabs", label: "Tabs" },
  ],
  default: fallback,
});

const download: ToggleControl = {
  kind: "toggle",
  prop: "download",
  label: "Download",
  hint: "When the Manifest or page has a rendering",
  default: true,
};

export const templateSpecs: Record<TemplateKey, TemplateSpec> = {
  default: {
    key: "default",
    name: "Default",
    blurb:
      "Clover 3.x's Viewer: the panel beside the stage, the thumbnails under it",
    defaultResource: demoResources.viewer,
    docsHref: "/docs/templates",
    controls: [
      panelLayout("accordion"),
      {
        kind: "select",
        prop: "items",
        label: "Thumbnails",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
          { value: "false", label: "None" },
        ],
        default: "carousel",
      },
      {
        kind: "toggle",
        prop: "filter",
        label: "Filter the thumbnails",
        default: false,
      },
      {
        kind: "toggle",
        prop: "panel",
        label: "Information panel",
        default: true,
      },
      download,
    ],
  },
  document: {
    key: "document",
    name: "Document",
    blurb:
      "Reads like a PDF: page thumbnails down the left, one page at a time",
    defaultResource:
      "https://iiif.io/api/cookbook/recipe/0024-book-4-toc/manifest.json",
    docsHref: "/docs/templates",
    controls: [panelLayout("tabs"), download],
  },
  gallery: {
    key: "gallery",
    name: "Gallery",
    blurb: "A grid of the views that opens one in a lightbox",
    defaultResource: demoResources.viewer,
    docsHref: "/docs/templates",
    controls: [
      {
        kind: "select",
        prop: "size",
        label: "Cell size",
        options: [
          { value: "8rem", label: "Small" },
          { value: "10rem", label: "Medium" },
          { value: "14rem", label: "Large" },
        ],
        default: "10rem",
      },
    ],
  },
  text: {
    key: "text",
    name: "Text",
    blurb: "A Manifest read as text, an article per Canvas, as 3.x's Scroll",
    defaultResource: demoResources.scroll,
    docsHref: "/docs/templates",
    controls: [
      {
        kind: "toggle",
        prop: "search",
        label: "Search",
        hint: "Narrows the pages to those that match",
        default: true,
      },
    ],
  },
};

export const templateOrder: TemplateKey[] = [
  "default",
  "document",
  "gallery",
  "text",
];

/** A control's value as the template takes it. */
export const propValue = (control: Control, value: string | boolean) =>
  control.kind === "toggle"
    ? Boolean(value)
    : value === "false"
      ? false
      : value === "true"
        ? true
        : value;

/**
 * Accent presets for the page-theme knob.
 *
 * University brand colors, because that is who runs IIIF: a reader can pick their own
 * institution and see Clover wearing it. Every value is the institution's published
 * brand color, and each clears 4.5:1 against the white text Clover puts on a solid
 * accent — burnt orange is the tightest at 4.59:1.
 *
 * The picker beside them accepts any hex, so these are a starting point rather than a
 * menu.
 */
export const accentPresets = [
  /* The site's own accent (`--accent-9` in tokens.css), so choosing it clears the override. */
  { name: "Northwestern purple", value: "" },
  { name: "Harvard crimson", value: "#A51C30" },
  { name: "Texas burnt orange", value: "#BF5700" },
  { name: "Tulane green", value: "#006747" },
  { name: "UCLA blue", value: "#2774AE" },
];

/**
 * Hue and saturation of a hex color, for Nextra's chrome.
 *
 * Nextra builds its primary color as
 * `hsl(var(--nextra-primary-hue) var(--nextra-primary-saturation) <L>%)`, taking hue
 * and saturation as variables while baking lightness into each utility. Feeding it
 * H and S therefore shifts the whole primary family while leaving Nextra's own
 * light/dark contrast decisions alone — which is why the accent has to be decomposed
 * rather than handed over as a hex.
 */
export const hexToHueSaturation = (hex: string) => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) return { hue: 0, saturation: 0 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));

  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  return { hue, saturation: Math.round(saturation * 100) };
};
