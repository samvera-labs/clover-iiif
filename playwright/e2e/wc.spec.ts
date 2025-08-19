import { test, expect } from '@playwright/test';

test('WC HTML example loads and registers custom element', async ({ page }) => {
  // Go directly to the HTML file to avoid directory listing quirks
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const h1 = page.locator('h1');
  await expect(h1).toContainText('Clover WC Plain HTML', { timeout: 10_000 });

  // Ensure the custom element is defined and present in the DOM
  await expect(page.locator('clover-viewer')).toHaveCount(1);
  const defined = await page.evaluate(() => !!customElements.get('clover-viewer'));
  expect(defined).toBe(true);
});
