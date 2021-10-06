export const sampleCanvasEntityA = {
  canvas: {
    id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0",
    type: "Canvas",
    label: {
      en: ["Video canvas, streaming (.m3u8), with supplementing webVTT"],
    },
    behavior: [],
    motivation: null,
    thumbnail: [
      {
        id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/bca5b88d-7433-4710-96db-e38f1a24e9ae/full/!300,300/0/default.jpg",
        type: "ContentResource",
      },
    ],
    posterCanvas: null,
    accompanyingCanvas: null,
    placeholderCanvas: null,
    summary: null,
    requiredStatement: null,
    metadata: [],
    rights: null,
    navDate: null,
    provider: [],
    items: [
      {
        id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0/annotation_page/4",
        type: "AnnotationPage",
      },
    ],
    annotations: [],
    seeAlso: [],
    homepage: null,
    logo: [],
    partOf: [],
    rendering: [],
    service: [],
    duration: 500,
    height: 480,
    width: 720,
  },
  annotationPage: {
    id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0/annotation_page/4",
    type: "AnnotationPage",
    behavior: [],
    motivation: null,
    label: null,
    thumbnail: [],
    summary: null,
    requiredStatement: null,
    metadata: [],
    rights: null,
    provider: [],
    items: [
      {
        id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0/annotation_page/1/annotation/1",
        type: "Annotation",
      },
      {
        id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0/page/annotation_page/1/annotation/2",
        type: "Annotation",
      },
    ],
    seeAlso: [],
    homepage: null,
    logo: [],
    rendering: [],
    service: [],
  },
  annotations: [
    {
      id: "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0/annotation_page/1/annotation/1",
      type: "Annotation",
      motivation: ["painting"],
      target:
        "https://raw.githubusercontent.com/mathewjordan/mirador-playground/main/assets/iiif/manifest/assortedCanvases/canvas/0",
      body: [
        {
          id: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
          type: "Video",
          format: "video/mp4",
          height: 720,
          width: 480,
          duration: 500,
        },
      ],
    },
  ],
};
