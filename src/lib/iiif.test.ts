/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  decodeContentStateContainerURI,
  getActiveCanvas,
  getContextAsArray,
  parseIiifContent,
  upgradeIiifContent,
} from "src/lib/iiif";

import { ManifestNormalized } from "@iiif/presentation-3";
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

const pseudoManifestPres2 = {
  "@context": "http://iiif.io/api/presentation/2/context.json",
  "@id": "https://api.artic.edu/api/v1/artworks/89503/manifest.json",
  "@type": "sc:Manifest",
  label:
    'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"',
  description: [
    {
      value:
        "Katsushika Hokusai’s much celebrated series, Thirty-Six Views of Mount Fuji (Fugaku sanjûrokkei), was begun in 1830, when the artist was 70 years old. This tour-de-force series established the popularity of landscape prints, which continues to this day. Perhaps most striking about the series is Hokusai’s copious use of the newly affordable Berlin blue pigment, featured in many of the compositions in the color for the sky and water. Mount Fuji is the protagonist in each scene, viewed from afar or up close, during various weather conditions and seasons, and from all directions.\nThe most famous image from the set is the &quot;Great Wave&quot; (Kanagawa oki nami ura), in which a diminutive Mount Fuji can be seen in the distance under the crest of a giant wave. The three impressions of Hokusai’s Great Wave in the Art Institute are all later impressions than the first state of the design.\n",
      language: "en",
    },
  ],
  metadata: [
    {
      label: "Artist / Maker",
      value: "Katsushika Hokusai 葛飾 北斎\nJapanese, 1760-1849",
    },
    {
      label: "Medium",
      value: "Color woodblock print; oban",
    },
  ],
  sequences: [
    {
      "@type": "sc:Sequence",
      canvases: [
        {
          "@type": "sc:Canvas",
          "@id":
            "https://www.artic.edu/iiif/2/2fa24f36-cc26-41b6-4b49-12bba2a6c1c8",
          label:
            'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)", 1830/33. Katsushika Hokusai 葛飾 北斎, Japanese, 1760-1849',
          width: 843,
          height: 583,
          images: [
            {
              "@type": "oa:Annotation",
              motivation: "sc:painting",
              on: "https://www.artic.edu/iiif/2/2fa24f36-cc26-41b6-4b49-12bba2a6c1c8",
              resource: {
                "@type": "dctypes:Image",
                "@id":
                  "https://www.artic.edu/iiif/2/2fa24f36-cc26-41b6-4b49-12bba2a6c1c8/full/843,/0/default.jpg",
                width: 843,
                height: 583,
                service: {
                  "@context": "http://iiif.io/api/image/2/context.json",
                  "@id":
                    "https://www.artic.edu/iiif/2/2fa24f36-cc26-41b6-4b49-12bba2a6c1c8",
                  profile: "http://iiif.io/api/image/2/level2.json",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

const pseudoManifest = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: manifest1,
  type: "Manifest",
  items: [
    {
      id: canvas1,
      type: "Canvas",
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const invalidManifestJson = {
  dog: true,
  breed: "Pug",
  name: "Nina",
  age: 16,
};

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

test("getContextArray organizes context as arrays", () => {
  const context = getContextAsArray(pseudoManifest);
  expect(context).toStrictEqual([
    "https://iiif.io/api/presentation/3/context.json",
  ]);
});

test("upgradeIiifContent converts presentation2 manifest to presentation3", () => {
  const upgradedManifest = upgradeIiifContent(pseudoManifestPres2);
  expect(upgradedManifest["@context"]).toBe(
    "http://iiif.io/api/presentation/3/context.json",
  );
  expect(upgradedManifest.id).toBe(
    "https://api.artic.edu/api/v1/artworks/89503/manifest.json",
  );
  expect(upgradedManifest.type).toBe("Manifest");
  expect(upgradedManifest.label.none[0]).toBe(
    'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave, from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)"',
  );
  expect(upgradedManifest.items[0].id).toBe(
    "https://www.artic.edu/iiif/2/2fa24f36-cc26-41b6-4b49-12bba2a6c1c8",
  );
});

test("logs a TypeError warning for invalid context on upgrade", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  upgradeIiifContent(invalidManifestJson);

  expect(warnSpy).toHaveBeenCalledWith(expect.any(TypeError));
  expect(warnSpy.mock.calls[0][0].message).toMatch(
    /The IIIF content may not be a valid IIIF resource/,
  );

  warnSpy.mockRestore();
});

test("parseIiifContent parses iiifContent and returns object if JSON is provided", () => {
  const parsed = parseIiifContent(pseudoManifest);
  expect(parsed.resourceId).toBe(
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif",
  );
  expect(parsed.resourceObject).toStrictEqual(pseudoManifest);
});

test("parseIiifContent parses iiifContent and returns object if URI is provided", () => {
  const parsed = parseIiifContent(pseudoManifest.id);
  expect(parsed.resourceId).toBe(pseudoManifest.id);
  expect(parsed?.resourceObject).not.toBeDefined();
});

test("parseIiifContent parses iiifContent for base64 encoded content state", () => {
  const parsed = parseIiifContent(canvasContentState);
  expect(parsed.active.canvas).toBe(canvas1);
  expect(parsed.active.manifest).toBe(manifest1);
  expect(parsed.resourceId).not.toBeDefined();
  expect(parsed.resourceObject).toStrictEqual({
    id: canvas1,
    type: "Canvas",
    partOf: [
      {
        id: manifest1,
        type: "Manifest",
      },
    ],
  });
});

test("iiifContent as Manifest URI", () => {
  const containerURI = decodeContentStateContainerURI(manifestURI);
  expect(containerURI).toBe(manifest1);
});

test("iiifContent as Collection URI", () => {
  const containerURI = decodeContentStateContainerURI(collectionURI);
  expect(containerURI).toBe(collection2);
});

test("getActiveCanvas validates Canvas exists in Manifest", () => {
  // @ts-ignore
  const canvasId = getActiveCanvas(pseudoManifest as ManifestNormalized);
  expect(canvasId).toBe(canvas1);
});
