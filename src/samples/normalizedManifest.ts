import { ManifestNormalized } from "@hyperion-framework/types";

export const normalizedManifest: ManifestNormalized = {
  id: "http://127.0.0.1:8080/fixtures/iiif/manifests/assortedCanvases.json",
  type: "Manifest",
  annotations: [],
  behavior: [],
  homepage: null,
  items: [
    {
      id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0",
      type: "Canvas",
    },
    {
      id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/1",
      type: "Canvas",
    },
    {
      id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/2",
      type: "Canvas",
    },
  ],
  label: { en: ["Assorted canvases for testing nulib/react-media-player"] },
  logo: [],
  metadata: [],
  motivation: null,
  navDate: null,
  provider: [],
  partOf: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  rendering: [],
  requiredStatement: {
    label: { en: ["Attribution"] },
    value: { en: ["Who knows?"] },
  },
  rights: "http://rightsstatements.org/vocab/NoC-NC/1.0/",
  seeAlso: [],
  service: [],
  services: [],
  start: null,
  structures: [],
  summary: {
    en: [
      "Integer non fringilla massa, ac tristique ipsum. Quisque imperdiet malesuada magna, id congue augue semper vitae. Etiam nec eleifend elit, vel pharetra velit. Donec facilisis augue eget nisi convallis, vel fermentum dolor tincidunt. ",
    ],
  },
  thumbnail: [],
  viewingDirection: "left-to-right",
  // TODO: Should this be part of Hyperion's Type Definition?
  //"@context": "http://iiif.io/api/presentation/3/context.json",
};
