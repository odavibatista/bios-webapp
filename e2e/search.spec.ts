import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

/** Entra pela tela de login e cai na pesquisa (recarregar a página encerraria a sessão). */
async function signInToSearch(page: Page, query = '') {
  await page.goto(`/entrar?voltar=${encodeURIComponent(`/pesquisa${query}`)}`);
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(`/pesquisa${query}`);
}

test.describe('pesquisa de empresas (#25)', () => {
  test('sem critério, explica que é preciso ao menos um', async ({ page }) => {
    await signInToSearch(page);

    await page.getByRole('button', { name: 'Pesquisar' }).click();

    await expect(page.getByRole('alert')).toContainText('Informe ao menos um critério');
    await expect(page).toHaveURL('/pesquisa');
    await expect(page.getByLabel('Índice mínimo')).toBeDisabled();
  });

  test('pesquisa por CNAE e ODS, pagina e volta pelo navegador', async ({ page }, testInfo) => {
    await signInToSearch(page);
    await expectAccessible(page, testInfo, 'formulário da pesquisa');

    await page.getByLabel('CNAE').fill('24');
    await page.getByRole('combobox', { name: 'ODS' }).click();
    await page.getByRole('option', { name: /^ODS 13 — / }).click();
    await page.getByRole('button', { name: 'Pesquisar' }).click();

    await expect(page).toHaveURL('/pesquisa?cnae=24&ods=13');
    await expect(page.getByRole('status')).toHaveText('10 empresas encontradas');
    await expect(page.getByText(/não é nota baixa/)).toBeVisible();
    await expectAccessible(page, testInfo, 'resultados com ODS');

    await page.getByLabel('Itens por página').selectOption('10');
    await expect(page).toHaveURL('/pesquisa?cnae=24&ods=13&por_pagina=10');
    await expect(page.getByText('Página 1 de 1')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/pesquisa?cnae=24&ods=13');
    await page.goBack();
    await expect(page).toHaveURL('/pesquisa');
    await expect(page.getByLabel('CNAE')).toHaveValue('');
  });

  test('em tela larga é tabela; no celular, cartões, sem rolar a página', async ({
    page,
  }, testInfo) => {
    await signInToSearch(page, '?cnae=24&ods=15');

    await expect(page.getByRole('status')).toHaveText('10 empresas encontradas');
    if (testInfo.project.name === 'celular') {
      await expect(page.getByRole('list', { name: 'Empresas encontradas' })).toBeVisible();
      await expect(page.getByRole('table')).toHaveCount(0);
    } else {
      await expect(page.getByRole('columnheader', { name: 'Confiança no ODS 15' })).toBeVisible();
    }
  });

  test('ordena pelo índice em ambos os sentidos e mantém empresas sem índice ao fim', async ({
    page,
  }, testInfo) => {
    await signInToSearch(page, '?cnae=24&ods=13');
    await expect(page.getByRole('status')).toHaveText('10 empresas encontradas');

    const order = page.getByRole('combobox', { name: 'Ordenar pelo índice' });
    for (const [direction, option, ariaSort] of [
      ['desc', 'Maior índice primeiro', 'descending'],
      ['asc', 'Menor índice primeiro', 'ascending'],
    ] as const) {
      await order.focus();
      await order.press('Enter');
      await page.getByRole('option', { name: option }).click();
      await page.getByRole('button', { name: 'Pesquisar' }).click();
      await expect(page).toHaveURL(`/pesquisa?cnae=24&ods=13&ordem=${direction}`);
      await expect(page.getByRole('status')).toHaveText('10 empresas encontradas');

      const scoreCells =
        testInfo.project.name === 'celular'
          ? page.locator('.cards article dl > div:nth-child(5) dd')
          : page.locator('tbody tr:has(th a) td:nth-last-child(2)');
      await expect(scoreCells).toHaveCount(10);
      const scores = await scoreCells.allTextContents();
      const numeric = scores
        .filter((score) => score.trim() !== 'Sem índice')
        .map((score) => Number(score.trim().replace(',', '.')));
      expect(numeric.length).toBeGreaterThan(0);
      expect(numeric).toEqual([...numeric].sort((a, b) => (direction === 'asc' ? a - b : b - a)));
      expect(scores.slice(numeric.length).every((score) => score.trim() === 'Sem índice')).toBe(
        true,
      );
      await expect(page.getByText('Sem índice calculado — apresentados ao fim')).toBeVisible();
      if (testInfo.project.name !== 'celular') {
        await expect(page.getByRole('columnheader', { name: 'Índice no ODS 13' })).toHaveAttribute(
          'aria-sort',
          ariaSort,
        );
      }
      await expectAccessible(page, testInfo, `resultados ordenados ${direction}`);
    }

    await page.goBack();
    await expect(page).toHaveURL('/pesquisa?cnae=24&ods=13&ordem=desc');
    await expect(order).toContainText('Maior índice primeiro');
  });

  test('ODS fora dos calculados mostra os disponíveis', async ({ page }) => {
    await signInToSearch(page, '?cnae=24&ods=7');

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('O ODS 7 não é calculado pelo BIOS.');
    await alert.getByRole('button', { name: /^ODS 13 — / }).click();

    await expect(page).toHaveURL('/pesquisa?cnae=24&ods=13');
  });

  test('nenhum resultado sugere afrouxar os filtros', async ({ page }) => {
    await signInToSearch(page, '?nome=empresa%20inexistente%20demonstracao');

    await expect(page.getByText(/Nenhuma empresa atende aos filtros/)).toBeVisible();
  });

  test('pagina com o tamanho da URL', async ({ page }) => {
    await signInToSearch(page, '?cnae=24&por_pagina=5');

    await expect(page.getByText('Página 1 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'Próxima página' }).click();

    await expect(page).toHaveURL('/pesquisa?cnae=24&pagina=2&por_pagina=5');
    await expect(page.getByText('Página 2 de 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });
});
