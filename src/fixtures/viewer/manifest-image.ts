export const manifestImage = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  homepage: [
    {
      format: "text/html",
      id: "https://dc.library.northwestern.edu/items/71153379-4283-43be-8b0f-4e7e3bfda275",
      label: {
        none: ["Example manifest for custom display of PDFs"],
      },
      type: "Text",
    },
  ],
  id: "http://localhost:3000/manifest/custom-displays/pdf.json",
  items: [
    // Canvas with standard image without placeholder
    {
      height: 5792,
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/annotation-page",
          items: [
            {
              body: {
                format: "image/tiff",
                height: 5792,
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/600,/0/default.jpg",
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7",
                    "@type": "ImageService2",
                    profile: "http://iiif.io/api/image/2/level2.json",
                  },
                ],
                type: "Image",
                width: 8688,
              },
              id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/annotation/0",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
              type: "Annotation",
            },
          ],
          type: "AnnotationPage",
        },
      ],
      label: {
        none: ["Left"],
      },
      thumbnail: [
        {
          format: "image/jpeg",
          height: 300,
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/!300,300/0/default.jpg",
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
          type: "Image",
          width: 300,
        },
      ],
      type: "Canvas",
      width: 8688,
    },
  ],
  label: {
    none: ['Zagna "lunga"'],
  },
  metadata: [
    {
      label: {
        none: ["Alternate Title"],
      },
      value: {
        none: ["Fava"],
      },
    },
    {
      label: {
        none: ["Creator"],
      },
      value: {
        none: ["Fava, Antonio, 1949-"],
      },
    },
    {
      label: {
        none: ["Date"],
      },
      value: {
        none: ["2012"],
      },
    },
    {
      label: {
        none: ["Department"],
      },
      value: {
        none: ["Charles Deering McCormick Library of Special Collections"],
      },
    },
  ],
  partOf: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif",
      label: {
        none: ["Commedia dell'Arte: The Masks of Antonio Fava"],
      },
      summary: {
        none: [
          "The Commedia dell'Arte, the famous improvisational theatre style born in Renaissance Italy, remains a major influence in today's theatre. Antonio Fava is an actor, comedian, author, director, musician, mask maker and Internationally renowned Maestro of Commedia dell'Arte.  The masks in this collection are all stored in the Charles Deering McCormick Library of Special Collections. Fava's book The Comic Mask in the Commedia dell'Arte is published by Northwestern University Press.",
        ],
      },
      type: "Collection",
    },
  ],
  provider: [
    {
      homepage: [
        {
          format: "text/html",
          id: "https://dc.library.northwestern.edu/",
          label: {
            none: [
              "Northwestern University Libraries Digital Collections Homepage",
            ],
          },
          language: ["en"],
          type: "Text",
        },
      ],
      id: "https://www.library.northwestern.edu/",
      label: {
        none: ["Northwestern University Libraries"],
      },
      logo: [
        {
          format: "image/webp",
          height: 139,
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/00000000-0000-0000-0000-000000000003/full/pct:50/0/default.webp",
          type: "Image",
          width: 1190,
        },
      ],
      type: "Agent",
    },
  ],
  requiredStatement: {
    label: {
      none: ["Attribution"],
    },
    value: {
      none: [
        "Courtesy of Northwestern University Libraries",
        "These images are from material in the collections of the Charles Deering McCormick Library of Special Collections of Northwestern University Libraries, and are provided for use by its students, faculty and staff, and by other researchers visiting this site, for research consultation and scholarly purposes only. Further distribution and/or any commercial use of the images from this site is not permitted.",
      ],
    },
  },
  rights: "http://rightsstatements.org/vocab/InC/1.0/",
  seeAlso: [
    {
      format: "application/json",
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275",
      label: {
        none: ["Northwestern University Libraries Digital Collections API"],
      },
      type: "Dataset",
    },
  ],
  summary: {
    none: [
      "In early zannesque comedy, all the female characters were comic, grotesque, and played by men. Zagna, the feminine counterpart to Zanni, is the formal, comic-grotesque exaggeration of the woman. The actors wore female clothing over an exaggerated female body, an effect achieved with the addition of excessive, carnivalesque accessories.  The Zagna mask, similar if not identical to the male mask, was worn with a scarf to cover the head.",
    ],
  },
  thumbnail: [
    {
      format: "image/jpeg",
      height: 300,
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275/thumbnail",
      type: "Image",
      width: 300,
    },
  ],
  type: "Manifest",
};
