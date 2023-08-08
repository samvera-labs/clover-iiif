export const manifestNoAnnotations = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif",
  type: "Manifest",
  label: {
    none: ["Northwestern basketball team photo with Jim Pitts"],
  },
  items: [
    {
      id: "https://api.dc.library.northwestern.edu/api/v2/works/57446da0-dc8b-4be6-998d-efb67c71f654?as=iiif/canvas/access/0",
      type: "Canvas",
      height: 5174,
      width: 6289,
      label: {
        none: ["p. 1 recto"],
      },
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

export const vttManifest = {
  id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json",
  items: [
    {
      annotations: [
        {
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/annotation_page/a1",
          items: [
            {
              body: {
                format: "text/vtt",
                id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/vtt/ca/6a/62/1f/-d/3d/d-/43/b2/-8/ae/d-/40/fd/fd/a4/c0/24/ca6a621f-d3dd-43b2-8aed-40fdfda4c024.vtt",
                label: {
                  en: ["Chapters"],
                },
                language: "en",
                type: "Text",
              },
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/annotation_page/1/annotation/2",
              motivation: "supplementing",
              target:
                "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
              type: "Annotation",
            },
          ],
          type: "AnnotationPage",
        },
      ],
      duration: 30.0,
      height: 480,
      id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
      items: [
        {
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/annotation_page/1",
          items: [
            {
              body: {
                duration: 30.0,
                format: "video/quicktime",
                height: 1080,
                id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/ca/6a/62/1f/-d/3d/d-/43/b2/-8/ae/d-/40/fd/fd/a4/c0/24/ca6a621f-d3dd-43b2-8aed-40fdfda4c024.m3u8",
                type: "Video",
                width: 1920,
              },
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/annotation_page/1/annotation/1",
              motivation: "painting",
              target:
                "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
              type: "Annotation",
            },
          ],
          type: "AnnotationPage",
        },
      ],
      label: {
        en: ["access mov"],
      },
      thumbnail: [
        {
          format: "image/jpeg",
          height: 300,
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/ca6a621f-d3dd-43b2-8aed-40fdfda4c024/full/!300,300/0/default.jpg",
          service: [
            {
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/ca6a621f-d3dd-43b2-8aed-40fdfda4c024",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          type: "Image",
          width: 300,
        },
      ],
      type: "Canvas",
      width: 640,
    },
    {
      duration: 30.0,
      height: 480,
      id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e",
      items: [
        {
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e/annotation_page/1",
          items: [
            {
              body: {
                duration: 30.0,
                format: "video/mp4",
                height: 1080,
                id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/64/73/c8/1b/-5/ae/2-/46/1f/-b/25/e-/5e/d1/c4/bf/ec/3e/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e.m3u8",
                type: "Video",
                width: 1920,
              },
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e/annotation_page/1/annotation/1",
              motivation: "painting",
              target:
                "https://iiif.stack.rdc-staging.library.northwestern.edu/public/iiif3/9d/67/f8/c5/-1/a2/e-/4f/bd/-8/47/1-/4a/1a/fa/7d/6e/5a-manifest.json/canvas/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e",
              type: "Annotation",
            },
          ],
          type: "AnnotationPage",
        },
      ],
      label: {
        en: ["access mp4"],
      },
      thumbnail: [
        {
          format: "image/jpeg",
          height: 300,
          id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e/full/!300,300/0/default.jpg",
          service: [
            {
              id: "https://iiif.stack.rdc-staging.library.northwestern.edu/iiif/2/posters/6473c81b-5ae2-461f-b25e-5ed1c4bfec3e",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          type: "Image",
          width: 300,
        },
      ],
      type: "Canvas",
      width: 640,
    },
  ],
  label: {
    en: ["Canary Record TEST 2"],
  },
  metadata: [
    {
      label: {
        en: ["LastModified"],
      },
      value: {
        en: ["2023-08-21T22:15:00.755302Z"],
      },
    },
  ],
  requiredStatement: {
    label: {
      en: ["Attribution"],
    },
    value: {
      en: ["Courtesy of Northwestern University Libraries"],
    },
  },
  rights: "http://rightsstatements.org/vocab/InC/1.0/",
  summary: {
    en: [
      "This is a private record for RepoDev testing on production",
      "This is a new description",
      "Adding a test description",
    ],
  },
  type: "Manifest",
  "@context": "http://iiif.io/api/presentation/3/context.json",
};
