import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

test.describe('busca por nome (#31)', () => {
  test('nome no painel lista empresas e abre o perfil; voltar preserva a busca', async ({
    page,
  }) => {
    await signIn(page);
    const field = page.getByRole('main').getByLabel('CNPJ ou nome da empresa');
    await field.fill('Aço Cearense');
    await field.press('Enter');

    await expect(page).toHaveURL(/\/empresas\?nome=A%C3%A7o(?:%20|\+)Cearense/);
    await expect(page.getByRole('link', { name: 'ACO CEARENSE INDUSTRIAL LTDA' })).toBeVisible();
    await page.getByRole('link', { name: 'ACO CEARENSE INDUSTRIAL LTDA' }).click();
    await expect(page).toHaveURL('/empresas/00990842000138');
    await page.goBack();
    await expect(page.getByRole('link', { name: 'ACO CEARENSE INDUSTRIAL LTDA' })).toBeVisible();
  });

  test('sem resultado explica o limite da base local; texto inválido não pesquisa', async ({
    page,
  }) => {
    await signIn(page);
    const field = page.getByRole('main').getByLabel('CNPJ ou nome da empresa');
    await field.fill('Empresa Inventada');
    await field.press('Enter');
    await expect(page.getByText(/apenas empresas já consultadas pelo CNPJ/)).toBeVisible();

    await field.fill('SA');
    await field.press('Enter');
    await expect(
      page.getByText('Informe ao menos uma palavra com 3 letras ou mais.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/nome=Empresa/);
  });
});
