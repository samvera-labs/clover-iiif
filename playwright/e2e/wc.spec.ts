import { test, expect } from '@playwright/test';

test('WC HTML example loads and registers custom element', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('Clover WC Plain HTML');
  // Ensure the custom element is defined and present in the DOM
  await expect(page.locator('clover-viewer')).toHaveCount(1);
  const defined = await page.evaluate(() => !!customElements.get('clover-viewer'));
  expect(defined).toBe(true);
});
