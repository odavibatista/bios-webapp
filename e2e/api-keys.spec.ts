import type { Page, TestInfo } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

/** Entra e abre as chaves pelo menu do painel, sem recarregar (recarregar encerra a sessão). */
async function openApiKeys(page: Page, testInfo: TestInfo) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');

  if (testInfo.project.name === 'celular') {
    await page.getByRole('button', { name: 'Menu do painel' }).click();
  }
  await page
    .getByRole('navigation', { name: 'Áreas do painel' })
    .getByRole('link', { name: /Chaves de API/ })
    .click();
  await expect(page).toHaveURL('/conta/chaves');
  await expect(page.getByText(/de 10 chaves ativas\./)).toBeVisible();
}

async function generate(page: Page, name: string) {
  await page.getByLabel('Nome de identificação').fill(name);
  await page.getByRole('button', { name: 'Gerar chave' }).click();
}

test.describe('chaves de API (#27)', () => {
  test('lista a chave da conta só com nome, prefixo, criação e último uso', async ({
    page,
  }, testInfo) => {
    await openApiKeys(page, testInfo);

    await expect(page).toHaveTitle('Chaves de API — BIOS');
    const row = page.getByRole('row', { name: /Planilha de fornecedores/ });
    await expect(row).toContainText('bios_ZvdVkOaC');
    await expect(row).toContainText('Nunca usada');
    await expect(page.getByRole('region', { name: 'Como usar a chave' })).toContainText(
      'x-api-key',
    );
  });

  test('gera, copia e, fechado o diálogo, a chave completa não aparece mais', async ({
    page,
    context,
    baseURL,
  }, testInfo) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await openApiKeys(page, testInfo);

    await generate(page, 'Integração com o CRM');

    const dialog = page.getByRole('dialog', { name: 'Chave gerada' });
    await expect(dialog).toContainText('Copie a chave agora: ela não será mostrada de novo.');
    const key = (await dialog.locator('code').textContent())?.trim() ?? '';
    expect(key).toMatch(/^bios_\w+_/);
    await expectAccessible(page, testInfo, 'chave gerada');

    await dialog.getByRole('button', { name: 'Copiar a chave' }).click();
    await expect(dialog.getByRole('button', { name: 'Chave copiada' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(key);

    // Esc não fecha: a chave não se perde sem querer.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Já guardei a chave' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Chave “Integração com o CRM” gerada.');
    await expect(page.getByRole('row', { name: /Integração com o CRM/ })).toBeVisible();
    expect(await page.content()).not.toContain(key);
  });

  test('revogar pede confirmação, com o foco em "Cancelar", e tira a chave da lista', async ({
    page,
  }, testInfo) => {
    await openApiKeys(page, testInfo);

    await page.getByRole('button', { name: 'Revogar a chave Planilha de fornecedores' }).click();
    const confirm = page.getByRole('alertdialog', {
      name: 'Revogar a chave “Planilha de fornecedores”?',
    });
    await expect(confirm.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await expectAccessible(page, testInfo, 'confirmação de revogar');

    await confirm.getByRole('button', { name: 'Revogar' }).click();

    await expect(page.getByRole('status')).toHaveText('Chave “Planilha de fornecedores” revogada.');
    await expect(page.getByRole('row', { name: /Planilha de fornecedores/ })).toHaveCount(0);
    await expect(
      page.getByText('Você ainda não tem chaves de API. Gere a primeira acima.'),
    ).toBeVisible();
  });

  test('com 10 chaves ativas, a 11ª é recusada com a explicação do limite', async ({
    page,
  }, testInfo) => {
    test.slow();
    await openApiKeys(page, testInfo);

    // A conta de demonstração já tem 1 chave.
    for (let index = 2; index <= 10; index++) {
      await generate(page, `Integração ${index}`);
      await page.getByRole('button', { name: 'Já guardei a chave' }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
    await expect(page.getByText('10 de 10 chaves ativas.')).toBeVisible();

    await generate(page, 'A décima primeira');

    await expect(page.getByRole('alert')).toContainText(
      'Você já tem 10 chaves de API ativas. Revogue uma para gerar outra.',
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
