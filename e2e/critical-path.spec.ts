import { expect, test } from '@playwright/test';

// Authenticated critical-path flow. The session is established once by
// e2e/auth.setup.ts and shared via storageState. Requires a dedicated test
// account (E2E_EMAIL / E2E_PASSWORD, e.g. yarinlavi1+mentee1@gmail.com);
// skips cleanly when they are not provided.
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.describe('Critical path (authenticated)', () => {
  test.skip(!EMAIL || !PASSWORD, 'set E2E_EMAIL and E2E_PASSWORD to run authenticated E2E');

  test('lands on the opportunities feed when signed in', async ({ page }) => {
    await page.goto('/app/opportunities');
    await expect(page).toHaveURL(/\/app\/opportunities/);
    await expect(page.getByRole('heading', { name: 'הזדמנויות', level: 1 })).toBeVisible();
  });

  test('browses opportunities and opens an opportunity', async ({ page }) => {
    await page.goto('/app/opportunities');
    // Cards are clickable divs (not <a>); wait for a seeded one and open it.
    const card = page.getByText('דרוש מתלמד לנגרות — רהיטים בהזמנה אישית').first();
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.click();
    await expect(page).toHaveURL(/\/app\/opportunities\/[0-9a-f-]{36}/);
    await expect(page.getByRole('button', { name: /מעוניין|הודעה/ }).first()).toBeVisible();
  });

  test('explore lists seeded mentors', async ({ page }) => {
    await page.goto('/app/explore');
    // Wait for the async fetch (+ AI ranking) to populate before asserting.
    await expect(page.getByText('יוסי אברהם').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/תוצאות/).first()).toBeVisible();
  });

  test('opens the inbox without errors', async ({ page }) => {
    await page.goto('/app/messages');
    await expect(page.locator('input[placeholder*="חפש"]')).toBeVisible({ timeout: 15_000 });
  });

  test('profile page renders the completion meter', async ({ page }) => {
    await page.goto('/app/profile');
    await expect(page.getByText(/השלם את הפרופיל|מדד אמינות/).first()).toBeVisible({ timeout: 15_000 });
  });
});
