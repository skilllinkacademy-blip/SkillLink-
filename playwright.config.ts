import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// E2E tests run against a real Vite dev server (which loads .env and talks to
// the live Supabase project). Public specs run without a session; the
// authenticated critical-path specs reuse a single stored login (see
// e2e/auth.setup.ts) and skip themselves when E2E_EMAIL/E2E_PASSWORD are unset.
const AUTH_FILE = path.resolve('e2e', '.auth', 'user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'he-IL',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // Public, unauthenticated flows.
    {
      name: 'public-chromium',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'public-mobile',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },

    // Authenticated critical path — reuses the stored session.
    {
      name: 'auth-chromium',
      testMatch: /critical-path\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'auth-mobile',
      testMatch: /critical-path\.spec\.ts/,
      use: { ...devices['Pixel 7'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
