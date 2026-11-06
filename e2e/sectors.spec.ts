import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { signIn } from './support/session';
import { expect, test } from './support/test';

/** Navega dentro do app, sem recarregar a página. */
async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    history.pushState({}, '', target);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
}

test.describe('evolução por setor (#26)', () => {
  test('abre a divisão 47 no ODS 15 sem adicionar histórico e oferece três atalhos', async ({
    page,
  }) => {
    await signIn(page);
    await navigateInApp(page, '/setores');

    await expect(page).toHaveURL('/setores?cnae=47&ods=15');
    await expect(page.getByRole('combobox', { name: 'Setor (CNAE)' })).toHaveValue('47');
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 15');
    const popular = page.getByRole('region', { name: 'Setores com mais empresas na base' });
    await expect(popular.getByRole('button')).toHaveCount(3);
    await popular.getByRole('button', { name: /16 — Fabricação de produtos de madeira/ }).click();
    await expect(page).toHaveURL('/setores?cnae=16&ods=15');
    await page.goBack();
    await expect(page).toHaveURL('/setores?cnae=47&ods=15');
    await page.goBack();
    await expect(page).toHaveURL('/painel');
  });

  test('limpa o CNAE e permite escolher outro setor', async ({ page }) => {
    await signIn(page);
    await navigateInApp(page, '/setores?cnae=24&ods=13');
    const sector = page.getByRole('combobox', { name: 'Setor (CNAE)' });
    await expect(sector).toHaveValue('24');

    await page.getByRole('button', { name: 'Limpar setor' }).click();
    await expect(sector).toHaveValue('');
    await expect(page).toHaveURL('/setores?ods=13');
    await expect(page.getByText('Escolha um setor e um ODS para ver a evolução.')).toBeVisible();
    await expect(sector).toBeFocused();
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 13');

    await sector.fill('47');
    await page.getByRole('option', { name: /^47 — / }).click();
    await page.getByRole('button', { name: 'Ver evolução' }).click();
    await expect(page).toHaveURL('/setores?cnae=47&ods=13');
  });

  test('escolhe o setor pela sugestão e vê o histórico real: insuficiente, com o mês registrado', async ({
    page,
  }, testInfo) => {
    await signIn(page);
    await navigateInApp(page, '/setores');

    await expect(page).toHaveTitle('Evolução por setor — BIOS');
    await expect(page).toHaveURL('/setores?cnae=47&ods=15');
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 15');
    await expectAccessible(page, testInfo, 'escolha do setor');

    const sector = page.getByRole('combobox', { name: 'Setor (CNAE)' });
    await sector.fill('metal');
    await page.getByRole('option', { name: '24 — METALURGIA' }).click();
    await page.getByRole('combobox', { name: 'ODS' }).click();
    await page.getByRole('option', { name: /ODS 13/ }).click();
    await page.getByRole('button', { name: 'Ver evolução' }).click();

    await expect(page).toHaveURL('/setores?cnae=24&ods=13');
    await expect(
      page.getByText('Ainda não há janelas suficientes para mostrar a evolução deste setor.'),
    ).toBeVisible();
    const table = page.getByRole('table', { name: /Mês registrado de 24 — METALURGIA no ODS 13/ });
    await expect(table.getByRole('row').nth(1)).toContainText('outubro de 2026');
    await expectAccessible(page, testInfo, 'histórico insuficiente');
  });

  test('média omitida aparece como lacuna explicada, e o voltar do navegador refaz a consulta', async ({
    page,
  }) => {
    await signIn(page);
    await navigateInApp(page, '/setores?cnae=24&ods=13');
    await expect(page.getByRole('heading', { level: 2, name: /24 — METALURGIA/ })).toBeVisible();

    const sector = page.getByRole('combobox', { name: 'Setor (CNAE)' });
    await sector.fill('47');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Ver evolução' }).click();

    await expect(page).toHaveURL('/setores?cnae=47&ods=13');
    await expect(page.getByRole('table').getByRole('row').nth(1)).toContainText('Omitida');
    await expect(page.getByText(/Média omitida: o setor tem menos empresas/)).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/setores?cnae=24&ods=13');
    await expect(page.getByRole('heading', { level: 2, name: /24 — METALURGIA/ })).toBeVisible();
    await expect(sector).toHaveValue('24');
  });

  test('CNAE fora do formato não sai da tela e mostra a mensagem da API no campo', async ({
    page,
  }) => {
    await signIn(page);
    await navigateInApp(page, '/setores');
    // A página está pronta quando os ODS chegam; antes, o envio pode cair no meio da carga.
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 15');

    await page.getByRole('combobox', { name: 'Setor (CNAE)' }).fill('2431');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Ver evolução' }).click();

    await expect(
      page.getByText(
        'CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse.',
      ),
    ).toBeVisible();
    await expect(page).toHaveURL('/setores?cnae=47&ods=15');
  });
});
