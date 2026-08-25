import { demoResources } from "docs/lib/demo-resources";

/**
 * The playground's knobs, described as data.
 *
 * Keeping the control definitions declarative means the panel, the URL
 * serialisation and the generated code snippet all read from one source, so adding
 * a knob is a single entry rather than three coordinated edits.
 */

export type ComponentKey =
  | "viewer"
  | "image"
  | "map"
  | "slider"
  | "scroll"
  | "primitives";

export interface ToggleControl {
  kind: "toggle";
  /** Dot path into the props/options object, e.g. "informationPanel.open". */
  path: string;
  label: string;
  hint?: string;
  default: boolean;
}

export interface SelectControl {
  kind: "select";
  path: string;
  label: string;
  hint?: string;
  default: string;
  options: { value: string; label: string }[];
}

export type Control = ToggleControl | SelectControl;

export interface ComponentSpec {
  key: ComponentKey;
  label: string;
  /** Import path shown in the snippet. */
  importPath: string;
  /** Component name in the snippet. */
  displayName: string;
  /** Docs route for "read more". */
  docsHref: string;
  /**
   * Which prop carries the IIIF resource. Omitted for Primitives, which take
   * plain IIIF property values rather than a URL — the resource picker is hidden
   * when this is absent.
   */
  resourceProp?: "iiifContent" | "src";
  /** Whether controls land in an `options` object or as flat props. */
  controlTarget: "options" | "props";
  defaultResource: string;
  blurb: string;
  controls: Control[];
  /**
   * Replaces the generated snippet outright. Primitives compose several
   * components over one object, which the single-element generator cannot express.
   */
  snippetOverride?: string;
}

