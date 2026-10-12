import { demoResources } from "docs/lib/demo-resources";

/**
 * The homepage playground's templates and resources, described as data, so the pickers
 * and the share link read from one source.
 */

export type TemplateKey = "default" | "document" | "gallery" | "text";

export interface PlaygroundResource {
  key: string;
  /** What it is, in a word, under its thumbnail. */
  name: string;
  /** Its own label, copied from the resource so the picker needs no fetch. */
  title: string;
  /** Its address, a content state, or a path under the docs' published `/mocks/`. */
  resource: string;
  mock?: boolean;
  thumbnail: string;
  /** Has places or a georeference, so the docs' MapLibre worker must be set first. */
  map?: boolean;
}

const works = "https://api.dc.library.northwestern.edu/api/v2/works";
const nul = (id: string) => `${works}/${id}?as=iiif`;

/**
 * A IIIF Content State as a link carries it: the JSON, URI-encoded, then base64url,
 * unpadded (as Clover's `encodeContentState`, written out here so the homepage need not
 * load Clover to name a resource).
 */
const contentState = (target: Record<string, unknown>) =>
  btoa(
    encodeURIComponent(
      JSON.stringify({
        "@context": "http://iiif.io/api/presentation/3/context.json",
        type: "Annotation",
        motivation: ["contentState"],
        target,
      }),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const MASKS =
  "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif";

/**
 * One of each kind of thing a page might show, a Collection first: paged, still,
 * timed and placed after it. Every template opens each of them.
 */
export const resources: PlaygroundResource[] = [
  {
    key: "collection",
    name: "Collection",
    title: "Commedia dell'Arte: The Masks of Antonio Fava",
    // The Collection, opened on Zagna "lunga": a content state naming the Manifest, part
    // of the Collection, so the reader arrives on it among the other masks.
    resource: contentState({
      id: nul("71153379-4283-43be-8b0f-4e7e3bfda275"),
      type: "Manifest",
      partOf: [{ id: MASKS, type: "Collection" }],
    }),
    // The mask it opens on, not the Collection's own.
    thumbnail: `${works}/71153379-4283-43be-8b0f-4e7e3bfda275/thumbnail`,
  },
  {
    key: "book",
    name: "Book",
    title: "Wunder der Vererbung / von Fritz Bolle.",
    resource: "https://iiif.wellcomecollection.org/presentation/v3/b18035723",
    thumbnail:
      "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/!200,200/0/default.jpg",
  },
  {
    key: "manuscript",
    name: "Manuscript",
    title:
      "The Rushd al-Ghāfil / Guide for the Heedless (ʿAbd Allāh b. al-Ḥājj Ibrāhīm al-ʿAlawī, d. 1818)",
    resource: demoResources.scroll,
    thumbnail:
      "https://images.digital.library.illinois.edu/iiif/2/19870760-96bc-013c-4aba-02d0d7bfd6e4-d/full/!256,256/0/default.jpg",
  },
  {
    key: "photograph",
    name: "Photograph",
    title: "Picture of Göttingen taken during the 2019 IIIF Conference",
    resource:
      "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/manifest.json",
    thumbnail:
      "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/!300,300/0/default.jpg",
  },
  // Georeferenced, so the Viewer adds a Map tab that lays the sheet over the town.
  {
    key: "map",
    name: "Map",
    title: "Map of the Township of Evanston, Cook County, Illinois",
    resource: "georeference/manifest.json",
    mock: true,
    map: true,
    thumbnail:
      "https://iiif.dc.library.northwestern.edu/iiif/3/2fb1e81a-9e24-420c-b224-0bfd6a279baf/full/!300,300/0/default.jpg",
  },
  {
    key: "film",
    name: "Film",
    title: "Northwestern Football scrimmages, 1959",
    resource: nul("d8fb6329-f7fb-48bf-8bb7-70a64ded5a15"),
    thumbnail: `${works}/d8fb6329-f7fb-48bf-8bb7-70a64ded5a15/thumbnail`,
  },
  {
    key: "recording",
    name: "Recording",
    title: "Partial audio recording of Gustav Mahler's Symphony No. 3",
    resource:
      "https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/manifest.json",
    // The score's first page, which the recording shows while it plays.
    thumbnail:
      "https://iiif.io/api/image/3.0/example/reference/4b45bba3ea612ee46f5371ce84dbcd89-mahler-0/full/!300,300/0/default.jpg",
  },
  {
    key: "animation",
    name: "Animation",
    title: 'Plate Number 626. "Annie G." galloping',
    resource:
      "https://nulib-ds.github.io/muybridge/iiif/plate-number-626-annie-g-galloping.json",
    // The first frame, not the plate's own animated GIF, which is over a megabyte.
    thumbnail:
      "https://api.nga.gov/iiif/d3bdd5ac-a597-4cd6-a1e7-921f42edbd8e/pct:1.2882,1.2152,23.6669,23.3242/!300,300/0/default.jpg",
  },
];

export const resourceByKey = (key: string) =>
  resources.find((entry) => entry.key === key);

export interface TemplateSpec {
  key: TemplateKey;
  /** The layout's label, and the component's name in `@nulib/clover/templates`. */
  name: string;
  /** The key of the resource it opens on, until the reader picks one. */
  defaultResource: string;
}

export const templateSpecs: Record<TemplateKey, TemplateSpec> = {
  default: { key: "default", name: "Default", defaultResource: "collection" },
  document: { key: "document", name: "Document", defaultResource: "book" },
  gallery: { key: "gallery", name: "Gallery", defaultResource: "collection" },
  text: { key: "text", name: "Text", defaultResource: "manuscript" },
};

export const templateOrder: TemplateKey[] = [
  "default",
  "document",
  "gallery",
  "text",
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
