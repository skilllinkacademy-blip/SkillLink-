import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Signs in once and saves the session, so the authenticated specs share one
// login instead of racing to sign the same user in from every worker.
export const AUTH_FILE = path.resolve('e2e', '.auth', 'user.json');

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  if (!EMAIL || !PASSWORD) {
    // No credentials: write an empty state so dependent projects can load.
    // The authenticated specs skip themselves in this case.
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  await page.goto('/auth?mode=login');
  await page.locator('input[type=email]').fill(EMAIL);
  await page.locator('input[type=password]').fill(PASSWORD);
  await page.getByRole('button', { name: /התחבר/ }).click();
  await page.waitForURL(/\/app\//, { timeout: 30_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
