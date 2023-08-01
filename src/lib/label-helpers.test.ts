import { InternationalString } from "@iiif/presentation-3";
import { getLabelAsString, getLabelEntries } from "./label-helpers";

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
      nonValidLabel as unknown as InternationalString
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
      nonValidLabel as unknown as InternationalString
    );
    expect(nonValid).toStrictEqual(["Raspberry"]);
  });
});
