import { signIn } from './support/session';
import { expect, test } from './support/test';

const SCREENS = ['/painel', '/empresas/00990842000138', '/setores?cnae=47&ods=15'];

/** Soma os saltos que a pessoa não provocou: o CLS da tela. */
const MEASURE_SHIFTS = `
  window.biosShifts = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.biosShifts += entry.value;
    }
  }).observe({ type: 'layout-shift', buffered: true });
`;

test.describe('conteúdo sem saltos ao carregar (#260)', () => {
  for (const path of SCREENS) {
    test(`CLS abaixo de 0,1 em ${path}`, async ({ page }) => {
      await page.addInitScript(MEASURE_SHIFTS);
      await signIn(page, path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForTimeout(1500);

      const shifts = await page.evaluate(
        () => (window as unknown as { biosShifts: number }).biosShifts,
      );

      expect(shifts).toBeLessThan(0.1);
    });
  }

  test('o rodapé fica fora da tela enquanto o conteúdo carrega', async ({ page }) => {
    await page.goto('/');

    const main = await page.locator('main').boundingBox();
    const height = page.viewportSize()?.height ?? 0;

    expect(main?.height ?? 0).toBeGreaterThanOrEqual(height);
  });
});
