import { getAccompanyingCanvasImage } from "@/hooks/use-iiif";
import { manifest } from "@/mocks/iiif/audio-accompanying-canvas";

describe("getAccompanyingCanvasImage hook", () => {
  it("returns a url string if passed valid items", () => {
    const canvas = manifest.items[0].accompanyingCanvas;
    const expectedResult = canvas.items[0].items[0].body.id;
    const result = getAccompanyingCanvasImage(canvas);
    expect(result).toEqual(expectedResult);
  });

  it("returns undefined if there are any errors", () => {
    console.error = jest.fn();
    const result = getAccompanyingCanvasImage({ foo: "bar" });
    expect(console.error).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
