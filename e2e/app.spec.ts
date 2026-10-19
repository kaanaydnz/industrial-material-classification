import { test, expect } from '@playwright/test';

test('Main page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('http://localhost:5173/');
});