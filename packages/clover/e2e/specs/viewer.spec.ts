import { expect, test } from "@playwright/test";

import { book, encodeContentState, serveIIIF } from "./fixtures";

test.describe("Viewer", () => {
  test("opens a paged book, steps by spread, and keeps the pager and items in step", async ({
    page,
  }) => {
    await serveIIIF(page);
    await page.goto("/?content=https://fixtures.test/0009-book-1.json");
    await expect(
      page.getByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeVisible();
    const position = page.locator(".clover-pager-position");
    await expect(position).toHaveText(/Item 1 of 3/);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(position).toHaveText(/Item 2 of 3/);
    await expect(page.getByRole("option", { selected: true })).toContainText(
      /Frontispiece/,
    );
    await expect(page.locator(".clover-canvas")).toHaveAttribute(
      "data-status",
      /ready|loading/,
    );
  });

  test("the controls fade while the information panel is open", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "needs a pointer that can leave");
    await serveIIIF(page);
    await page.goto("/?content=https://fixtures.test/0009-book-1.json");
    const toggle = page.locator('.clover-canvas [data-button="panel"]');
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const controls = page.locator(".clover-canvas > .clover-canvas-controls");
    const opacity = () =>
      controls.evaluate((el) => getComputedStyle(el).opacity);

    const stage = await page.locator(".clover-canvas").boundingBox();
    await page.mouse.move(
      stage!.x + stage!.width / 2,
      stage!.y + stage!.height / 2,
    );
    await expect.poll(opacity).toBe("1");
    // Away from the Canvas: it lingers a second, then fades, panel open or not.
    await page.mouse.move(
      stage!.x + stage!.width / 2,
      stage!.y + stage!.height + 200,
    );
    await expect.poll(opacity, { timeout: 5000 }).toBe("0");
  });

  test("reads right to left: the pager's order follows the book", async ({
    page,
  }) => {
    await serveIIIF(page);
    await page.goto(
      "/?content=https://fixtures.test/0010-book-2-viewing-direction-rtl.json",
    );
    const pager = page.locator(".clover-pager");
    await expect(pager).toBeVisible();
    const order = await pager
      .locator("button")
      .evaluateAll((buttons) => buttons.map((b) => b.textContent?.trim()));
    expect(order[0]).toMatch(/Next/);
  });

  test("opens a content state link at its Canvas", async ({ page }) => {
    await serveIIIF(page);
    const state = encodeContentState({
      "@context": "http://iiif.io/api/presentation/3/context.json",
      type: "Annotation",
      motivation: ["contentState"],
      target: {
        id: book.items[2].id,
        type: "Canvas",
        partOf: [
          { id: "https://fixtures.test/0009-book-1.json", type: "Manifest" },
        ],
      },
    });
    await page.goto(`/?content=${state}`);
    await expect(page.locator(".clover-pager-position")).toHaveText(
      /Item 2 of 3/,
    );
  });
});
