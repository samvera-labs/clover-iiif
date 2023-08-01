import { getAccompanyingCanvasImage } from "src/hooks/use-iiif";
import { manifest } from "src/mocks/iiif/audio-accompanying-canvas";
import { vi } from "vitest";

describe("getAccompanyingCanvasImage hook", () => {
  it("returns a url string if passed valid items", () => {
    const canvas = manifest.items[0].accompanyingCanvas;
    const expectedResult = canvas.items[0].items[0].body.id;
    const result = getAccompanyingCanvasImage(canvas);
    expect(result).toEqual(expectedResult);
  });

  it("returns undefined if there are any errors", () => {
    console.error = vi.fn();
    const result = getAccompanyingCanvasImage({ foo: "bar" });
    expect(console.error).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
