import { Manifest } from "@iiif/presentation-3";

export const multipleHighlighting: Manifest = {
  "@context": ["http://iiif.io/api/presentation/3/context.json"],
  id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1.json",
  type: "Manifest",
  label: {
    de: ["1. Berliner Tageblatt - 1925-02-16"],
  },
  thumbnail: [
    {
      id: "https://api.europeana.eu/api/v2/thumbnail-by-url.json?uri=https%3A%2F%2Fiiif.europeana.eu%2Fimage%2F2YMIN6YXMQ6COVM5AO2XKB5KMCKPMT2YKEKNMAGHVRBIHOOY4AVA%2Fpresentation_images%2F9340afd0-ffe2-11e5-b68d-fa163e60dd72%2Fnode-2%2Fimage%2FSBB%2FBerliner_Tageblatt%2F1925%2F02%2F16%2F0%2FF_SBB_00001_19250216_054_079_0_001%2Ffull%2Ffull%2F0%2Fdefault.jpg&type=TEXT",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
  partOf: [
    {
      id: "http://localhost:3000/manifest/newspaper/newspaper_collection.json",
      type: "Collection",
      label: {
        de: ["Berliner Tageblatt"],
      },
    },
  ],
  items: [
    {
      id: "http://localhost:3000/manifest/newspaper/canvas/i1p1",
      type: "Canvas",
      height: 5000,
      width: 3602,
      label: {
        none: ["p. 1"],
      },
      items: [
        {
          id: "http://localhost:3000/manifest/newspaper/annotation_page_painting/ap1",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/annotation/p1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1",
                    type: "ImageService3",
                    profile: "level1",
                  },
                ],
              },
              target: "http://localhost:3000/manifest/newspaper/canvas/i1p1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-1",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=839,3259,118,27",
            },
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-2",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=161,459,1063,329",
            },
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-3",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=1942,1579,106,23",
            },
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-4",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "„Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=1608,4429,123,25",
            },
          ],
        },
      ],
    },
    {
      id: "http://localhost:3000/manifest/newspaper/canvas/i1p2",
      type: "Canvas",
      height: 4999,
      width: 3536,
      label: {
        none: ["p. 2"],
      },
      items: [
        {
          id: "http://localhost:3000/manifest/newspaper/annotation_page_painting/ap2",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/annotation/p2",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p2/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p2",
                    type: "ImageService3",
                    profile: "level1",
                  },
                ],
              },
              target: "http://localhost:3000/manifest/newspaper/canvas/i1p2",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json-1",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "„Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p2#xywh=1996,3996,122,26",
            },
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json-2",
              type: "Annotation",
              label: {
                en: ["Search results"],
              },
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p2#xywh=2468,4313,106,26",
            },
          ],
        },
      ],
    },
  ],
};

export const simpleAnnotations = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1",
      type: "Canvas",
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-1/anno-1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2/anno-1",
              type: "Annotation",
              motivation: "commenting",
              body: {
                type: "TextualBody",
                language: "de",
                format: "text/plain",
                value: "Göttinger Marktplatz mit Gänseliesel Brunnen",
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1",
            },
          ],
        },
      ],
    },
  ],
};

export const simpleTagging = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0021-tagging/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
      type: "Canvas",
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0021-tagging/page/p1/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0021-tagging/annotation/p0001-image",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0021-tagging/page/p2/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0021-tagging/annotation/p0002-tag",
              type: "Annotation",
              motivation: "tagging",
              body: {
                type: "TextualBody",
                value: "Gänseliesel-Brunnen",
                language: "de",
                format: "text/plain",
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1#xywh=265,661,1260,1239",
            },
          ],
        },
      ],
    },
  ],
};

