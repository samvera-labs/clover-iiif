import { test, expect } from "@playwright/test";

test("WC HTML example loads and registers custom element", async ({ page }) => {
  // Go directly to the HTML file to avoid directory listing quirks
  await page.goto("http://localhost:3002/index.html", {
    waitUntil: "domcontentloaded",
  });

  const h1 = page.locator("h1");
  await expect(h1).toContainText("Clover WC Plain HTML", { timeout: 10_000 });

  // Ensure the custom element is defined and present in the DOM
  await expect(page.locator("clover-viewer")).toHaveCount(1);
  const defined = await page.evaluate(
    () => !!customElements.get("clover-viewer"),
  );
  expect(defined).toBe(true);
});

/**
 * The custom A/V player under Preact.
 *
 * `build/build.mjs` builds the web component with React aliased to `preact/compat`, and
 * `external: []` bundles Vidstack into it wholesale. Vidstack does not list Preact among its
 * supported frameworks, so this pins that the two behave the same — it is the test that would
 * catch a compat regression making the player mount but not work.
 *
 * It asserts `data-can-play` and `data-visible` rather than just that the element exists,
 * because the failure mode worth catching is a player that renders and then sits inert.
 *
 * The fixture is local VP9, not a remote H.264 manifest, and that matters: Playwright's
 * bundled Chromium ships without proprietary codecs, so H.264 never reaches `canplay` there
 * and Vidstack correctly keeps the controls hidden. That is indistinguishable from a compat
 * failure, so a codec the test browser can decode is what makes a red run mean something.
 */
test("WC custom player works the same under Preact", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) =>
    consoleErrors.push(`pageerror: ${error.message}`),
  );

  await page.goto("http://127.0.0.1:3002/wc-custom-player.html", {
    waitUntil: "domcontentloaded",
  });

  await expect(page.locator("clover-viewer")).toHaveCount(1);

  // Vidstack's player root: the lazy chunk resolved and its components rendered under compat.
  const player = page.locator(".clover-viewer-player");
  await expect(player).toHaveCount(1, { timeout: 30_000 });

  // The provider built the media element, so Vidstack got through setup.
  await expect(page.locator(".clover-viewer-player video")).toHaveCount(1, {
    timeout: 30_000,
  });

  // The media became playable, which is the precondition for everything below.
  await expect(player).toHaveAttribute("data-can-play", "", {
    timeout: 30_000,
  });

  /*
   * The bar is actually visible. `data-visible` is written by a reactive binding in
   * Vidstack's `Controls.onAttach`, so it is the single best signal that compat is carrying
   * its state through — and the thing whose absence made the player look broken.
   */
  const controls = page.locator(".clover-viewer-player-controls");
  await expect(controls).toHaveAttribute("data-visible", "", {
    timeout: 30_000,
  });
  await expect(controls).toHaveCSS("opacity", "1");

  // Clover's own controls, which read Vidstack's hooks.
  await expect(
    page.locator('.clover-viewer-player-button[data-button="play"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('.clover-viewer-player-button[data-button="captions"]'),
  ).toHaveCount(1);

  // The IIIF caption reached the element as a real track, carrying its label.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.querySelector(
            ".clover-viewer-player video",
          ) as HTMLVideoElement | null;
          return el ? Array.from(el.textTracks).map((t) => t.label) : [];
        }),
      { timeout: 30_000 },
    )
    .toEqual(["Captions in WebVTT format"]);

  // An interaction round-trips: request to Vidstack state to a Clover re-render.
  const muteButton = page.locator(
    '.clover-viewer-player-button[data-button="mute"]',
  );
  const labelBefore = await muteButton.getAttribute("aria-label");
  await muteButton.click();
  await expect
    .poll(async () => muteButton.getAttribute("aria-label"), {
      timeout: 15_000,
    })
    .not.toBe(labelBefore);

  expect(consoleErrors).toEqual([]);
});
