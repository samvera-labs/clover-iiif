import { cleanTime } from "./utils";

test("Test output a 'cleaned time' when given international standard time notation.", () => {
  const string = cleanTime("01:22:55.784");
  expect(string).toBe("1:22:55");
});
