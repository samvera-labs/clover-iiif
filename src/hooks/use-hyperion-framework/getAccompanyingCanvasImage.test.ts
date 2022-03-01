import { getAccompanyingCanvasImage } from "./getAccompanyingCanvasImage";
import manifest from "../../../public/fixtures/iiif/manifests/audio-accompanying-canvas.json";

describe("getAccompanyingCanvasImage hook", () => {
  it("returns a url string if passed valid items", () => {
    const canvas = manifest.items[0].accompanyingCanvas;
    const expectedResult = canvas.items[0].items[0].body.id;
    const result = getAccompanyingCanvasImage(canvas);
    expect(result).toEqual(expectedResult);
  });

  it("returns undefined if there are any errors", () => {
    const result = getAccompanyingCanvasImage({ foo: "bar" });
    expect(result).toBeUndefined();
  });
});
