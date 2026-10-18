import { test, expect } from '@playwright/test';
test('certroom loads and adds secret', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('CertRoom: demo');
  await page.locator('.name-input').fill('stripe-key');
  await page.locator('.type-input').selectOption('api_key');
  await page.locator('.add-btn').click();
  await expect(page.locator('.secret-list').locator('div').first()).toBeVisible();
});