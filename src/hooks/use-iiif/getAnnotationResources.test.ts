import {
  imagesAnnotations,
  multipleHighlighting,
  nonRectangularPolygon,
  recipe0219captionFile,
  simpleAnnotations,
  simpleTagging,
  referencedAnnotations,
} from "src/fixtures/use-iiif/get-annotation-resources";

import { Vault } from "@iiif/vault";
import {
  getAnnotationResources,
  getContentSearchResources,
} from "./getAnnotationResources";
import { manifestNoAnnotations } from "src/fixtures/use-iiif/get-supplementing-resources";

describe("getAnnotationResources method", () => {
  it("processes manifest with simple annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", simpleAnnotations);

    const result = await getAnnotationResources(
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

    const result = await getAnnotationResources(
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

    const result = await getAnnotationResources(
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

  it("processes manifest with multiple highlighting annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", multipleHighlighting);

    const result = await getAnnotationResources(
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

    const result = await getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1",
    );

    const expected = [
      {
        id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-2",
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
            id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-2/anno-1",
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

  it("returns an empty array if there are no annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", manifestNoAnnotations);

    const result = await getAnnotationResources(
      vault,
      "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
    );

    expect(result).toHaveLength(0);
  });

  it("Processes a manifest with supplementing motivation (for example VTT)", async () => {
    const vault = new Vault();
    await vault.loadManifest("", recipe0219captionFile);

    const expected = [
      {
        id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page2",
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
            id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page2/a1",
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

    const result = await getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas",
    );

    expect(result).toStrictEqual(expected);
  });

  it("processes manifests with annotations stored on separate document", async () => {
    const vault = new Vault();
    await vault.loadManifest("", referencedAnnotations);

    const result = await getAnnotationResources(
      vault,
      referencedAnnotations.items[0].id,
    );

    const expected = [
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        behavior: [],
        homepage: [],
        id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/annotationpage.json",
        items: [
          {
            id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/canvas-1/annopage-2/anno-1",
            type: "Annotation",
          },
        ],
        label: {
          none: ["Annotations"],
        },
        logo: [],
        metadata: [],
        motivation: null,
        provider: [],
        rendering: [],
        requiredStatement: null,
        rights: null,
        seeAlso: [],
        service: [],
        summary: null,
        thumbnail: [],
        type: "AnnotationPage",
      },
    ];
    expect(result).toStrictEqual(expected);
  });
});

describe("getContentSearchResources", () => {
  it("returns object with label if content is not search content v2", async () => {
    const searchUrl =
      "http://localhost:3000/manifest/content-search/search-v1.json";
    const vault = new Vault();
    const result = await getContentSearchResources(
      vault,
      searchUrl,
      "Search Results",
    );

    expect(result).toStrictEqual({ label: { none: ["Search Results"] } });
  });
});
