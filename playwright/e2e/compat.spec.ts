import { test, expect } from '@playwright/test';

test('loads homepage and renders heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clover IIIF Compatibility Check' })).toBeVisible();
});

