import { Canvas, ExternalResourceTypes } from "@iiif/presentation-3";
import {
  accompanyingCanvasManifest,
  canvas1,
  invalidAnnotationCanvas,
} from "../../fixtures/use-iiif/get-canvas-by-criteria";

import { Vault } from "@iiif/vault";
import { getCanvasByCriteria } from "./getCanvasByCriteria";

type FnArguments = {
  item: Canvas;
  motivation: string;
  paintingType: Array<ExternalResourceTypes>;
};

const fnArguments: FnArguments = {
  item: {
    id: "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder",
    type: "Canvas",
  },
  motivation: "painting",
  paintingType: ["Image", "Sound", "Video"],
};

describe("getCanvasByCriteria", () => {
  test("returns a result object with canvas and annotationPage attached", async () => {
    const vault = new Vault();
    await vault.loadManifest("", canvas1);

    const result = getCanvasByCriteria(
      vault,
      fnArguments.item,
      fnArguments.motivation,
      fnArguments.paintingType,
    );

    expect(result.canvas?.id).toEqual(
      "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder",
    );
    expect(result.canvas?.type).toEqual("Canvas");
    expect(result.canvas?.items).toHaveLength(1);
    expect(result.annotationPage?.id).toEqual(
      "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/placeholder/annotation-page/0",
    );
    expect(result.accompanyingCanvas).toBeUndefined();
  });

  test("filters out invalid annotations", async () => {
    const vault = new Vault();
    await vault.loadManifest("", invalidAnnotationCanvas);

    const result = getCanvasByCriteria(
      vault,
      {
        id: "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif",
        type: "Canvas",
      },
      fnArguments.motivation,
      fnArguments.paintingType,
    );
    expect(result.annotations).toHaveLength(0);
  });

  test("displays accompanying canvas", async () => {
    const vault = new Vault();
    await vault.loadManifest("", accompanyingCanvasManifest);

    const result = getCanvasByCriteria(
      vault,
      {
        id: "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0",
        type: "Canvas",
      },
      fnArguments.motivation,
      fnArguments.paintingType,
    );

    expect(result.accompanyingCanvas?.id).toEqual(
      "https://api.dc.library.northwestern.edu/api/v2/works/ad25d4af-8a12-4d8f-a557-79aea012e081?as=iiif/canvas/access/0/accompany",
    );
  });
});
