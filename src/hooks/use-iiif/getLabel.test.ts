import { getLabel } from "@/hooks/use-iiif";

test("Test output of IIIF presentation label by internationalized language code.", () => {
  const englishLabel = getLabel({ en: ["Sample label"] }, "en");
  expect(englishLabel).toStrictEqual(["Sample label"]);
  const assumeEnglishLabel = getLabel({ en: ["Sample label"] });
  expect(assumeEnglishLabel).toStrictEqual(["Sample label"]);
  const noLangLabel = getLabel({ none: ["!*(@#"] }, "none");
  expect(noLangLabel).toStrictEqual(["!*(@#"]);
  const nonMatchingLabel = getLabel({ es: ["Etiqueta de muestra"] }, "en");
  expect(nonMatchingLabel).toStrictEqual(["Etiqueta de muestra"]);
});
