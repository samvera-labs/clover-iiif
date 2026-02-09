export const scrollSingleCanvasLanguages = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://example.org/iiif/manifest/language-columns",
  type: "Manifest",
  label: {
    en: ["Language Columns Fixture"],
  },
  items: [
    {
      id: "https://example.org/iiif/manifest/language-columns/canvas/1",
      type: "Canvas",
      height: 1000,
      width: 1000,
      items: [
        {
          id: "https://example.org/iiif/manifest/language-columns/canvas/1/page/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/iiif/manifest/language-columns/canvas/1/page/1/painting",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://example.org/iiif/manifest/language-columns/canvas/1",
              body: {
                id: "https://example.org/iiif/manifest/language-columns/canvas/1/full/full/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 1000,
                width: 1000,
              },
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/english",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/english/1",
              type: "Annotation",
              motivation: "commenting",
              target:
                "https://example.org/iiif/manifest/language-columns/canvas/1#xywh=0,0,500,500",
              body: {
                type: "TextualBody",
                format: "text/html",
                language: "en",
                value: "<p>English annotation one.</p>",
              },
            },
            {
              id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/english/2",
              type: "Annotation",
              motivation: "commenting",
              target:
                "https://example.org/iiif/manifest/language-columns/canvas/1#xywh=0,500,500,500",
              body: {
                type: "TextualBody",
                format: "text/html",
                language: "en",
                value: "<p>English annotation two.</p>",
              },
            },
          ],
        },
        {
          id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/french",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/french/1",
              type: "Annotation",
              motivation: "commenting",
              target:
                "https://example.org/iiif/manifest/language-columns/canvas/1#xywh=500,0,500,500",
              body: {
                type: "TextualBody",
                format: "text/html",
                language: "fr",
                value: "<p>Annotation française un.</p>",
              },
            },
            {
              id: "https://example.org/iiif/manifest/language-columns/canvas/1/annotations/french/2",
              type: "Annotation",
              motivation: "commenting",
              target:
                "https://example.org/iiif/manifest/language-columns/canvas/1#xywh=500,500,500,500",
              body: {
                type: "TextualBody",
                format: "text/html",
                language: "fr",
                value: "<p>Annotation française deux.</p>",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default scrollSingleCanvasLanguages;
