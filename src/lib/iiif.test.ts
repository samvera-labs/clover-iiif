import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3";
import { decodeContentStateContainerURI, getActiveCanvas } from "src/lib/iiif";

import { encodeContentState } from "@iiif/helpers";
import { expect } from "vitest";

// URIs for fixtures
const canvas1 =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2";
const manifest1 =
  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif";
const manifest2 =
  "https://api.dc.library.northwestern.edu/api/v2/works/b6584c92-8465-4969-afe4-8e2f94988acf?as=iiif";
const collection2 =
  "https://api.dc.library.northwestern.edu/api/v2/collections/55ff2504-dd53-4943-b2cb-aeea46e77bc3?as=iiif";

// fixtures
const manifestURI = manifest1;
const collectionURI = collection2;
const canvasContentState = encodeContentState(
  JSON.stringify({
    id: canvas1,
    type: "Canvas",
    partOf: [
      {
        id: manifest1,
        type: "Manifest",
      },
    ],
  }),
);
const manifestContentState = encodeContentState(
  JSON.stringify({
    id: manifest2,
    type: "Manifest",
    partOf: [
      {
        id: collection2,
        type: "Collection",
      },
    ],
  }),
);
const canvasAnnotationContentState = encodeContentState(
  JSON.stringify({
    id: "https://example.org/import/1",
    type: "Annotation",
    motivation: ["contentState"],
    target: {
      id: canvas1,
      type: "Canvas",
      partOf: [
        {
          id: manifest1,
          type: "Manifest",
        },
      ],
    },
  }),
);
const emptyPartOfContentState = encodeContentState(
  JSON.stringify({
    id: manifest1,
    type: "Manifest",
    partOf: [],
  }),
);
const emptyPartOfContentState2 = encodeContentState(
  JSON.stringify({
    id: collection2,
    type: "Collection",
    partOf: [],
  }),
);

const pseudoManifest = {
  id: manifest1,
  type: "Manifest",
  items: [
    {
      id: canvas1,
      type: "Canvas",
    },
  ],
};
const badCanvasId = encodeContentState(
  JSON.stringify({
    id: "https://example.org/notInManifest",
    type: "Canvas",
    partOf: [
      {
        id: manifest1,
        type: "Manifest",
      },
    ],
  }),
);

const pseudoCollection = {
  id: collection2,
  type: "Collection",
  items: [
    {
      id: manifest2,
      type: "Manifest",
    },
  ],
};
const badManifestId = encodeContentState(
  JSON.stringify({
    id: "https://example.org/notInCollection",
    type: "Manifest",
    partOf: [
      {
        id: collection2,
        type: "Collection",
      },
    ],
  }),
);

test("iiifContent as Manifest URI", () => {
  const containerURI = decodeContentStateContainerURI(manifestURI);
  expect(containerURI).toBe(manifest1);
});

test("iiifContent as Collection URI", () => {
  const containerURI = decodeContentStateContainerURI(collectionURI);
  expect(containerURI).toBe(collection2);
});

test("getActiveCanvas validates Canvas exists in Manifest", () => {
  const canvasId = getActiveCanvas(pseudoManifest as ManifestNormalized);
  expect(canvasId).toBe(canvas1);
});
