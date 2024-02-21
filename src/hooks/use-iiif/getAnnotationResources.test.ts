import {
  imagesAnnotations,
  multipleHighlighting,
  nonRectangularPolygon,
  recipe0219captionFile,
  simpleAnnotations,
  simpleTagging,
} from "src/fixtures/use-iiif/get-annotation-resources";
import { AnnotationPage } from "@iiif/presentation-3";

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

  it("processes manifest with multiple highlighting annotations", async () => {
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

    const result = getAnnotationResources(
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

    const result = getAnnotationResources(
      vault,
      "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas",
    );

    expect(result).toStrictEqual(expected);
  });
});

describe("getContentSearchResources", () => {
  it("processes content search AnnotationPage manifest", async () => {
    const searchUrl =
      "http://localhost:3000/manifest/content-search/content-search.json";
    const vault = new Vault();
    const result = await getContentSearchResources(vault, searchUrl);

    const expected = {
      "@context": "http://iiif.io/api/search/2/context.json",
      behavior: [],
      homepage: [],
      id: "http://localhost:3000/manifest/newspaper/content-search.json",
      items: [
        {
          id: "http://localhost:3000/manifest/newspaper/annotation/584",
          type: "Annotation",
        },
        {
          id: "http://localhost:3000/manifest/newspaper/annotation/920",
          type: "Annotation",
        },
        {
          id: "http://localhost:3000/manifest/newspaper/annotation/2650",
          type: "Annotation",
        },
      ],
      label: {
        none: ["Search Results"],
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
    };
    expect(result).toStrictEqual(expected);
  });

  it("processes content search AnnotationPage if no items", async () => {
    const searchUrl =
      "http://localhost:3000/manifest/content-search/content-search-no-results.json";
    const vault = new Vault();
    const result = await getContentSearchResources(vault, searchUrl);

    const expected = {
      "@context": "http://iiif.io/api/search/2/context.json",
      behavior: [],
      homepage: [],
      id: "http://localhost:3000/manifest/newspaper/content-search-no-results.json",
      items: [],
      label: {
        none: ["Search Results"],
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
    };
    expect(result).toStrictEqual(expected);
  });

  it("returns empty object if content is not search content v2", async () => {
    const searchUrl =
      "http://localhost:3000/manifest/content-search/search-v1.json";
    const vault = new Vault();
    const result = await getContentSearchResources(vault, searchUrl);

    expect(result).toStrictEqual({});
  });
});
