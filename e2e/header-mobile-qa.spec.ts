import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

test.describe('cabeçalho no celular (#263)', () => {
  test('em 320 × 568, fica fixo em até 20% da altura, e a conta vira ícone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await signIn(page);

    const header = page.getByRole('banner');
    const account = header.getByRole('button', { name: /Conta de Demonstração/ });

    await expect(account).toBeVisible();
    expect((await header.boundingBox())?.height ?? 0).toBeLessThanOrEqual(568 * 0.2);
    await expect(header.getByRole('search')).toBeVisible();
    expect((await account.boundingBox())?.width ?? 0).toBeLessThanOrEqual(64);
  });

  test('em 750 × 340, deixa de ser fixo', async ({ page }) => {
    await page.setViewportSize({ width: 750, height: 340 });
    await signIn(page);

    const header = page.getByRole('banner');

    await expect(header.getByRole('search')).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });

    await expect(header).not.toBeInViewport();
  });

  test('o campo da busca usa 16 px, para o iOS não dar zoom', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);

    await expect(page.getByRole('banner').getByRole('textbox')).toHaveCSS('font-size', '16px');
  });
});

test.describe('um único menu no celular (#249)', () => {
  for (const width of [320, 390]) {
    test(`em ${width} px, só o botão do cabeçalho, e o conteúdo começa no título`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await signIn(page);

      const trigger = page.getByRole('banner').getByRole('button', { name: 'Áreas do painel' });

      await expect(trigger).toBeVisible();
      await expect(page.getByRole('button', { name: /Menu do painel/ })).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: 'Áreas do painel' })).toBeHidden();

      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('menuitem', { name: /Setores/ })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menuitem', { name: /Setores/ })).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }

  test('em 1024 px, o menu lateral continua', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await signIn(page);

    await expect(page.getByRole('navigation', { name: 'Áreas do painel' })).toBeVisible();
  });
});

test.describe('faixa de totais e abas da pesquisa (#248)', () => {
  for (const width of [1024, 1280, 1440]) {
    test(`não se sobrepõem em ${width} px, no topo e rolando`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await signIn(page);
      await page.goto('/pesquisa');

      const tiles = page.locator('bios-overview-totals');
      const tabs = page.locator('.mat-mdc-tab-nav-bar');

      await expect(tiles.locator('dd').first()).toBeVisible();

      for (const top of [0, 300]) {
        await page.evaluate((position) => {
          window.scrollTo(0, position);
        }, top);

        const tilesBox = await tiles.boundingBox();
        const tabsBox = await tabs.boundingBox();

        expect((tilesBox?.y ?? 0) + (tilesBox?.height ?? 0)).toBeLessThanOrEqual(
          (tabsBox?.y ?? 0) + 1,
        );
      }
    });
  }
});
