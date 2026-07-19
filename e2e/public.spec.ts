import { expect, test } from '@playwright/test';

// Public, unauthenticated flows — no credentials required, fully stable.
test.describe('Public pages', () => {
  test('landing page loads with hero and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SkillLink/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    // Primary CTA into signup/opportunities exists
    await expect(page.getByRole('link', { name: /התחל|הצטרף|עיין/ }).first()).toBeVisible();
  });

  test('landing has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('guest visiting a protected route is redirected to auth', async ({ page }) => {
    await page.goto('/app/profile');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole('button', { name: /התחבר/ })).toBeVisible();
  });

  test('login form validates empty submit (no crash, stays on auth)', async ({ page }) => {
    await page.goto('/auth?mode=login');
    await page.getByRole('button', { name: /התחבר/ }).click();
    // Native required validation keeps us on the auth page
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('input[type=email]')).toBeVisible();
  });

  test('signup wizard starts at role selection', async ({ page }) => {
    await page.goto('/auth?mode=signup');
    await expect(page.getByText(/אני מתלמד/)).toBeVisible();
    await expect(page.getByText(/אני מנטור/)).toBeVisible();
  });

  test('signup wizard advances through role and intent steps', async ({ page }) => {
    await page.goto('/auth?mode=signup&role=mentee');
    // role preselected → lands on intent step
    await expect(page.getByText(/מה המטרה שלך/)).toBeVisible();
    await page.getByRole('button', { name: /למידת מקצוע מעשי/ }).click();
    await page.getByRole('button', { name: /חניכה מלאה/ }).click();
    await page.getByRole('button', { name: /^המשך$/ }).click();
    // details step
    await expect(page.getByRole('button', { name: /צור חשבון/ })).toBeVisible();
  });
});
