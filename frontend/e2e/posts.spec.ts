import { test, expect } from '@playwright/test';

const ts = Date.now();
const EMAIL = `post_e2e_${ts}@test.com`;
const USERNAME = `postuser${ts}`.slice(0, 20);
const PASSWORD = 'PostTest1';

test.describe('Posts flow', () => {
  // Register + login before each test in this suite
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder(/studystar/i).fill(USERNAME);
    await page.getByPlaceholder(/you@example\.com/i).fill(EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(PASSWORD);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('creates a post and it appears in the feed', async ({ page }) => {
    await page.getByRole('button', { name: /new post/i }).click();

    await page.getByPlaceholder(/what did you learn/i).fill('My E2E Test Post');
    await page.getByPlaceholder(/share what you know/i).fill('This is content for the E2E test post with enough characters.');
    await page.getByPlaceholder(/e\.g\. data structures/i).fill('Testing');
    // Difficulty defaults to medium — no change needed
    await page.getByRole('button', { name: /publish/i }).click();

    await expect(page.getByText('My E2E Test Post')).toBeVisible();
  });

  test('likes a post', async ({ page }) => {
    // Create a post first
    await page.getByRole('button', { name: /new post/i }).click();
    await page.getByPlaceholder(/what did you learn/i).fill('Likeable Post');
    await page.getByPlaceholder(/share what you know/i).fill('Content for liking test with plenty of characters here.');
    await page.getByPlaceholder(/e\.g\. data structures/i).fill('Testing');
    await page.getByRole('button', { name: /publish/i }).click();
    await expect(page.getByText('Likeable Post')).toBeVisible();

    // Like it
    const likeBtn = page.getByRole('button', { name: /like post/i }).first();
    await likeBtn.click();

    await expect(page.getByRole('button', { name: /unlike post/i }).first()).toBeVisible();
  });

  test('navigates to post detail page', async ({ page }) => {
    // Create a post
    await page.getByRole('button', { name: /new post/i }).click();
    await page.getByPlaceholder(/what did you learn/i).fill('Detail Page Post');
    await page.getByPlaceholder(/share what you know/i).fill('Content for detail page navigation test, enough chars.');
    await page.getByPlaceholder(/e\.g\. data structures/i).fill('Testing');
    await page.getByRole('button', { name: /publish/i }).click();

    // Click the title to go to detail page
    await page.getByText('Detail Page Post').click();
    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.getByText('Detail Page Post')).toBeVisible();
  });
});
