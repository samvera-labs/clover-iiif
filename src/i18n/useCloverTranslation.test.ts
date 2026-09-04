import { getFallbackValue } from "src/i18n/useCloverTranslation";

describe("translation fallback", () => {
  it("returns the English string for a known key", () => {
    expect(getFallbackValue("imageViewerOpen")).toBe("Open image viewer");
  });

  /*
   * The fallback runs when i18next hands the key back, so a key carrying placeholders
   * would otherwise be read out verbatim.
   */
  it("interpolates values into a fallback string", () => {
    expect(getFallbackValue("canvasPosition", { index: 2, total: 4 })).toBe(
      "Item 2 of 4",
    );
  });

  it("leaves a placeholder alone when no value is given for it", () => {
    expect(getFallbackValue("canvasPosition", { index: 2 })).toBe(
      "Item 2 of {{total}}",
    );
  });

  it("returns the key itself when nothing matches", () => {
    expect(getFallbackValue("noSuchKey")).toBe("noSuchKey");
  });
});
