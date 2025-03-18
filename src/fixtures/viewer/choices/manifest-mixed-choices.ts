/**
 * A manifest with composed of one Canvas with Choices, and another Canvas with no Choices.
 */
export const manifestMixedChoices = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json",
  type: "Manifest",
  label: {
    none: ["Darkstar"],
  },
  metadata: [
    {
      label: {
        none: ["Last Modified"],
      },
      value: {
        none: ["2025-03-14T14:26:22.534744Z"],
      },
    },
  ],
  requiredStatement: {
    label: {
      none: ["Attribution"],
    },
    value: {
      none: ["Courtesy of Northwestern University Libraries"],
    },
  },
  thumbnail: [
    {
      id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/thumbnail",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
  seeAlso: [
    {
      id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json",
      type: "Dataset",
      format: "application/json",
      label: {
        none: ["Northwestern University Libraries Digital Collections API"],
      },
    },
  ],
  homepage: [
    {
      id: "http://localhost:3001/items/5d56737a-ce3b-4568-8ece-a6f3398bb16f",
      type: "Text",
      format: "text/html",
      label: {
        none: [
          "Homepage at Northwestern University Libraries Digital Collections",
        ],
      },
    },
  ],
  partOf: [
    {
      id: "http://localhost:3000/collections/3e38c22d-de6e-4827-9097-96d0da968746",
      type: "Collection",
      label: {
        none: ["Sample Collection"],
      },
    },
  ],
  items: [
    {
      id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/0",
      type: "Canvas",
      height: 100,
      width: 100,
      duration: 42.057,
      label: {
        none: ["A"],
      },
      items: [
        {
          id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/0/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/0/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/0",
              body: {
                type: "Choice",
                items: [
                  {
                    id: "https://mat-dev-streaming.s3.amazonaws.com/2d/a4/8a/a6/-2/f6/6-/4f/d2/-a/06/8-/0e/d9/16/5d/dc/d5/2da48aa6-2f66-4fd2-a068-0ed9165ddcd5.m3u8",
                    type: "Sound",
                    format: "application/x-mpegurl",
                    height: 100,
                    width: 100,
                    duration: 42.057,
                    label: {
                      en: ["A"],
                    },
                  },
                  {
                    id: "https://mat-dev-streaming.s3.amazonaws.com/38/6b/9a/d2/-0/de/c-/42/9c/-a/f4/8-/50/81/01/9e/d3/0e/386b9ad2-0dec-429c-af48-5081019ed30e.m3u8",
                    type: "Sound",
                    format: "application/x-mpegurl",
                    height: 100,
                    width: 100,
                    duration: 42.057,
                    label: {
                      en: ["A1"],
                    },
                  },
                  {
                    id: "https://mat-dev-streaming.s3.amazonaws.com/26/56/77/45/-5/e5/1-/4f/02/-b/73/5-/3f/dc/09/d3/a8/d0/26567745-5e51-4f02-b735-3fdc09d3a8d0.m3u8",
                    type: "Sound",
                    format: "application/x-mpegurl",
                    height: 100,
                    width: 100,
                    duration: 400.484,
                    label: {
                      en: ["A2"],
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/1",
      type: "Canvas",
      height: 100,
      width: 100,
      duration: 42.057,
      label: {
        none: ["B"],
      },
      items: [
        {
          id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/1/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/1/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "http://localhost:3000/manifest/manifest-with-choices-and-audio.json/canvas/1",
              body: {
                id: "https://mat-dev-streaming.s3.amazonaws.com/a5/33/4a/d4/-a/09/1-/4c/a6/-b/71/e-/d3/52/ad/7f/d6/70/a5334ad4-a091-4ca6-b71e-d352ad7fd670.m3u8",
                type: "Sound",
                format: "application/x-mpegurl",
                height: 100,
                width: 100,
                duration: 42.057,
                label: {
                  en: ["B"],
                },
              },
            },
          ],
        },
      ],
    },
  ],
  provider: [
    {
      id: "https://www.library.northwestern.edu/",
      type: "Agent",
      label: {
        none: ["Northwestern University Libraries"],
      },
      homepage: [
        {
          id: "https://dc.library.northwestern.edu/",
          type: "Text",
          label: {
            none: [
              "Northwestern University Libraries Digital Collections Homepage",
            ],
          },
          format: "text/html",
          language: ["en"],
        },
      ],
      logo: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/00000000-0000-0000-0000-000000000003/full/pct:50/0/default.webp",
          type: "Image",
          format: "image/webp",
          height: 139,
          width: 1190,
        },
      ],
    },
  ],
  logo: [
    {
      id: "https://iiif.dc.library.northwestern.edu/iiif/2/00000000-0000-0000-0000-000000000003/full/pct:50/0/default.webp",
      type: "Image",
      format: "image/webp",
      height: 139,
      width: 1190,
    },
  ],
};
