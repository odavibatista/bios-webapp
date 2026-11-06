import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { openPanelArea } from './support/panel-menu';
import { expect, test } from './support/test';

/** Entra como administrador e abre a blacklist pelo menu do painel, sem recarregar a página. */
async function openBlacklist(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('administracao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');

  await openPanelArea(page, /Administração/);
  await expect(page).toHaveURL('/admin/dominios-bloqueados');
  await expect(page.getByText(/domínios bloqueados, em ordem alfabética/)).toBeVisible();
}

async function block(page: Page, domain: string) {
  await page.getByRole('textbox', { name: 'Domínio' }).fill(domain);
  await page.getByRole('button', { name: 'Bloquear domínio' }).click();
}

test.describe('blacklist de domínios (#28)', () => {
  test('lista, inclui em minúsculas, recusa inválido e duplicado, e remove com confirmação', async ({
    page,
  }, testInfo) => {
    await openBlacklist(page);
    await expect(page).toHaveTitle('Domínios bloqueados — BIOS');
    await expect(page.getByRole('cell', { name: 'Carga inicial' }).first()).toBeVisible();
    await expectAccessible(page, testInfo, 'blacklist');

    await block(page, 'pessoa@mailinator.com');
    await expect(
      page.getByText('Domínio inválido: informe só o domínio, sem @ (ex.: mailinator.com).'),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Domínio' })).toBeFocused();

    await block(page, 'Caixa-Temporaria.Example');
    await expect(page.getByRole('status')).toContainText(
      'Domínio caixa-temporaria.example bloqueado.',
    );
    await expect(page.getByText('21 domínios bloqueados, em ordem alfabética.')).toBeVisible();

    await block(page, 'caixa-temporaria.example');
    await expect(page.getByText('Este domínio já está na blacklist.')).toBeVisible();

    const first = (await page.getByRole('rowheader').first().textContent())?.trim() ?? '';
    await page.getByRole('button', { name: `Remover ${first} da blacklist` }).click();
    const dialog = page.getByRole('alertdialog', { name: `Remover ${first} da blacklist?` });
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Remover' }).click();

    await expect(page.getByRole('status')).toHaveText(`Domínio ${first} removido da blacklist.`);
    await expect(page.getByRole('rowheader', { name: first, exact: true })).toHaveCount(0);
    await expect(page.getByText('20 domínios bloqueados, em ordem alfabética.')).toBeVisible();
  });

  test('o domínio bloqueado passa a recusar o cadastro na hora', async ({ page }) => {
    await openBlacklist(page);
    await block(page, 'bloqueio-imediato.example');
    await expect(page.getByRole('status')).toContainText('bloqueio-imediato.example bloqueado');

    // Sai pelo menu da conta e vai ao cadastro, sem recarregar: o mock guarda a blacklist nova.
    await page
      .getByRole('banner')
      .getByRole('button', { name: /Administração de Demonstração/ })
      .click();
    await page.getByRole('menuitem', { name: 'Sair', exact: true }).click();
    await expect(page).toHaveURL('/entrar');
    await page.getByRole('link', { name: 'Criar conta' }).click();

    await page.getByLabel('Nome').fill('Nova Pessoa');
    await page.getByLabel('E-mail').fill('alguem@bloqueio-imediato.example');
    await page.getByLabel('Senha', { exact: true }).fill('senha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      'Não é possível usar este endereço de e-mail. Informe outro.',
    );
  });
});
