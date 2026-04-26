import { test, expect } from '@playwright/test';

// Each run needs a unique user so tests don't collide with existing DB data
const ts = Date.now();
const EMAIL = `e2e_${ts}@test.com`;
const USERNAME = `e2euser${ts}`.slice(0, 20);
const PASSWORD = 'E2eTest1';

test.describe('Authentication flow', () => {
  test('registers a new user and lands on the home page', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder(/studystar/i).fill(USERNAME);
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(/studygram/i).first()).toBeVisible();
  });

  test('logs out and logs back in', async ({ page }) => {
    // Register first
    await page.goto('/register');
    await page.getByPlaceholder(/studystar/i).fill(USERNAME);
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    // Log out
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL('/login');

    // Log back in
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/');
  });

  test('shows error for wrong password', async ({ page }) => {
    // Register first
    await page.goto('/register');
    await page.getByPlaceholder(/studystar/i).fill(USERNAME);
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    // Log out and try wrong password
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill('WrongPass9');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('redirects unauthenticated user from / to /login', async ({ page }) => {
    // Clear cookies to ensure no session
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
