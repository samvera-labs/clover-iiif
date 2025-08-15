import { test, expect } from '@playwright/test';

test('WC HTML example loads and registers custom element', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clover WC Plain HTML' })).toBeVisible();
  // Ensure the custom element is defined and present in the DOM
  await expect(page.locator('clover-viewer')).toHaveCount(1);
  const defined = await page.evaluate(() => !!customElements.get('clover-viewer'));
  expect(defined).toBe(true);
});

