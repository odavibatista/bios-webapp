import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { openPanelArea } from './support/panel-menu';
import { expect, test } from './support/test';

/** Entra com a conta de demonstração e chega ao painel. */
async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

/** Campo completo da página de consulta. */
function cnpjField(page: Page) {
  return page.getByRole('main').getByLabel('CNPJ ou nome da empresa', { exact: true });
}

function toolbarField(page: Page) {
  return page.getByRole('banner').getByLabel('Buscar empresa por CNPJ ou nome');
}

test.describe('perfil da empresa (#24)', () => {
  test('em 1280 por 800, o índice aparece antes dos dados completos sem rolagem horizontal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signIn(page);
    await toolbarField(page).fill('00.990.842/0001-38');
    await toolbarField(page).press('Enter');

    const summary = page.getByRole('region', { name: 'Resumo cadastral' });
    const scores = page.getByRole('region', { name: 'Índices por ODS' });
    const data = page.getByRole('region', { name: 'Dados cadastrais' });
    await expect(summary).toContainText('2431-8/00');
    await expect(scores).toBeVisible();
    const scoreBox = await scores.getByRole('heading', { name: 'Índices por ODS' }).boundingBox();
    const dataBox = await data.boundingBox();
    expect(scoreBox!.y).toBeLessThan(800);
    expect(scoreBox!.y).toBeLessThan(dataBox!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      1280,
    );
  });

  test('CNPJ com máscara, no painel, abre o perfil com os dados cadastrais', async ({
    page,
  }, testInfo) => {
    await signIn(page);

    await toolbarField(page).fill('00.990.842/0001-38');
    await toolbarField(page).press('Enter');

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
    const ods15 = scores.getByRole('article', { name: 'ODS 15' });
    await ods15.getByText('Como o índice foi calculado para o ODS 15').click();
    await expect(ods15.getByText('Soma dos pontos:')).toContainText('-80');
    await expect(ods15.getByText('Pontos: -40')).toHaveCount(2);
    await ods15.getByRole('button', { name: 'Ver evidência no perfil' }).first().click();
    await expect(
      page
        .getByRole('region', { name: 'Evidências' })
        .getByRole('article')
        .filter({ hasText: '343440-D' }),
    ).toBeFocused();
    await expect(page).toHaveURL('/empresas/00990842000138');
    await expectAccessible(page, testInfo, 'perfil da empresa');
  });

  test('CNPJ inválido no cabeçalho mostra aviso sem sair da tela', async ({ page }, testInfo) => {
    await signIn(page);

    await toolbarField(page).fill('00.990.842/0001-39');
    await toolbarField(page).press('Enter');

    await expect(page.getByText('Informe um CNPJ ou nome válido para pesquisar')).toBeVisible();
    await expectAccessible(page, testInfo, 'aviso de busca inválida');
    await expect(toolbarField(page)).toHaveValue('00.990.842/0001-39');
    await expect(page).toHaveURL('/painel');
  });

  test('CNPJ que nenhuma fonte tem: empresa não encontrada', async ({ page }) => {
    await signIn(page);

    await toolbarField(page).fill('99.999.998/0001-47');
    await toolbarField(page).press('Enter');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Empresa não encontrada');
    await expect(page.getByText('Empresa não encontrada para o CNPJ informado.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toHaveCount(0);
  });

  test('o menu "Empresas" leva à consulta, que abre o perfil', async ({ page }) => {
    await signIn(page);

    await openPanelArea(page, /Empresas/);

    await expect(page).toHaveURL('/empresas');
    await expect(page).toHaveTitle('Empresas — BIOS');
    await cnpjField(page).fill('33.042.730/0001-04');
    await cnpjField(page).press('Enter');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'COMPANHIA SIDERURGICA NACIONAL',
    );
  });

  test('na barra do topo, o CNPJ abre o perfil', async ({ page }) => {
    await signIn(page);

    await toolbarField(page).fill('47960950000121');
    await toolbarField(page).press('Enter');

    await expect(page).toHaveURL('/empresas/47960950000121');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('MAGAZINE LUIZA S/A');
  });

  test('busca inválida no cabeçalho mostra aviso e não navega', async ({ page }) => {
    await signIn(page);
    const field = toolbarField(page);
    const button = page.getByRole('banner').getByRole('button', { name: 'Buscar empresa' });

    for (const value of ['', 'AB', '123', 'ACME; DROP TABLE empresas']) {
      await field.fill(value);
      await button.click();
      await expect(page).toHaveURL('/painel');
      await expect(page.getByText('Informe um CNPJ ou nome válido para pesquisar')).toBeVisible();
    }

    await field.fill('Cearense');
    await button.click();
    await expect(page).toHaveURL('/empresas?nome=Cearense');
  });
});
