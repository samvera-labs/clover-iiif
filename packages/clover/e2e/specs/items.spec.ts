import { expect, test } from "@playwright/test";

import { serveIIIF } from "./fixtures";

test("Items: one tab stop; arrows move, Enter chooses, Home and End jump", async ({
  page,
}) => {
  await serveIIIF(page);
  await page.goto(
    "/?scene=items&content=https://fixtures.test/0011-book-3-behavior-individuals.json",
  );
  const options = page.getByRole("option");
  await expect(options.first()).toBeVisible();
  const total = await options.count();
  expect(total).toBeGreaterThan(2);

  await page.keyboard.press("Tab");
  await expect(options.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(options.nth(total - 1)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(options.nth(0)).toBeFocused();
  // One tab stop: Tab leaves the list for what follows it.
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "After the items" }),
  ).toBeFocused();
});
