import {
  imagesAnnotations,
  multipleHighlighting,
  nonRectangularPolygon,
  simpleAnnotations,
  simpleTagging,
} from "src/fixtures/use-iiif/get-annotation-resources";
import {
  manifestNoAnnotations,
  vttManifest,
} from "src/fixtures/use-iiif/get-supplementing-resources";

import { Vault } from "@iiif/vault";
import { getAnnotationResources } from "./getAnnotationResources";

describe("getAnnotationResources method", () => {
  it("processes manifest with simple annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", simpleAnnotations);

    const result = getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1",
    );

    const expected = [
      {
        id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2",
        type: "AnnotationPage",
        behavior: [],
        motivation: null,
        label: {
          none: ["Annotations"],
        },
        thumbnail: [],
        summary: null,
        requiredStatement: null,
        metadata: [],
        rights: null,
        provider: [],
        items: [
          {
            id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2/anno-1",
            type: "Annotation",
          },
        ],
        seeAlso: [],
        homepage: [],
        logo: [],
        rendering: [],
        service: [],
      },
    ];

    expect(result).toStrictEqual(expected);
  });

  it("processes manifest with simple tagging annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", simpleTagging);

    const result = getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
    );

    const expected = [
      {
        id: "https://iiif.io/api/cookbook/recipe/0021-tagging/page/p2/1",
        type: "AnnotationPage",
        behavior: [],
        motivation: null,
        label: {
          none: ["Annotations"],
        },
        thumbnail: [],
        summary: null,
        requiredStatement: null,
        metadata: [],
        rights: null,
        provider: [],
        items: [
          {
            id: "https://iiif.io/api/cookbook/recipe/0021-tagging/annotation/p0002-tag",
            type: "Annotation",
          },
        ],
        seeAlso: [],
        homepage: [],
        logo: [],
        rendering: [],
        service: [],
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it("processes manifest with non-rectangular polygon annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", nonRectangularPolygon);

    const result = getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
    );

    const expected = [
      {
        id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/page/p2/1",
        type: "AnnotationPage",
        behavior: [],
        motivation: null,
        label: {
          none: ["Annotations"],
        },
        thumbnail: [],
        summary: null,
        requiredStatement: null,
        metadata: [],
        rights: null,
        provider: [],
        items: [
          {
            id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/annotation/p0002-svg",
            type: "Annotation",
          },
        ],
        seeAlso: [],
        homepage: [],
        logo: [],
        rendering: [],
        service: [],
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it.only("processes manifest with multiple highlighting annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", multipleHighlighting);

    const result = getAnnotationResources(
      vault,
      "http://localhost:3000/manifest/newspaper/canvas/i1p1",
    );

    const expected = [
      {
        id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json",
        type: "AnnotationPage",
        behavior: [],
        motivation: null,
        label: {
          none: ["Annotations"],
        },
        thumbnail: [],
        summary: null,
        requiredStatement: null,
        metadata: [],
        rights: null,
        provider: [],
        items: [
          {
            id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-1",
            type: "Annotation",
          },
          {
            id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-2",
            type: "Annotation",
          },
          {
            id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-3",
            type: "Annotation",
          },
          {
            id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-4",
            type: "Annotation",
          },
        ],
        seeAlso: [],
        homepage: [],
        logo: [],
        rendering: [],
        service: [],
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it("processes manifest with images in the annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", imagesAnnotations);

    const result = getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1",
    );

    const expected = [
      {
        id: "Annotation",
        items: [
          {
            body: [
              {
                format: "image/jpeg",
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-fountain/full/300,/0/default.jpg",
                type: "Image",
              },
              {
                id: "vault://69cc99ce",
                language: "en",
                type: "TextualBody",
                value:
                  "Night picture of the Gänseliesel fountain in Göttingen taken during the 2019 IIIF Conference",
              },
            ],
            target:
              "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1#xywh=138,550,1477,1710",
          },
        ],
        label: {
          en: ["Annotation"],
        },
        motivation: "commenting",
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it("returns an empty array if there are no annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", manifestNoAnnotations);

    const result = getAnnotationResources(
      vault,
      "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
    );

    expect(result).toHaveLength(0);
  });

  it("returns an empty array if manifest has supplementing motivation", async () => {
    const vault = new Vault();
    await vault.loadManifest("", vttManifest);

    const result = getAnnotationResources(
      vault,
      "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
    );

    expect(result).toHaveLength(0);
  });
});
