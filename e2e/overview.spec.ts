import type { Page } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll } from './support/accessibility';
import { expect, test } from './support/test';

async function signIn(page: Page, path: string) {
  await page.goto(`/entrar?voltar=${encodeURIComponent(path)}`);
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(path);
}

const totals = (page: Page) => page.locator('bios-overview-totals');

/** Os cards só desenham ao entrar na tela: leva o primeiro com gráfico até ela. */
async function firstChart(page: Page) {
  await page
    .locator('bios-chart-card', { has: page.getByRole('radio') })
    .first()
    .scrollIntoViewIfNeeded();

  return page.locator('bios-chart-canvas [role="img"]').first();
}

test.describe('panorama de dados (#234)', () => {
  test('a pesquisa abre no panorama, e a lista fica na outra aba', async ({ page }) => {
    await signIn(page, '/pesquisa');

    await expect(page.getByRole('heading', { name: 'Panorama', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Situação cadastral' })).toBeVisible();
    await expect(totals(page)).toContainText('Empresas na base');
    await expect(totals(page)).toContainText('Valor lançado em multas');
    await expect(totals(page)).toContainText('Não representam todas as empresas do Brasil.');

    await page.getByRole('tab', { name: 'Resultados' }).click();

    await expect(page).toHaveURL('/pesquisa?visao=resultados');
    await expect(page.getByText('Escolha ao menos um critério e pesquise.')).toBeVisible();
  });

  test('o filtro atualiza totais e gráficos e continua na URL', async ({ page }) => {
    await signIn(page, '/pesquisa?visao=panorama');
    const companies = totals(page).locator('dd').first();

    await expect(companies).not.toHaveText('0');
    const before = await companies.textContent();

    await page.getByLabel('Nome da empresa').fill('SIDERMIN');
    await page.getByRole('button', { name: 'Pesquisar', exact: true }).click();

    await expect(page).toHaveURL('/pesquisa?nome=SIDERMIN&visao=panorama');
    await expect(companies).toHaveText('1');
    expect(before).not.toBe('1');
    await expect(page.getByText('Só uma categoria neste recorte:').first()).toBeVisible();
    await expect(page.getByText('Só 1 empresa com índice no ODS 15').first()).toBeVisible();
  });

  test('pesquisar sem escolher a aba leva à lista', async ({ page }) => {
    await signIn(page, '/pesquisa');

    await page.getByLabel('Nome da empresa').fill('SIDERMIN');
    await page.getByRole('button', { name: 'Pesquisar', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Resultados' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'encontrada' })).toBeVisible();
    await expect(totals(page).locator('dd').first()).toHaveText('1');
  });

  test('o teclado troca o gráfico pela tabela, com os mesmos números', async ({ page }) => {
    await signIn(page, '/pesquisa');
    const card = page.locator('bios-chart-card', {
      has: page.getByRole('heading', { name: 'Situação cadastral' }),
    });

    await expect(await firstChart(page)).toBeVisible();
    await card.getByRole('radio', { name: 'Gráfico' }).focus();
    await page.keyboard.press('ArrowRight');

    await expect(card.getByRole('table')).toBeVisible();
    await expect(card.getByRole('columnheader', { name: 'Situação' })).toBeVisible();
    await expect(card.locator('bios-chart-canvas')).toHaveCount(0);
  });

  for (const width of [320, 1920]) {
    test(`a rosca mostra percentuais em ${width} px e repete os valores na tabela (#251)`, async ({
      page,
    }) => {
      test.skip(test.info().project.name === 'celular', 'Largura definida pelo teste.');
      await page.setViewportSize({ width, height: 900 });
      await signIn(page, '/pesquisa');
      const card = page.locator('bios-chart-card', {
        has: page.getByRole('heading', { name: 'Situação cadastral' }),
      });
      await expect(await firstChart(page)).toBeVisible();
      const entries = card.getByRole('listitem');

      await expect(entries.first()).toContainText(/\d+,\d%/);
      for (const entry of await entries.all()) {
        await entry.scrollIntoViewIfNeeded();
        await expect(entry).toBeInViewport({ ratio: 1 });
      }

      await card.getByRole('radio', { name: 'Tabela' }).click();
      await expect(card.getByRole('columnheader', { name: 'Percentual' })).toBeVisible();
      await expect(card.getByRole('table')).toContainText(/\d+,\d%/);
    });
  }

  test('cada gráfico tem nome próprio, sem citar empresas', async ({ page }) => {
    await signIn(page, '/pesquisa');

    await expect(await firstChart(page)).toBeVisible();

    const names = await page
      .locator('bios-chart-canvas [role="img"]')
      .evaluateAll((charts) => charts.map((chart) => chart.getAttribute('aria-label')));

    expect(new Set(names).size).toBe(names.length);
    await expect(page.locator('main')).not.toContainText('ARCELORMITTAL');
  });

  for (const width of [320, 390, 1024, 1440]) {
    test(`sem rolagem horizontal em ${width} px, com a tela acessível`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'celular', 'Largura definida pelo teste.');
      await page.setViewportSize({ width, height: 900 });
      await signIn(page, '/pesquisa');

      await expect(await firstChart(page)).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page, testInfo, `panorama em ${width} px`);
    });
  }

  test('a tela principal resume a base e leva ao panorama', async ({ page }) => {
    await signIn(page, '/painel');

    await expect(page.getByRole('heading', { name: 'A base em números' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver o panorama completo' }).click();

    await expect(page).toHaveURL('/pesquisa?visao=panorama');
    await expect(page.getByRole('heading', { name: 'Panorama', exact: true })).toBeVisible();
  });
});
