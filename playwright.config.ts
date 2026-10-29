import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const isCI = !!process.env['CI'];

/** Testes e2e: o app sobe sozinho (`ng serve`) e roda no Chromium. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'pt-BR',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx ng serve --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
