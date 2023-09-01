export const manifest = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif",
  type: "Manifest",
  label: { none: ['Zagna "lunga"'] },
  summary: {
    none: [
      "In early zannesque comedy, all the female characters were comic, grotesque, and played by men. Zagna, the feminine counterpart to Zanni, is the formal, comic-grotesque exaggeration of the woman. The actors wore female clothing over an exaggerated female body, an effect achieved with the addition of excessive, carnivalesque accessories.  The Zagna mask, similar if not identical to the male mask, was worn with a scarf to cover the head.",
    ],
  },
  requiredStatement: {
    label: { none: ["Attribution"] },
    value: {
      none: [
        "Courtesy of Northwestern University Libraries",
        "These images are from material in the collections of the Charles Deering McCormick Library of Special Collections of Northwestern University Libraries, and are provided for use by its students, faculty and staff, and by other researchers visiting this site, for research consultation and scholarly purposes only. Further distribution and/or any commercial use of the images from this site is not permitted.",
      ],
    },
  },
  rights: "http://rightsstatements.org/vocab/InC/1.0/",
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275/thumbnail",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
  seeAlso: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275",
      type: "Dataset",
      format: "application/json",
      label: {
        none: ["Northwestern University Libraries Digital Collections API"],
      },
    },
  ],
  homepage: [
    {
      id: "https://dc.library.northwestern.edu/items/71153379-4283-43be-8b0f-4e7e3bfda275",
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
      id: "https://api.dc.library.northwestern.edu/api/v2/collections/c373ecd2-2c45-45f2-9f9e-52dc244870bd?as=iiif",
      type: "Collection",
      label: { none: ["Commedia dell'Arte: The Masks of Antonio Fava"] },
      summary: {
        none: [
          "The Commedia dell'Arte, the famous improvisational theatre style born in Renaissance Italy, remains a major influence in today's theatre. Antonio Fava is an actor, comedian, author, director, musician, mask maker and Internationally renowned Maestro of Commedia dell'Arte.  The masks in this collection are all stored in the Charles Deering McCormick Library of Special Collections. Fava's book The Comic Mask in the Commedia dell'Arte is published by Northwestern University Press.",
        ],
      },
    },
  ],
  items: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0",
      type: "Canvas",
      height: 5792,
      width: 8688,
      label: { none: ["Front"] },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0",
              body: {
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/600,/0/default.jpg",
                type: "Image",
                format: "image/tiff",
                height: 5792,
                width: 8688,
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7",
                    "@type": "ImageService2",
                    profile: "http://iiif.io/api/image/2/level2.json",
                  },
                ],
              },
            },
          ],
        },
      ],
      placeholderCanvas: {
        id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/placeholder",
        type: "Canvas",
        width: 640,
        height: 426,
        items: [
          {
            id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/placeholder/annotation-page/0",
            type: "AnnotationPage",
            items: [
              {
                id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/placeholder/annotation/0",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7/full/!640,426/0/default.jpg",
                  type: "Image",
                  format: "image/tiff",
                  width: 640,
                  height: 426,
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/44d0ad4d-6a0d-4632-82a3-b6ab8fd4e5b7",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                },
                target:
                  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/0/placeholder",
              },
            ],
          },
        ],
      },
    },
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
      type: "Canvas",
      height: 5792,
      width: 8688,
      label: { none: ["Right"] },
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
              thumbnail: [
                {
                  id: "https://yo.com/full/!300,300/0/default.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  height: 300,
                  width: 300,
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                },
              ],
              body: {
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705/full/600,/0/default.jpg",
                type: "Image",
                format: "image/tiff",
                height: 5792,
                width: 8688,
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705",
                    "@type": "ImageService2",
                    profile: "http://iiif.io/api/image/2/level2.json",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
      type: "Canvas",
      height: 5792,
      width: 8688,
      label: { none: ["Left"] },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
              body: {
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/600,/0/default.jpg",
                type: "Image",
                format: "image/tiff",
                height: 5792,
                width: 8688,
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7",
                    "@type": "ImageService2",
                    profile: "http://iiif.io/api/image/2/level2.json",
                  },
                ],
              },
            },
          ],
        },
      ],
      placeholderCanvas: {
        id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/placeholder",
        type: "Canvas",
        width: 640,
        height: 426,
        items: [
          {
            id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/placeholder/annotation-page/0",
            type: "AnnotationPage",
            items: [
              {
                id: "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/placeholder/annotation/0",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/!640,426/0/default.jpg",
                  type: "Image",
                  format: "image/tiff",
                  width: 640,
                  height: 426,
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                },
                target:
                  "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2/placeholder",
              },
            ],
          },
        ],
      },
    },
  ],
};
