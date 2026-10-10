/**
 * Content Search answers, after the examples in the IIIF Content Search specifications
 * (1.0 §3.3 and §3.4, 2.0 §3.3 and §3.4), for a Manifest of two Canvases.
 */

export const MANIFEST = "https://example.org/book/manifest";
export const CANVAS = (n: number) => `https://example.org/book/canvas/${n}`;
export const SEARCH_V2 = "https://example.org/book/search2";
export const SEARCH_V1 = "https://example.org/book/search1";

export const manifest = (service: Record<string, unknown>[]) => ({
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: MANIFEST,
  type: "Manifest",
  label: { en: ["A book"] },
  service,
  items: [1, 2].map((n) => ({
    id: CANVAS(n),
    type: "Canvas",
    label: { en: [`Page ${n}`] },
    width: 1000,
    height: 1500,
    items: [],
  })),
});

/** Version 2, two pages: `bird` on page 1 twice, and page 2 once. */
export const v2Pages = {
  [`${SEARCH_V2}?q=bird`]: {
    "@context": "http://iiif.io/api/search/2/context.json",
    id: `${SEARCH_V2}?q=bird`,
    type: "AnnotationPage",
    next: { id: `${SEARCH_V2}?q=bird&page=2`, type: "AnnotationPage" },
    items: [
      {
        id: "https://example.org/hit/1",
        type: "Annotation",
        motivation: "highlighting",
        target: `${CANVAS(1)}#xywh=100,100,250,20`,
      },
      {
        id: "https://example.org/hit/2",
        type: "Annotation",
        motivation: "highlighting",
        target: {
          type: "SpecificResource",
          source: { id: CANVAS(1), type: "Canvas" },
          selector: { type: "FragmentSelector", value: "xywh=100,400,250,20" },
        },
      },
    ],
    annotations: [
      {
        type: "AnnotationPage",
        items: [
          {
            id: "https://example.org/context/1",
            type: "Annotation",
            motivation: "contextualizing",
            target: [
              {
                type: "SpecificResource",
                source: "https://example.org/hit/1",
                selector: [
                  {
                    type: "TextQuoteSelector",
                    prefix: "There are two ",
                    exact: "birds",
                    suffix: " in the bush",
                  },
                ],
              },
              {
                type: "SpecificResource",
                source: "https://example.org/hit/2",
                selector: [
                  {
                    type: "TextQuoteSelector",
                    prefix: "one ",
                    exact: "bird",
                    suffix: " in the hand",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  [`${SEARCH_V2}?q=bird&page=2`]: {
    "@context": "http://iiif.io/api/search/2/context.json",
    id: `${SEARCH_V2}?q=bird&page=2`,
    type: "AnnotationPage",
    items: [
      {
        id: "https://example.org/hit/3",
        type: "Annotation",
        motivation: "highlighting",
        body: { type: "TextualBody", value: "Birdsong" },
        target: `${CANVAS(2)}#xywh=10,10,200,20`,
      },
    ],
  },
};

/** Version 1: one hit spanning two annotations on page 2. */
export const v1Page = {
  [`${SEARCH_V1}?q=bird`]: {
    "@context": [
      "http://iiif.io/api/presentation/2/context.json",
      "http://iiif.io/api/search/1/context.json",
    ],
    "@id": `${SEARCH_V1}?q=bird`,
    "@type": "sc:AnnotationList",
    resources: [
      {
        "@id": "https://example.org/v1/anno/1",
        "@type": "oa:Annotation",
        motivation: "sc:painting",
        resource: { "@type": "cnt:ContentAsText", chars: "blue" },
        on: `${CANVAS(2)}#xywh=100,100,40,20`,
      },
      {
        "@id": "https://example.org/v1/anno/2",
        "@type": "oa:Annotation",
        motivation: "sc:painting",
        resource: { "@type": "cnt:ContentAsText", chars: "bird" },
        on: {
          "@type": "oa:SpecificResource",
          full: CANVAS(2),
          selector: {
            "@type": "oa:FragmentSelector",
            value: "xywh=150,100,40,20",
          },
        },
      },
    ],
    hits: [
      {
        "@type": "search:Hit",
        annotations: [
          "https://example.org/v1/anno/1",
          "https://example.org/v1/anno/2",
        ],
        match: "blue bird",
        before: "a ",
        after: " sang",
      },
    ],
  },
};
