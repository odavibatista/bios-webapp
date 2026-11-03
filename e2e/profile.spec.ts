import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

/** Entra com a conta de demonstração e chega ao painel (recarregar depois disso perde a sessão). */
async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

/** O campo de CNPJ do conteúdo (o da barra tem outro rótulo). */
function cnpjField(page: Page) {
  return page.getByRole('main').getByLabel('CNPJ ou nome da empresa', { exact: true });
}

test.describe('perfil da empresa (#24)', () => {
  test('CNPJ com máscara, no painel, abre o perfil com os dados cadastrais', async ({
    page,
  }, testInfo) => {
    await signIn(page);

    await cnpjField(page).fill('00.990.842/0001-38');
    await cnpjField(page).press('Enter');

    await expect(page).toHaveURL('/empresas/00990842000138');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'ACO CEARENSE INDUSTRIAL LTDA',
    );
    await expect(page).toHaveTitle('ACO CEARENSE INDUSTRIAL LTDA — BIOS');
    const data = page.getByRole('region', { name: 'Dados cadastrais' });
    await expect(data).toContainText('Ativa');
    await expect(data).toContainText('2431-8/00');
    await expect(data).toContainText('PRODUÇÃO DE TUBOS DE AÇO COM COSTURA');
    await expect(data).toContainText('Cadastro atualizado na fonte em 30/10/2026');
    const scores = page.getByRole('region', { name: 'Índices por ODS' });
    await expect(scores.getByRole('article', { name: 'ODS 13' })).toContainText(
      'Sem evidência conclusiva',
    );
    await expect(scores.getByRole('article', { name: 'ODS 15' })).toContainText('-80');
    await expect(scores.getByRole('article', { name: 'ODS 15' })).toContainText('0,50');
    await expect(
      scores.getByRole('img', { name: /Índice do ODS 15: -80 numa escala de −100 a 100/ }),
    ).toBeVisible();
    await expectAccessible(page, testInfo, 'perfil da empresa');
  });

  test('CNPJ inválido mostra o erro no campo e não sai do painel', async ({ page }) => {
    await signIn(page);

    await cnpjField(page).fill('00.990.842/0001-39');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    await expect(
      page.getByText('CNPJ inválido. Confira os dígitos e tente de novo.'),
    ).toBeVisible();
    await expect(cnpjField(page)).toBeFocused();
    await expect(page).toHaveURL('/painel');
  });

  test('CNPJ que nenhuma fonte tem: empresa não encontrada', async ({ page }) => {
    await signIn(page);

    await cnpjField(page).fill('99.999.998/0001-47');
    await cnpjField(page).press('Enter');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Empresa não encontrada');
    await expect(page.getByText('Empresa não encontrada para o CNPJ informado.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toHaveCount(0);
  });

  test('o menu "Empresas" leva à consulta, que abre o perfil', async ({ page }, testInfo) => {
    await signIn(page);

    if (testInfo.project.name === 'celular') {
      await page.getByRole('button', { name: 'Menu do painel' }).click();
    }
    await page
      .getByRole('navigation', { name: 'Áreas do painel' })
      .getByRole('link', { name: /Empresas/ })
      .click();

    await expect(page).toHaveURL('/empresas');
    await expect(page).toHaveTitle('Empresas — BIOS');
    await cnpjField(page).fill('33.042.730/0001-04');
    await cnpjField(page).press('Enter');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'COMPANHIA SIDERURGICA NACIONAL',
    );
  });

  test('na barra do topo (tela larga), o CNPJ abre o perfil', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'celular', 'a barra só tem o campo em tela larga');
    await signIn(page);

    const toolbarField = page.getByRole('banner').getByLabel('Buscar empresa por CNPJ ou nome');
    await toolbarField.fill('47960950000121');
    await toolbarField.press('Enter');

    await expect(page).toHaveURL('/empresas/47960950000121');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('MAGAZINE LUIZA S/A');
  });
});
