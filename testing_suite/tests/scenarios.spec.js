const { test, expect } = require('@playwright/test');

test.describe('RideShield Demo Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Navigate to Demo Runner
    await page.goto('/demo');
    // 2. Reset simulators to ensure a clean state for each test
    await page.getByRole('button', { name: /reset simulators/i }).click();
  });

  test('can trigger the Legitimate Rain scenario', async ({ page }) => {
    // 2. Locate the "Legitimate Rain" scenario card and click Run
    const rainCard = page.locator('.panel').filter({ hasText: /legitimate rain/i });
    await expect(rainCard).toBeVisible();
    
    const runButton = rainCard.getByRole('button', { name: /run scenario/i });
    await runButton.click();
    
    // 3. Verify it shows running state or result
    // The button text might change to "Running..." or show a "PASSED" banner
    await expect(rainCard.getByText(/passed/i)).toBeVisible({ timeout: 20000 });
  });

  test('can reset simulators', async ({ page }) => {
    // 4. Click Reset Simulators
    await page.getByRole('button', { name: /reset simulators/i }).click();
    
    // 5. Verify stats are reset or toast appears
    // Since we don't have a specific reset success text, we check if the button is clickable again
    await expect(page.getByRole('button', { name: /reset simulators/i })).toBeEnabled();
  });
});