export const componentSpecs: Record<ComponentKey, ComponentSpec> = {
  viewer: {
    key: "viewer",
    label: "Viewer",
    importPath: "@samvera/clover-iiif/viewer",
    displayName: "Viewer",
    docsHref: "/docs/viewer",
    resourceProp: "iiifContent",
    controlTarget: "options",
    defaultResource: demoResources.viewer,
    blurb: "The full Manifest viewer",
    controls: [
      {
        kind: "toggle",
        path: "informationPanel.open",
        label: "Information panel",
        default: true,
      },
      {
        kind: "toggle",
        path: "informationPanel.renderCanvasSummary",
        label: "Canvas summary",
        default: false,
      },
      {
        kind: "toggle",
        path: "showTitle",
        label: "Title",
        default: true,
      },
      {
        kind: "toggle",
        path: "showIIIFBadge",
        label: "IIIF badge",
        default: true,
      },
      {
        kind: "toggle",
        path: "showDownload",
        label: "Download",
        default: true,
      },
      /*
       * CSS custom properties rather than props — the `--` prefix is what tells the panel
       * to apply them to the stage. Thumbnails are square by default, derived from the
       * width; a height only needs setting to break that ratio.
       */
      {
        kind: "select",
        path: "--clover-thumbnail-width",
        label: "Thumbnail width",
        hint: "CSS: --clover-thumbnail-width.",
        default: "",
        options: [
          { value: "", label: "161.8px (default)" },
          { value: "100px", label: "100px" },
          { value: "240px", label: "240px" },
        ],
      },
      {
        kind: "select",
        path: "--clover-thumbnail-height",
        label: "Thumbnail height",
        hint: "Unset means square, derived from the width.",
        default: "",
        options: [
          { value: "", label: "1:1 from width" },
          { value: "100px", label: "100px" },
          { value: "61.8px", label: "61.8px" },
        ],
      },
      {
        kind: "select",
        path: "canvasHeight",
        label: "Canvas height",
        default: "500px",
        options: [
          { value: "320px", label: "320px" },
          { value: "500px", label: "500px" },
          { value: "70vh", label: "70vh" },
        ],
      },
    ],
  },

  image: {
    key: "image",
    label: "Image",
    importPath: "@samvera/clover-iiif/image",
    displayName: "Image",
    docsHref: "/docs/image",
    resourceProp: "src",
    controlTarget: "props",
    defaultResource: demoResources.image,
    blurb: "Deep zoom any image",
    controls: [
      {
        kind: "toggle",
        path: "openSeadragonConfig.showNavigator",
        label: "Navigator",
        hint: "Thumbnail overview.",
        default: true,
      },
    ],
  },

  map: {
    key: "map",
    label: "Map",
    importPath: "@samvera/clover-iiif/map",
    displayName: "Map",
    docsHref: "/docs/map",
    resourceProp: "iiifContent",
    controlTarget: "props",
    defaultResource: demoResources.map,
    blurb: "Locate items on maps",
    controls: [
      {
        kind: "toggle",
        path: "fitToData",
        label: "Fit to data",
        hint: "Frame the viewport on the data.",
        default: true,
      },
      {
        kind: "toggle",
        path: "scrollZoom",
        label: "Scroll to zoom",
        hint: "Off, so the map never captures page scroll.",
        default: false,
      },
      {
        kind: "toggle",
        path: "useCrosshairCursor",
        label: "Crosshair cursor",
        default: false,
      },
    ],
  },

  slider: {
    key: "slider",
    label: "Slider",
    importPath: "@samvera/clover-iiif/slider",
    displayName: "Slider",
    docsHref: "/docs/slider",
    resourceProp: "iiifContent",
    // `behavior` is a top-level prop, not an `options` key.
    controlTarget: "props",
    defaultResource: demoResources.slider,
    blurb: "Browse items in a carousel",
    /*
     * No "slides per view": slides are sized by their own content now, so how many are
     * visible follows from the viewport. What is worth turning is the layout behavior,
     * which decides whether items stand alone or pair into spreads.
     */
    controls: [
      {
        kind: "select",
        path: "behavior",
        // Empty means "send no prop", so the Slider reads the resource's own behavior.
        // Defaulting to a concrete value would silently override every resource and hide
        // the inference entirely.
        default: "",
        label: "Behavior",
        options: [
          { value: "", label: "From resource" },
          { value: "individuals", label: "individuals" },
          { value: "paged", label: "paged" },
          { value: "continuous", label: "continuous" },
          { value: "unordered", label: "unordered" },
        ],
      },
      /*
       * The embedding seams. Turning these together is what makes the Slider read as a
       * rail inside another component rather than a carousel in its own right — which is
       * exactly how the Viewer's canvas navigation uses it.
       */
      {
        kind: "toggle",
        path: "showHeader",
        label: "Header",
        hint: "Label, summary and prev/next. Off when the host supplies its own.",
        default: true,
      },
      {
        kind: "toggle",
        path: "search",
        label: "Filter",
        hint: "Adds a filter control to the header. The Viewer's rail turns this on.",
        default: false,
      },
      {
        kind: "select",
        path: "--clover-slider-item-width",
        label: "Card width",
        hint: "CSS: --clover-slider-item-width. Wins over the thumbnail width below.",
        default: "",
        options: [
          { value: "", label: "15rem (default)" },
          { value: "161.8px", label: "161.8px (Viewer rail)" },
          { value: "8rem", label: "8rem" },
          { value: "20rem", label: "20rem" },
        ],
      },
      {
        kind: "select",
        path: "--clover-thumbnail-width",
        label: "Thumbnail width",
        hint: "The library-wide fallback, used when the card width above is unset.",
        default: "",
        options: [
          { value: "", label: "unset" },
          { value: "100px", label: "100px" },
          { value: "240px", label: "240px" },
        ],
      },
      {
        kind: "select",
        path: "slidesToScroll",
        label: "Slides per snap",
        hint: "1 makes a snap mean one slide; auto pages by what fits.",
        default: "auto",
        options: [
          { value: "auto", label: "auto (what fits)" },
          { value: "1", label: "1" },
          { value: "2", label: "2" },
        ],
      },
      {
        kind: "select",
        path: "align",
        label: "Align",
        default: "center",
        options: [
          { value: "center", label: "center" },
          { value: "start", label: "start" },
          { value: "end", label: "end" },
        ],
      },
      {
        kind: "toggle",
        path: "dragFree",
        label: "Drag free",
        hint: "Scroll freely instead of settling on snap boundaries.",
        default: false,
      },
      {
        kind: "toggle",
        path: "presentational",
        label: "Presentational",
        hint: "Drops the carousel ARIA so a host can own the semantics.",
        default: false,
      },
    ],
  },

  primitives: {
    key: "primitives",
    label: "Primitives",
    importPath: "@samvera/clover-iiif/primitives",
    displayName: "Primitives",
    docsHref: "/docs/label",
    controlTarget: "props",
    defaultResource: "",
    blurb: "Render IIIF a la carte",
    controls: [],
    snippetOverride: `import {
  Label,
  Metadata,
  Summary,
  Thumbnail,
} from "@samvera/clover-iiif/primitives";

// Primitives take plain IIIF properties — no viewer, no wrapper.
<Thumbnail thumbnail={manifest.thumbnail} />
<Label label={manifest.label} />
<Summary summary={manifest.summary} />
<Metadata metadata={manifest.metadata} />`,
  },

  scroll: {
    key: "scroll",
    label: "Scroll",
    importPath: "@samvera/clover-iiif/scroll",
    displayName: "Scroll",
    docsHref: "/docs/scroll",
    resourceProp: "iiifContent",
    controlTarget: "options",
    defaultResource: demoResources.scroll,
    blurb: "Long-form vertical reading",
    controls: [
      {
        kind: "select",
        path: "offset",
        label: "Sticky offset",
        hint: "Space for a fixed header.",
        default: "0",
        options: [
          { value: "0", label: "0" },
          { value: "60", label: "60" },
          { value: "90", label: "90" },
        ],
      },
    ],
  },
};

export const componentOrder: ComponentKey[] = [
  "viewer",
  "image",
  "map",
  "slider",
  "scroll",
  "primitives",
];

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
  { name: "Page default", value: "" },
  { name: "Northwestern purple", value: "#4E2A84" },
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

/** Sets a dot-path on a nested object, creating intermediate objects as needed. */
export const setPath = (
  target: Record<string, any>,
  path: string,
  value: unknown,
) => {
  const keys = path.split(".");
  let cursor = target;
  keys.slice(0, -1).forEach((key) => {
    if (typeof cursor[key] !== "object" || cursor[key] === null)
      cursor[key] = {};
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return target;
};

/**
 * Coerces a control's string value back to the type the component expects.
 *
 * `slidesToScroll` is the awkward one: it takes a number *or* the literal `"auto"`, and
 * Embla decides between grouping modes with a `typeof` check. Leaving `"1"` a string would
 * silently land in auto-grouping and read as the control having no effect.
 */
export const coerce = (path: string, value: string): string | number => {
  if (/offset/.test(path)) return Number(value);
  if (/slidesToScroll/.test(path))
    return value === "" || Number.isNaN(Number(value)) ? value : Number(value);
  return value;
};
