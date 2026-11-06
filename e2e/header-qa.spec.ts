import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

test.describe('cabeçalho (#252 e #253)', () => {
  test('o aviso fica abaixo do cabeçalho em desktop e celular', async ({ page }) => {
    await signIn(page);

    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const field = page.getByRole('banner').getByLabel('Buscar empresa por CNPJ ou nome');
      await field.fill('x');
      await field.press('Enter');

      const header = await page.getByRole('banner').boundingBox();
      const toast = await page.locator('.mat-mdc-snack-bar-container').boundingBox();
      expect(header).not.toBeNull();
      expect(toast).not.toBeNull();
      expect(toast!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      await expect(page.getByText('Informe um CNPJ ou nome válido para pesquisar')).toBeVisible();
      const contrast = await page.locator('.mat-mdc-snack-bar-container').evaluate((element) => {
        const surface = element.querySelector('.mdc-snackbar__surface')!;
        const label = element.querySelector('.mdc-snackbar__label')!;
        const luminance = (color: string) => {
          const channels = color
            .match(/\d+/g)!
            .slice(0, 3)
            .map((part) => {
              const value = Number(part) / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const background = luminance(getComputedStyle(surface).backgroundColor);
        const text = luminance(getComputedStyle(label).color);
        return (Math.max(background, text) + 0.05) / (Math.min(background, text) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('a busca ocupa o centro em telas largas, sem cobrir marca ou conta', async ({ page }) => {
    await signIn(page);

    for (const width of [960, 1024, 1099, 1100, 1280, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      const field = await page
        .getByRole('banner')
        .getByLabel('Buscar empresa por CNPJ ou nome')
        .boundingBox();
      const search = await page.locator('bios-cnpj-search.toolbar-search').boundingBox();
      const brand = await page.locator('.topbar .brand').boundingBox();
      const account = await page.locator('.topbar .user-menu').boundingBox();
      expect(field).not.toBeNull();
      expect(search).not.toBeNull();
      expect(brand).not.toBeNull();
      expect(account).not.toBeNull();
      expect(search!.x).toBeGreaterThanOrEqual(brand!.x + brand!.width);
      expect(search!.x + search!.width).toBeLessThanOrEqual(account!.x);
      if (width >= 1100) {
        expect(Math.abs(field!.x + field!.width / 2 - width / 2)).toBeLessThanOrEqual(2);
      }
    }
  });
});
