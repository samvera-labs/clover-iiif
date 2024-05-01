import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const base_url = `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;
  const url = `${base_url}${req.url}`;

  res.status(200).json(makeManifest(base_url, url));
}

function makeManifest(base_url: string, url: string) {
  return {
    "@context": ["http://iiif.io/api/presentation/3/context.json"],
    id: url,
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
    items: [
      {
        id: `${base_url}/api/fixtures/newpaper/canvas/i1p1`,
        type: "Canvas",
        height: 5000,
        width: 3602,
        label: {
          none: ["p. 1"],
        },
        items: [
          {
            id: `${base_url}/api/fixtures/newpaper/items/AnnotationPage/i1p1`,
            type: "AnnotationPage",
            items: [
              {
                id: `${base_url}/api/fixtures/newpaper/items/Annotation/i1p1a1`,
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
                target: `${base_url}/api/fixtures/newpaper/canvas/i1p1`,
              },
            ],
          },
        ],
        annotations: [
          {
            id: `${base_url}/api/fixtures/newpaper/annotations/AnnotationPage/i1p1ap1`,
            type: "AnnotationPage",
            items: [
              {
                id: `${base_url}/api/fixtures/newpaper/annotations/Annotation/i1p1ap1a1`,
                type: "Annotation",
                motivation: "commenting",
                body: {
                  type: "TextualBody",
                  format: "text/plain",
                  language: "en",
                  value: "This is issue 1, page 1",
                },
                target: `${base_url}/api/fixtures/newpaper/canvas/i1p1#xywh=1300,400,200,400`,
              },
            ],
          },
        ],
      },
      {
        id: `${base_url}/api/fixtures/newpaper/canvas/i1p2`,
        type: "Canvas",
        height: 4999,
        width: 3536,
        label: {
          none: ["p. 2"],
        },
        items: [
          {
            id: `${base_url}/api/fixtures/newpaper/items/AnnotationPage/i1p2`,
            type: "AnnotationPage",
            items: [
              {
                id: `${base_url}/api/fixtures/newpaper/items/Annotation/i1p2`,
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
                target: `${base_url}/api/fixtures/newpaper/canvas/i1p2`,
              },
            ],
          },
        ],
      },
    ],
    service: [
      {
        id: `${base_url}/api/fixtures/content-search/1`,
        type: "SearchService2",
      },
    ],
  };
}
