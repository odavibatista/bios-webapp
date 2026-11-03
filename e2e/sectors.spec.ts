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

/** Navega dentro do app, sem recarregar a página (recarregar encerra a sessão local). */
async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    history.pushState({}, '', target);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
}

test.describe('evolução por setor (#26)', () => {
  test('escolhe o setor pela sugestão e vê o histórico real: insuficiente, com o mês registrado', async ({
    page,
  }, testInfo) => {
    await signIn(page);
    await navigateInApp(page, '/setores');

    await expect(page).toHaveTitle('Evolução por setor — BIOS');
    await expect(page.getByText('Escolha um setor e um ODS para ver a evolução.')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 13');
    await expectAccessible(page, testInfo, 'escolha do setor');

    const sector = page.getByRole('combobox', { name: 'Setor (CNAE)' });
    await sector.fill('metal');
    await page.getByRole('option', { name: '24 — METALURGIA' }).click();
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
    await expect(page.getByRole('combobox', { name: 'ODS' })).toContainText('ODS 13');

    await page.getByRole('combobox', { name: 'Setor (CNAE)' }).fill('2431');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Ver evolução' }).click();

    await expect(
      page.getByText(
        'CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse.',
      ),
    ).toBeVisible();
    await expect(page).toHaveURL('/setores');
  });
});
