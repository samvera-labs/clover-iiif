import fs from "node:fs";
import path from "node:path";

/**
 * The OSD canvas gets its keyboard focus ring from Clover, not from OpenSeadragon.
 *
 * This used to read Stitches' injected CSSOM. The rules live in a stylesheet now, which
 * no test renderer loads, so the file itself is the subject. Asserting on the declarations
 * rather than on a rendered element is a real narrowing — it cannot catch a component that
 * stops carrying the class — so the companion assertion that the viewport still renders
 * `.clover-iiif-image-openseadragon-viewport` lives in OSD.test.tsx.
 */
const css = fs.readFileSync(path.join(__dirname, "Image.css"), "utf-8");

describe("Viewport styles", () => {
  it("gives the OSD canvas a visible focus-visible ring", () => {
    expect(css).toMatch(/\.openseadragon-canvas:focus-visible::after/);
    expect(css).toMatch(/box-shadow:/);
  });

  it("falls back to a real outline where box-shadow is discarded", () => {
    expect(css).toMatch(/@media \(forced-colors: active\)/);
    expect(css).toMatch(/outline: 3px solid CanvasText/);
  });

  /*
   * The ring's two tones are its contrast, so neither may be hardcoded away from the
   * accent token or away from literal white — see the reasoning in Image.css.
   */
  it("draws the ring from the accent token over a literal white halo", () => {
    expect(css).toMatch(/inset 0 0 0 3px var\(--clover-color-accent/);
    expect(css).toMatch(/inset 0 0 0 6px #fff/);
  });
});
