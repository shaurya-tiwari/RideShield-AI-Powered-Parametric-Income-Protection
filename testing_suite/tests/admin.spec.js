const { test, expect } = require('@playwright/test');

test.describe('RideShield Admin Flow', () => {
  test('successfully logs in as admin and views dashboard', async ({ page }) => {
    // 1. Navigate to Auth
    await page.goto('/auth');

    // 2. Switch to Admin tab
    await page.getByRole('button', { name: /admin sign in/i }).click();

    // 3. Fill in admin credentials
    const userField = page.locator('label:has-text("Admin username") + input');
    const passField = page.locator('label:has-text("Admin password") + input');
    
    await userField.fill('');
    await userField.type('admin', { delay: 50 });
    
    await passField.fill('');
    await passField.type('rideshield-admin', { delay: 50 });

    // 4. Submit login
    await page.getByRole('button', { name: /continue as admin/i }).click();
    
    // 5. Verify redirection to Admin Panel
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/admin panel/i)).toBeVisible();
    
    // 6. Verify key admin sections are present
    await expect(page.getByText(/review queue/i).first()).toBeVisible();
    await expect(page.getByText(/system analytics/i)).toBeVisible();
    await expect(page.getByText(/loss ratio/i)).toBeVisible();
  });
});
