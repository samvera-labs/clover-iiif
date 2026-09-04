import { test, expect } from "@playwright/test";

/**
 * WCAG 1.4.10 asks for no loss of content at 400% zoom on a 1280px viewport, which is a
 * 320px CSS viewport. The image controls are absolutely positioned over the canvas, so
 * nothing but their own size keeps them inside it.
 */
const REFLOW_VIEWPORT = { width: 320, height: 512 };

const CONTROLS = '[data-testid="clover-iiif-image-openseadragon-controls"]';
const BUTTON = ".clover-iiif-image-openseadragon-button";

test.describe("image controls at 400% zoom", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(REFLOW_VIEWPORT);
    await page.goto("/reflow.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(CONTROLS)).toBeVisible({ timeout: 20_000 });
  });

  test("every control stays inside the canvas", async ({ page }) => {
    const outside = await page.evaluate(
      ({ controls, button }) => {
        const cluster = document.querySelector(controls);
        if (!cluster) return ["no controls rendered"];
        const canvas = cluster.parentElement!.getBoundingClientRect();

        return [...cluster.querySelectorAll(button)]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.bottom > canvas.bottom + 0.5 ||
              r.right > canvas.right + 0.5 ||
              r.top < canvas.top - 0.5 ||
              r.left < canvas.left - 0.5
            );
          })
          .map((el) => (el as HTMLElement).dataset.button ?? "unnamed");
      },
      { controls: CONTROLS, button: BUTTON },
    );

    expect(outside).toEqual([]);
  });

  test("every control is the hit target at its own centre", async ({
    page,
  }) => {
    const unreachable = await page.evaluate(
      ({ controls, button }) => {
        const cluster = document.querySelector(controls);
        if (!cluster) return ["no controls rendered"];

        return [...cluster.querySelectorAll(button)]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const hit = document.elementFromPoint(
              r.left + r.width / 2,
              r.top + r.height / 2,
            );
            return hit !== el && !el.contains(hit);
          })
          .map((el) => (el as HTMLElement).dataset.button ?? "unnamed");
      },
      { controls: CONTROLS, button: BUTTON },
    );

    expect(unreachable).toEqual([]);
  });
});

/**
 * Bounding the cluster is what introduces these two: they need a canvas short enough to
 * squeeze it, and a viewport wide enough for the row layout. The 320px reflow fixture is
 * neither, so it cannot see either regression.
 */
test.describe("image controls in a short canvas", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/reflow-short.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(CONTROLS)).toBeVisible({ timeout: 20_000 });
  });

  test("wrapped lines sit next to each other", async ({ page }) => {
    const lines = await page.evaluate(
      ({ controls, button }) => {
        const cluster = document.querySelector(controls);
        if (!cluster) return null;

        const buttons = [...cluster.querySelectorAll(button)];
        const tops = [
          ...new Set(
            buttons.map((el) => Math.round(el.getBoundingClientRect().top)),
          ),
        ].sort((a, b) => a - b);

        return {
          tops,
          buttonHeight: buttons[0].getBoundingClientRect().height,
        };
      },
      { controls: CONTROLS, button: BUTTON },
    );

    expect(lines).not.toBeNull();
    // The fixture is narrow enough to force a wrap; without one there is nothing to check.
    expect(lines!.tops.length).toBeGreaterThan(1);

    /*
     * Consecutive lines are one button apart plus its margin. Sharing the bounded box's
     * full height between them instead left a gap of half the canvas.
     */
    for (let i = 1; i < lines!.tops.length; i++) {
      const gap = lines!.tops[i] - lines!.tops[i - 1];
      expect(gap).toBeLessThanOrEqual(lines!.buttonHeight * 1.5);
    }
  });

  /*
   * Wrapping widens the box to the space offered, so without an explicit justification
   * the row packed itself against the far edge, under the OpenSeadragon navigator.
   */
  test("a wrapped row stays on the side it is offset from", async ({
    page,
  }) => {
    const measured = await page.evaluate(
      ({ controls, button }) => {
        const cluster = document.querySelector(controls);
        if (!cluster) return null;

        const canvas = cluster.parentElement!.getBoundingClientRect();
        const offset = parseFloat(getComputedStyle(cluster).right) || 0;
        const buttons = [...cluster.querySelectorAll(button)];

        return {
          offset,
          // How far each control's trailing edge sits from the canvas's own.
          gaps: buttons.map(
            (el) => canvas.right - el.getBoundingClientRect().right,
          ),
          width: buttons[0].getBoundingClientRect().width,
        };
      },
      { controls: CONTROLS, button: BUTTON },
    );

    expect(measured).not.toBeNull();

    /*
     * At least one control sits flush at the cluster's offset. Packed the other way, the
     * nearest one is a whole stretched box away from it.
     */
    const nearest = Math.min(...measured!.gaps);
    expect(nearest).toBeCloseTo(measured!.offset, 0);
  });
});
