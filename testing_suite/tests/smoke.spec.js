const { test, expect } = require('@playwright/test');

test.describe('RideShield Smoke Tests', () => {
  test('homepage loads and has title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for the main brand name
    await expect(page.getByText(/rideshield/i).first()).toBeVisible();
    
    // Check for "Income protection engine" subtitle
    await expect(page.getByText(/income protection engine/i).first()).toBeVisible();
  });

  test('main call to action buttons are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Start Onboarding button
    await expect(page.getByRole('link', { name: /start onboarding/i })).toBeVisible();
    
    // Sign In button
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    
    // Run Scenarios button
    await expect(page.getByRole('link', { name: /run scenarios/i })).toBeVisible();
  });
});
