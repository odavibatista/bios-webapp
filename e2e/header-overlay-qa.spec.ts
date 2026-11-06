import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

for (const width of [320, 390, 1280, 1440]) {
  test(`o aviso deixa o cabeçalho responder em ${width} px (#289)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await signIn(page);
    const header = page.getByRole('banner');
    const field = header.getByLabel('Buscar empresa por CNPJ ou nome');
    const button = header.getByRole('button', { name: 'Buscar empresa' });

    await field.fill('AB');
    await field.press('Enter');
    await expect(page.locator('.mat-mdc-snack-bar-container:not([mat-exit])')).toBeVisible();

    const hitIsButton = await button.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return (
        document
          .elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
          ?.closest('button') === element
      );
    });
    expect(hitIsButton).toBe(true);

    const menu =
      width < 960
        ? header.getByRole('button', { name: 'Áreas do painel' })
        : header.getByRole('button', { name: /Conta de Demonstração/ });
    await menu.click({ timeout: 1000 });
    await page.keyboard.press('Escape');

    await field.fill('SIDERMIN');
    await button.click({ timeout: 1000 });
    await expect(page).toHaveURL(/\/empresas\?nome=SIDERMIN/);
  });
}
