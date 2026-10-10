import { createRequire } from "node:module";

import { expect, test } from "@playwright/test";

import { serveIIIF } from "./fixtures";

const axePath = createRequire(__filename).resolve("axe-core/axe.min.js");

for (const scene of ["viewer", "classic", "document", "items"]) {
  test(`axe: no serious or critical violations in the ${scene}`, async ({
    page,
  }) => {
    await serveIIIF(page);
    await page.goto(
      `/?scene=${scene}&content=https://fixtures.test/0009-book-1.json`,
    );
    await expect(
      page.getByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeVisible();
    await page.waitForTimeout(500);
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => {
      const result = await (window as any).axe.run(document, {
        resultTypes: ["violations"],
      });
      return result.violations
        .filter((v: any) => v.impact === "serious" || v.impact === "critical")
        .map((v: any) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n: any) => n.target.join(" ")).slice(0, 5),
        }));
    });
    expect(violations).toEqual([]);
  });
}
