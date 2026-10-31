import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

async function openAccountMenu(page: Page) {
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Conta de Demonstração/ })
    .click();
}

test.describe('sair (#21)', () => {
  test('"Sair" leva ao login, e voltar pelo navegador não reabre o painel', async ({ page }) => {
    await signIn(page);

    await openAccountMenu(page);
    await page.getByRole('menuitem', { name: 'Sair', exact: true }).click();

    await expect(page).toHaveURL('/entrar');
    await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL('/entrar?voltar=%2Fpainel');
  });

  test('"Sair de todos os dispositivos" confirma antes, com o foco em "Cancelar"', async ({
    page,
  }, testInfo) => {
    await signIn(page);

    await openAccountMenu(page);
    await page.getByRole('menuitem', { name: 'Sair de todos os dispositivos' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Sair de todos os dispositivos?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await expectAccessible(page, testInfo, 'confirmação de sair de todos');

    // Esc cancela: a sessão continua.
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL('/painel');

    await openAccountMenu(page);
    await page.getByRole('menuitem', { name: 'Sair de todos os dispositivos' }).click();
    await page.getByRole('button', { name: 'Sair de todos' }).click();

    await expect(page).toHaveURL('/entrar');
  });
});
