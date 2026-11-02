import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const EMAIL = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';

async function signIn(page: Page) {
  await page.getByLabel('E-mail').fill(EMAIL);
  await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

test.describe('excluir a conta (#30)', () => {
  test('pede a senha, recusa a errada e, com a certa, apaga a conta e volta ao início', async ({
    page,
  }, testInfo) => {
    await page.goto('/entrar');
    await signIn(page);
    await expect(page).toHaveURL('/painel');
    await page
      .getByRole('banner')
      .getByRole('button', { name: /Conta de Demonstração/ })
      .click();
    await page.getByRole('menuitem', { name: /Minha conta/ }).click();
    await expect(page).toHaveURL('/conta');

    await page.getByRole('button', { name: 'Excluir conta' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Excluir a sua conta?' });
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await expect(dialog).toContainText('as chaves de API, que param de funcionar na hora;');
    const confirm = dialog.getByRole('button', { name: 'Excluir conta' });
    await expect(confirm).toBeDisabled();
    await expectAccessible(page, testInfo, 'confirmação da exclusão');

    // O foco fica preso no diálogo: o Tab volta ao começo dele, sem sair para a página.
    for (let step = 0; step < 6; step++) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

    await dialog.getByLabel('Senha', { exact: true }).fill('senha-errada');
    await confirm.click();
    await expect(dialog.getByText('A senha atual está incorreta.')).toBeVisible();
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Senha', { exact: true }).fill(PASSWORD);
    await confirm.click();

    await expect(page).toHaveURL('/?conta=excluida');
    await expect(page.getByRole('status')).toHaveText(
      'Sua conta foi excluída, com os dados pessoais, as sessões e as chaves de API.',
    );
    await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0);

    // A conta não existe mais: o login com ela é recusado.
    await page.getByRole('link', { name: 'Entrar' }).click();
    await signIn(page);
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
  });
});
