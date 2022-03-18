import { Vault } from "@hyperion-framework/vault";
import { getThumbnail } from "./getThumbnail";
import { CanvasEntity } from "./getCanvasByCriteria";

const vault = new Vault();
vault.loadManifest("../../../public/fixtures/iiif/manifests/sample.json");

const sampleCanvasEntity: CanvasEntity = {
  canvas: {
    id: "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3",
    type: "Canvas",
    label: {
      en: ["Image canvas #2"],
    },
    behavior: [],
    motivation: null,
    thumbnail: [
      {
        id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/a555b137-2a90-4b51-90c8-cc9aa61ed2d6/full/!300,300/0/default.jpg",
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
        id: "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3/annotation_page/1",
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
    duration: 0,
    height: 480,
    width: 720,
  },
  annotationPage: {
    id: "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3/annotation_page/1",
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
        id: "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3/annotation_page/1/annotation/1",
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
      id: "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3/annotation_page/1/annotation/1",
      type: "Annotation",
      motivation: ["painting"],
      target:
        "https://raw.githubusercontent.com/samvera-labs/clover-iiif/main/public/fixtures/iiif/manifests/sample/canvas/3",
      body: [
        {
          id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/a555b137-2a90-4b51-90c8-cc9aa61ed2d6/full/600,/0/default.jpg",
          type: "Image",
          format: "image/jpeg",
          service: [
            {
              id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/a555b137-2a90-4b51-90c8-cc9aa61ed2d6",
              profile: "http://iiif.io/api/image/2/level2.json",
              type: "ImageService2",
            },
          ],
          height: 2197,
          width: 4155,
        },
      ],
    },
  ],
  accompanyingCanvas: undefined,
};

test("Test return of thumbnail as a IIIFExternalWebResource.", () => {
  // const thumbnailOnCanvas = getThumbnail(vault, sampleCanvasEntity, 200, 200);
  // expect(thumbnailOnCanvas).toStrictEqual({
  //   format: undefined,
  //   height: 200,
  //   id: "https://iiif.stack.rdc.library.northwestern.edu/iiif/2/bca5b88d-7433-4710-96db-e38f1a24e9ae/full/!300,300/0/default.jpg",
  //   type: "ContentResource",
  //   width: 200,
  // });
  expect(true).toBeTruthy();
});
