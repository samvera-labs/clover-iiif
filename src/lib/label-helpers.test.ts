import { InternationalString } from "@iiif/presentation-3";
import {
  getLabelAsString,
  getLabelEntries,
  getViewportLabel,
} from "./label-helpers";

const singleEntry = { none: ["Subject"] };
const multipleEntries = { none: ["Honey", "Bee"] };
const multipleLang = { none: ["Flora"], en: ["Flower"], fr: ["Fleur"] };
const nonValidLabel = "Raspberry";

describe("getLabelAsString()", () => {
  it("Returns the string ", () => {
    const single = getLabelAsString(singleEntry);
    expect(single).toBe("Subject");

    const multiple = getLabelAsString(multipleEntries);
    expect(multiple).toBe("Honey, Bee");

    const langString = getLabelAsString(multipleLang, "fr");
    expect(langString).toBe("Fleur");

    const noneFallback = getLabelAsString(multipleLang);
    expect(noneFallback).toBe("Flora");

    const nonValid = getLabelAsString(
      nonValidLabel as unknown as InternationalString,
    );
    expect(nonValid).toBe("Raspberry");
  });
});

describe("getLabelEntries()", () => {
  it("Returns label entries in an array ", () => {
    const single = getLabelEntries(singleEntry);
    expect(single).toStrictEqual(["Subject"]);

    const multiple = getLabelEntries(multipleEntries);
    expect(multiple).toStrictEqual(["Honey", "Bee"]);

    const langString = getLabelEntries(multipleLang, "fr");
    expect(langString).toStrictEqual(["Fleur"]);

    const noneFallback = getLabelEntries(multipleLang);
    expect(noneFallback).toStrictEqual(["Flora"]);

    const nonValid = getLabelEntries(
      nonValidLabel as unknown as InternationalString,
    );
    expect(nonValid).toStrictEqual(["Raspberry"]);
  });
});

describe("getViewportLabel()", () => {
  it("prefers the body label", () => {
    expect(
      getViewportLabel({
        bodies: [{ label: { none: ["Recto"] } }],
        canvases: [{ label: { none: ["Image 1"] } }],
      }),
    ).toBe("Recto");
  });

  it("falls back through annotation to canvas", () => {
    expect(
      getViewportLabel({
        bodies: [{}],
        annotations: [{ label: { none: ["Painting"] } }],
        canvases: [{ label: { none: ["Image 1"] } }],
      }),
    ).toBe("Painting");

    expect(
      getViewportLabel({
        bodies: [{}],
        annotations: [{}],
        canvases: [{ label: { none: ["Image 1"] } }],
      }),
    ).toBe("Image 1");
  });

  it("joins a few labels and counts many", () => {
    expect(
      getViewportLabel({
        canvases: [{ label: { none: ["Left"] } }, { label: { none: ["Right"] } }],
      }),
    ).toBe("Left, Right");

    expect(
      getViewportLabel({
        canvases: Array.from({ length: 5 }, (_, index) => ({
          label: { none: [`Image ${index + 1}`] },
        })),
      }),
    ).toBe("5 canvases");
  });

  it("skips a level that is only partly labelled", () => {
    expect(
      getViewportLabel({
        bodies: [{ label: { none: ["Recto"] } }, {}],
        canvases: [{ label: { none: ["Left"] } }, { label: { none: ["Right"] } }],
      }),
    ).toBe("Left, Right");
  });

  it("returns a generic name when nothing is described", () => {
    expect(getViewportLabel({ bodies: [{}], canvases: [{}] })).toBe("Image");
    expect(getViewportLabel({})).toBe("Image");
  });
});
