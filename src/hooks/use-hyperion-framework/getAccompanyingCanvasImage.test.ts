import { getAccompanyingCanvasImage } from "./getAccompanyingCanvasImage";
import manifest from "../../../public/fixtures/iiif/manifests/audio-accompanying-canvas.json";

describe("getAccompanyingCanvasImage hook", () => {
  it("returns a url string if passed valid items", () => {
    const items = manifest.items[0].accompanyingCanvas.items;
    const expectedResult = items[0].items[0].body.id;
    const result = getAccompanyingCanvasImage(items);
    expect(result).toEqual(expectedResult);
  });

  it("returns undefined if there are any errors", () => {
    const result = getAccompanyingCanvasImage();
    expect(result).toBeUndefined();

    const result2 = getAccompanyingCanvasImage([{ foo: "bar" }]);
    expect(result2).toBeUndefined();
  });
});
