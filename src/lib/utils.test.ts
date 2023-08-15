import { cleanTime, convertTime } from "src/lib/utils";

test("Test output a 'cleaned time' when given international standard time notation.", () => {
  const hours1 = cleanTime("11:15:55.784");
  expect(hours1).toBe("11:15:55");
  const hours2 = cleanTime("01:15:55.784");
  expect(hours2).toBe("1:15:55");
  const minutes1 = cleanTime("00:15:55.784");
  expect(minutes1).toBe("15:55");
  const minutes2 = cleanTime("00:05:55.784");
  expect(minutes2).toBe("5:55");
  const seconds1 = cleanTime("00:00:55.784");
  expect(seconds1).toBe("0:55");
  const seconds2 = cleanTime("00:00:05.784");
  expect(seconds2).toBe("0:05");
});

test("Test output a 'converted time' when given seconds as integer.", () => {
  const hours1 = convertTime(40555);
  expect(hours1).toBe("11:15:55");
  const hours2 = convertTime(4555);
  expect(hours2).toBe("1:15:55");
  const hours3 = convertTime(40100);
  expect(hours3).toBe("11:08:20");
  const minutes1 = convertTime(955);
  expect(minutes1).toBe("15:55");
  const minutes2 = convertTime(355);
  expect(minutes2).toBe("5:55");
  const seconds1 = convertTime(55);
  expect(seconds1).toBe("0:55");
  const seconds2 = convertTime(5);
  expect(seconds2).toBe("0:05");
});