export const nonRectangularPolygon = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
      type: "Canvas",
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/page/p1/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/annotation/p0001-image",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/page/p2/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/annotation/p0002-svg",
              type: "Annotation",
              motivation: "tagging",
              body: {
                type: "TextualBody",
                value: "Gänseliesel-Brunnen",
                language: "de",
                format: "text/plain",
              },
              target: {
                type: "SpecificResource",
                source:
                  "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
                selector: {
                  type: "SvgSelector",
                  value:
                    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><path d='M270.000000,1900.000000 L1530.000000,1900.000000 L1530.000000,1610.000000 L1315.000000,1300.000000 L1200.000000,986.000000 L904.000000,661.000000 L600.000000,986.000000 L500.000000,1300.000000 L270,1630 L270.000000,1900.000000' /></g></svg>",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

export const imagesAnnotations = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1",
      type: "Canvas",
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-1/anno-1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-2",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1/annopage-2/anno-1",
              type: "Annotation",
              motivation: "commenting",
              body: [
                {
                  id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-fountain/full/300,/0/default.jpg",
                  type: "Image",
                  format: "image/jpeg",
                },
                {
                  type: "TextualBody",
                  language: "en",
                  value:
                    "Night picture of the Gänseliesel fountain in Göttingen taken during the 2019 IIIF Conference",
                },
              ],
              target:
                "https://iiif.io/api/cookbook/recipe/0377-image-in-annotation/canvas-1#xywh=138,550,1477,1710",
            },
          ],
        },
      ],
    },
  ],
};

// IIIF Cookbook recipe: https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json
export const recipe0219captionFile = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/manifest.json",
  type: "Manifest",
  label: {
    en: ["Lunchroom Manners"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas",
      type: "Canvas",
      height: 360,
      width: 480,
      duration: 572.034,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page/annotation1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4",
                type: "Video",
                height: 360,
                width: 480,
                duration: 572.034,
                format: "video/mp4",
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page2",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas/page2/a1",
              type: "Annotation",
              motivation: "supplementing",
              body: {
                id: "https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt",
                type: "Text",
                format: "text/vtt",
                label: {
                  en: ["Captions in WebVTT format"],
                },
                language: "en",
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/canvas",
            },
          ],
        },
      ],
    },
  ],
};

export const referencedAnnotations = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/manifest.json",
  type: "Manifest",
  label: {
    en: ["Picture of Göttingen taken during the 2019 IIIF Conference"],
  },
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/canvas-1",
      type: "Canvas",
      height: 3024,
      width: 4032,
      items: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/canvas-1/annopage-1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/canvas-1/annopage-1/anno-1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                height: 3024,
                width: 4032,
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                    profile: "level1",
                    type: "ImageService3",
                  },
                ],
              },
              target:
                "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/canvas-1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/annotationpage.json",
          type: "AnnotationPage",
        },
      ],
    },
  ],
};

export const multiplePages = {
  "@context": ["http://iiif.io/api/presentation/3/context.json"],
  id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1.json",
  type: "Manifest",
  label: {
    de: ["1. Berliner Tageblatt - 1925-02-16"],
  },
  items: [
    {
      id: "http://localhost:3000/manifest/newspaper/canvas/i1p1",
      type: "Canvas",
      height: 5000,
      width: 3602,
      label: {
        none: ["p. 1"],
      },
      items: [
        {
          id: "http://localhost:3000/manifest/newspaper/annotation_page_painting/ap1",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/annotation/p1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1/full/max/0/default.jpg",
                type: "Image",
                format: "image/jpeg",
                service: [
                  {
                    id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1",
                    type: "ImageService3",
                    profile: "level1",
                  },
                ],
              },
              target: "http://localhost:3000/manifest/newspaper/canvas/i1p1",
            },
          ],
        },
      ],
      annotations: [
        {
          id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p10.json",
          type: "AnnotationPage",
          label: {
            en: ["Search results"],
          },
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p1.json-1",
              type: "Annotation",
              motivation: "highlighting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p1#xywh=839,3259,118,27",
            },
          ],
        },
        {
          id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json",
          type: "AnnotationPage",
          label: {
            en: ["Clippings"],
          },
          items: [
            {
              id: "http://localhost:3000/manifest/newspaper/newspaper_issue_1-anno_p2.json-2",
              type: "Annotation",
              motivation: "commenting",
              body: {
                type: "TextualBody",
                format: "text/plain",
                language: "de",
                value: "Berliner",
              },
              target:
                "http://localhost:3000/manifest/newspaper/canvas/i1p2#xywh=161,459,1063,329",
            },
          ],
        },
      ],
    },
  ],
};
