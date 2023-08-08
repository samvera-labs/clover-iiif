export const manifest = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  homepage: [
    {
      format: "text/html",
      id: "https://dc.library.northwestern.edu/items/ad25d4af-8a12-4d8f-a557-79aea012e081",
      label: {
        none: [
          "Homepage at Northwestern University Libraries Digital Collections",
        ],
      },
      type: "Text",
    },
  ],
  id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif",
  items: [
    {
      height: 2580,
      id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0",
      items: [
        {
          "@context": "http://iiif.io/api/presentation/3/context.json",
          id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/annotation-page",
          items: [
            {
              body: {
                format: "image/tiff",
                height: 2580,
                id: "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c/full/600,/0/default.jpg",
                service: [
                  {
                    "@id":
                      "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c",
                    "@type": "ImageService2",
                    profile: "http://iiif.io/api/image/2/level2.json",
                  },
                ],
                type: "Image",
                width: 3072,
              },
              id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/annotation/0",
              motivation: "painting",
              target:
                "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0",
              type: "Annotation",
            },
          ],
          type: "AnnotationPage",
        },
      ],
      label: {
        none: ["vol_ct07053u.tif"],
      },
      placeholderCanvas: {
        height: 537,
        id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder",
        items: [
          {
            id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder/annotation-page/0",
            items: [
              {
                body: {
                  format: "image/tiff",
                  height: 537,
                  id: "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c/full/!640,537/0/default.jpg",
                  service: [
                    {
                      "@id":
                        "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level2.json",
                    },
                  ],
                  type: "Image",
                  width: 640,
                },
                id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder/annotation/0",
                motivation: "painting",
                target:
                  "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder",
                type: "Annotation",
              },
            ],
            type: "AnnotationPage",
          },
        ],
        type: "Canvas",
        width: 640,
      },
      thumbnail: [
        {
          format: "image/jpeg",
          height: 300,
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c/full/!300,300/0/default.jpg",
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/4eb5a0d0-1908-42a8-a5f2-1ce88e25928c",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
          type: "Image",
          width: 300,
        },
      ],
      type: "Canvas",
      width: 3072,
    },
  ],
  label: {
    none: ["On the Pend d'Oreille - Kalispel"],
  },
  requiredStatement: {
    label: {
      none: ["Attribution"],
    },
    value: {
      none: [
        "Courtesy of Northwestern University Libraries",
        "The images on this web site are from material in the collections of the Charles Deering McCormick Library of Special Collections of Northwestern University Libraries, are provided for use by its students, faculty and staff, and by other researchers visiting this site, for research consultation and scholarly purposes only. Further distribution and/or any commercial use of the images from this site is not permitted.",
      ],
    },
  },
  rights: "http://rightsstatements.org/vocab/NoC-US/1.0/",
  summary: {
    none: [
      "written, illustrated, and published by Edward S. Curtis ; edited by Frederick Webb Hodge ; foreword by Theodore Roosevelt ; field research conducted under the patronage of J. Pierpont Morgan. ; Original photogravures produced in Boston by John Andrew & Son from 1900-1910.",
    ],
  },
  thumbnail: [
    {
      format: "image/jpeg",
      height: 300,
      id: "https://test.org/works/ad25d4af-8a12-4d8f-a557-79aea012e081/thumbnail",
      type: "Image",
      width: 300,
    },
  ],
  type: "Manifest",
};

export const manifestNoAnnotations = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif",
  type: "Manifest",
  label: {
    none: ["Northwestern basketball team photo with Jim Pitts"],
  },
  metadata: [],
  requiredStatement: {
    label: {
      none: ["Attribution"],
    },
    value: {
      none: [
        "Courtesy of Northwestern University Libraries",
        "The works on this web site, from material in the collections of the University Archives of Northwestern University Libraries, are provided for use by its students, faculty and staff, and by other researchers visiting this site, for research consultation and scholarly purposes only. Further distribution and/or any commercial use of the images from this site is not permitted.",
      ],
    },
  },
  rights: "http://rightsstatements.org/vocab/UND/1.0/",
  thumbnail: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654/thumbnail",
      type: "Image",
      format: "image/jpeg",
      height: 300,
      width: 300,
    },
  ],
  seeAlso: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654",
      type: "Dataset",
      format: "application/json",
      label: {
        none: ["Northwestern University Libraries Digital Collections API"],
      },
    },
  ],
  homepage: [
    {
      id: "https://dc.library.northwestern.edu/items/57446da0-dc8b-4be6-998d-efb67c71f654",
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
      id: "https://api.dc.library.northwestern.edu/api/v2/collections/a6928382-a284-49d4-ae2c-dc7e805ecaa5?as=iiif",
      type: "Collection",
      label: {
        none: ["James P. Pitts (1944- ) Papers, (1961-2013) "],
      },
      summary: {
        none: [
          "The Jim P. Pitts papers are comprised of five boxes and span the years 1961-2013. The collection is arranged in six series: Clippings and Press Releases, Athletics, Career, the Paul Lynde Incident, Correspondences and Publications.",
        ],
      },
    },
  ],
  items: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
      type: "Canvas",
      height: 5174,
      width: 6289,
      label: {
        none: ["p. 1 recto"],
      },
      thumbnail: [
        {
          id: "https://iiif.dc.library.northwestern.edu/iiif/2/5117a395-3376-4f1d-bf59-a6c1f15891c3/full/!300,300/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          height: 300,
          width: 300,
          service: [
            {
              "@id":
                "https://iiif.dc.library.northwestern.edu/iiif/2/5117a395-3376-4f1d-bf59-a6c1f15891c3",
              "@type": "ImageService2",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
        },
      ],
      items: [
        {
          id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0/annotation-page",
          type: "AnnotationPage",
          items: [],
        },
      ],
      placeholderCanvas: {
        id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0/placeholder",
        type: "Canvas",
        width: 640,
        height: 526,
        items: [
          {
            id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0/placeholder/annotation-page/0",
            type: "AnnotationPage",
            items: [],
          },
        ],
      },
    },
  ],
};
