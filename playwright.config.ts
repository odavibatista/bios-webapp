import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const isCI = !!process.env['CI'];

/**
 * Testes e2e: o app sobe sozinho (`ng serve`) e roda no Chromium, em duas larguras (NFIN02):
 * 1280 px (desktop) e 390 px (celular). Todo teste termina com a análise de acessibilidade e a
 * checagem de rolagem horizontal (`e2e/support/test.ts`).
 */
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
    // Sem animação (o Material respeita `prefers-reduced-motion`): o axe mede a tela pronta, e não
    // um texto ainda em transição de opacidade, que reprova o contraste por acaso.
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'celular',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npx ng serve --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
