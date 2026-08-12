import {
  IIIFExternalWebResource,
  InternationalString,
  MetadataItem,
} from "@iiif/presentation-3";

/**
 * IIIF resources used by the docs demos.
 *
 * Kept in one place so the homepage cards and the playground open on the same
 * content, and so swapping a demo resource is a one-line change rather than a
 * hunt through MDX.
 */

export const demoResources = {
  /** Commedia dell'Arte mask. Rich metadata, good for the information panel. */
  viewer:
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif",

  /** Multi-language Maktaba manuscript, paged for vertical reading. */
  scroll:
    "https://iiif-maktaba.dc.library.northwestern.edu/dc8ff749-adad-42a7-81e0-0eb473ef88a5.json",

  /** A Collection, which is what Slider consumes. */
  slider:
    "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif",

  /** A plain Image API endpoint — no Manifest involved. */
  image:
    "https://iiif.dc.library.northwestern.edu/iiif/2/b6359e7f-070c-4c86-aee1-515e5b6604e2/full/full/0/default.jpg",

  /**
   * The IIIF Cookbook's navPlace recipe — a Laocoön bronze located at the Getty.
   * Chosen because it carries a real top-level `navPlace` FeatureCollection. Note
   * the NUL works do *not* publish navPlace, despite the hand-authored fixture in
   * `pages/docs/viewer.mdx` suggesting otherwise; that JSON is inline, not fetched.
   */
  map: "https://iiif.io/api/cookbook/recipe/0154-geo-extension/manifest.json",
} as const;

/**
 * Inline IIIF property values for the Primitives card. Hard-coded rather than
 * fetched so the card renders instantly with no network round-trip — primitives
 * take plain IIIF properties, which is the point being demonstrated.
 *
 * Typed against the IIIF Presentation 3.0 types rather than `as const` so the
 * fixtures are actually checked against what the primitives accept. (`as const`
 * makes the inner arrays readonly, which `InternationalString` does not allow.)
 */
export const primitiveFixtures: {
  label: InternationalString;
  summary: InternationalString;
  metadata: MetadataItem[];
  thumbnail: IIIFExternalWebResource[];
} = {
  label: { none: ['Zagna "lunga"'] },
  summary: {
    none: [
      "In early zannesque comedy, all the female characters were comic, grotesque, and played by men. Zagna, the feminine counterpart to Zanni, is the formal, comic-grotesque exaggeration of the woman.",
    ],
  },
  metadata: [
    { label: { none: ["Creator"] }, value: { none: ["Fava, Antonio, 1949-"] } },
    { label: { none: ["Date"] }, value: { none: ["2012"] } },
    { label: { none: ["Genre"] }, value: { none: ["comic masks"] } },
  ],
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275/thumbnail",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
};
