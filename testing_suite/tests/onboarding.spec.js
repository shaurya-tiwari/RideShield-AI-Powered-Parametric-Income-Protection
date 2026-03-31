const { test, expect } = require('@playwright/test');

test.describe('RideShield Onboarding Flow', () => {
  test('successfully registers a new worker and purchases a plan', async ({ page }) => {
    // Generate a unique phone number to avoid "Already Exists" errors
    const randomPhone = `987${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    
    // 1. Navigate to Onboarding
    await page.goto('/');
    await page.getByRole('link', { name: /start onboarding/i }).click();
    await expect(page).toHaveURL(/\/onboarding/);

    // 2. Fill out the registration form
    await page.fill('label:has-text("Full name") + input', 'Test Worker');
    await page.fill('label:has-text("Phone number") + input', randomPhone);
    
    // Select City and Zone (waiting for them to load if necessary)
    await page.selectOption('label:has-text("City") + select', 'delhi');
    await page.selectOption('label:has-text("Zone") + select', 'south_delhi');
    
    await page.selectOption('label:has-text("Platform") + select', 'zomato');
    await page.fill('label:has-text("Working hours per day") + input', '8');
    await page.fill('label:has-text("Self-reported daily income") + input', '1000');
    
    // 3. Give consent
    await page.check('input[type="checkbox"]');
    
    // 4. Submit Registration
    await page.click('button:has-text("Register worker")');
    
    // 5. Wait for Plan Selection Step
    await expect(page.locator('text=Select a plan')).toBeVisible({ timeout: 10000 });
    
    // 6. Select a Plan (Smart Protect is usually recommended)
    const smartProtect = page.getByText(/smart protect/i).first();
    await expect(smartProtect).toBeVisible();
    await smartProtect.click();
    
    // 7. Purchase the plan
    await page.getByRole('button', { name: /purchase selected plan/i }).click();
    
    // 8. Verify Success State
    await expect(page.getByText(/worker onboarding completed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /open worker dashboard/i })).toBeVisible();
  });
});
