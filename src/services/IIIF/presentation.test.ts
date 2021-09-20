import { label } from "./presentation";

test("Test output of IIIF label based on expected language.", () => {
  const string = label({ en: ["Sample label"] }, "en");
  expect(string).toBe("Sample label");
});
