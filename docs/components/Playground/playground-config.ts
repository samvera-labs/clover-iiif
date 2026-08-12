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
    blurb: "The full Manifest viewer.",
    controls: [
      {
        kind: "toggle",
        path: "informationPanel.open",
        label: "Information panel",
        hint: "Open the About / metadata panel beside the canvas",
        default: true,
      },
      {
        kind: "toggle",
        path: "informationPanel.renderCanvasSummary",
        label: "Canvas summary",
        hint: "Show the active canvas summary in the About panel",
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
    blurb: "Deep zoom on an Image API endpoint.",
    controls: [
      {
        kind: "toggle",
        path: "openSeadragonConfig.showNavigator",
        label: "Navigator",
        hint: "Thumbnail overview in the corner",
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
    blurb: "navPlace geography and georeferenced overlays.",
    controls: [
      {
        kind: "toggle",
        path: "fitToData",
        label: "Fit to data",
        hint: "Frame the viewport on the navPlace features",
        default: true,
      },
      {
        kind: "toggle",
        path: "scrollZoom",
        label: "Scroll to zoom",
        hint: "Off by default so an embedded map does not capture page scroll",
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
    controlTarget: "options",
    defaultResource: demoResources.slider,
    blurb: "Browse a Collection as a carousel.",
    controls: [
      {
        kind: "select",
        path: "breakpoints.0.slidesPerView",
        label: "Slides per view",
        default: "4",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "6", label: "6" },
        ],
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
    blurb: "Render individual IIIF properties anywhere in your UI.",
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
    blurb: "Long-form vertical reading.",
    controls: [
      {
        kind: "select",
        path: "offset",
        label: "Sticky offset",
        hint: "Pixels reserved for a fixed site header",
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
 * Accent presets for the theme knob. These write `--clover-color-accent` on the
 * preview wrapper, which is all it takes for the rendered component to re-theme —
 * no `customTheme` prop, no remount.
 */
export const accentPresets = [
  { name: "Docs", value: "" },
  { name: "Blue", value: "#0065C3" },
  { name: "Violet", value: "#8E4EC6" },
  { name: "Crimson", value: "#E5484D" },
  { name: "Teal", value: "#0D9488" },
  { name: "Amber", value: "#B45309" },
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
 * Coerces a control's string value back to the type the component expects —
 * `slidesPerView` and `offset` are numbers, everything else stays a string.
 */
export const coerce = (path: string, value: string): string | number =>
  /slidesPerView|offset/.test(path) ? Number(value) : value;
