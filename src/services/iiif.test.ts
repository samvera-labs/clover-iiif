import { label } from "./presentation";

test("Test output of IIIF presentation label by internationalized language code.", () => {
  const string = label({ en: ["Sample label"] }, "en");
  expect(string).toBe("Sample label");
});
