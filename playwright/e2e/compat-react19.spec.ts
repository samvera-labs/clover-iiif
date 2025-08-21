import { test, expect } from '@playwright/test';

test('React 19 compatibility - loads homepage and renders heading', async ({ page }) => {
  await page.goto('http://localhost:3003/');
  await expect(page.getByRole('heading', { name: 'Clover IIIF Compatibility Check' })).toBeVisible();
});