export const manifestVideo = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif",
  type: "Manifest",
  label: {
    none: [
      'Iimura, Taka: A visit by Taka Iimura to John Cage who reads "5th writing through Finnegans Wake" by John Cage',
    ],
  },
  metadata: [
    {
      label: { none: ["Subject"] },
      value: { none: ["Cage, John", "Composers"] },
    },
  ],
  summary: { none: ["with note from Iimura"] },
  requiredStatement: {
    label: { none: ["Attribution"] },
    value: {
      none: [
        "Courtesy of Northwestern University Libraries",
        "The audio recordings on this web site are from material in the collections of the Music Library of Northwestern University Libraries, are provided for use by its students, faculty and staff, and by other researchers visiting this site, for research consultation and scholarly purposes only. Further distribution and/or any commercial use of the audio recordings from this site is not permitted.",
      ],
    },
  },
  rights: "http://rightsstatements.org/vocab/InC/1.0/",
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f/thumbnail",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
  seeAlso: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f",
      type: "Dataset",
      format: "application/json",
      label: {
        none: ["Northwestern University Libraries Digital Collections API"],
      },
    },
  ],
  homepage: [
    {
      id: "https://dc.library.northwestern.edu/items/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f",
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
      id: "https://api.dc.library.northwestern.edu/api/v2/collections/1177a757-1422-4a46-9ca9-c54521f0f3a5?as=iiif",
      type: "Collection",
      label: { none: ["John Cage Ephemera"] },
      summary: {
        none: [
          "The John Cage Ephemera Collection is wide-ranging in scope, including correspondence, photographs, writings, programs, scores, books, artworks, artifacts, and audio and audiovisual recordings. The Ephemera Collection was originally housed in 6 metal filing cabinets with little original order. A few items obtained from other sources have been added to this collection in later years, and are documented in the Immediate Source of Acquisitions note.",
        ],
      },
    },
  ],
  items: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0",
      type: "Canvas",
      height: 480,
      width: 720,
      duration: 1377.01,
      label: { none: ["tape 1 of 1"] },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/posters/0224dcfc-d356-45a6-b810-944e696f0297/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/posters/0224dcfc-d356-45a6-b810-944e696f0297",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0",
              body: {
                id: "https://meadow-streaming.rdc.library.northwestern.edu/02/24/dc/fc/-d/35/6-/45/a6/-b/81/0-/94/4e/69/6f/02/97/0224dcfc-d356-45a6-b810-944e696f0297.m3u8",
                type: "Video",
                format: "application/x-mpegurl",
                height: 480,
                width: 720,
                duration: 1377.01,
              },
            },
          ],
        },
      ],
    },
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0",
      type: "Canvas",
      height: 4310,
      width: 4335,
      duration: 1,
      label: { none: ["Letter to John Cage from Taka Iimura"] },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0",
              body: {
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c/full/600,/0/default.jpg",
                type: "Image",
                format: "image/tiff",
                height: 4310,
                width: 4335,
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c",
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
        id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/placeholder",
        type: "Canvas",
        width: 640,
        height: 636,
        items: [
          {
            id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/placeholder/annotation-page/0",
            type: "AnnotationPage",
            items: [
              {
                id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/placeholder/annotation/0",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c/full/!640,636/0/default.jpg",
                  type: "Image",
                  format: "image/tiff",
                  width: 640,
                  height: 636,
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/3ad9fa72-184d-407a-a44b-95a017c9071c",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                },
                target:
                  "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/0/placeholder",
              },
            ],
          },
        ],
      },
    },
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1",
      type: "Canvas",
      height: 4306,
      width: 4311,
      duration: 1,
      label: { none: ["Letter to John Cage from Taka Iimura"] },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/annotation-page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/annotation/0",
              type: "Annotation",
              motivation: "painting",
              target:
                "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1",
              body: {
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764/full/600,/0/default.jpg",
                type: "Image",
                format: "image/tiff",
                height: 4306,
                width: 4311,
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764",
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
        id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/placeholder",
        type: "Canvas",
        width: 640,
        height: 639,
        items: [
          {
            id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/placeholder/annotation-page/0",
            type: "AnnotationPage",
            items: [
              {
                id: "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/placeholder/annotation/0",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764/full/!640,639/0/default.jpg",
                  type: "Image",
                  format: "image/tiff",
                  width: 640,
                  height: 639,
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/07cd2af3-27e7-4829-9c3a-3c5c03f6c764",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                },
                target:
                  "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/auxiliary/1/placeholder",
              },
            ],
          },
        ],
      },
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
  provider: [
    {
      id: "https://www.library.northwestern.edu/",
      type: "Agent",
      label: { none: ["Northwestern University Libraries"] },
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
};
