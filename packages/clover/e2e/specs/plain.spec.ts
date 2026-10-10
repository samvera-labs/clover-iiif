import { expect, test } from "@playwright/test";

import { serveIIIF } from "./fixtures";

/*
 * The plain-layout promise: with no stylesheet at all, every part still lays out
 * usably — reading order, a stage with height, icons at their own size, nothing hidden
 * that should show or shown that should hide.
 */
test("without the stylesheet, the Viewer still lays out usably", async ({
  page,
}) => {
  await serveIIIF(page);
  await page.goto("/?css=0&content=https://fixtures.test/0009-book-1.json");
  await expect(
    page.getByRole("heading", { name: "Simple Manifest - Book" }),
  ).toBeVisible();
  expect(await page.locator("style[data-vite-dev-id]").count()).toBe(0);

  const stage = page.locator(".clover-content");
  const box = await stage.boundingBox();
  expect(box!.height).toBeGreaterThan(200);

  // No icon fills its container: each SVG keeps the size its attributes give it.
  const icons = await page.locator("button svg").evaluateAll((svgs) =>
    svgs.map((svg) => {
      const button = svg.closest("button")!;
      return {
        button:
          button.getAttribute("aria-label") ||
          button.textContent?.trim() ||
          button.className,
        width: Math.round(svg.getBoundingClientRect().width),
      };
    }),
  );
  expect(icons.length).toBeGreaterThan(3);
  expect(icons.filter((icon) => icon.width > 48)).toEqual([]);

  // Closed things stay closed; the pager and items are there to use.
  await expect(page.locator(".clover-download-panel")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".clover-pager-position")).toHaveText(
    /Item 2 of 3/,
  );
});
