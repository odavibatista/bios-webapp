import type { Page } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll } from './support/accessibility';
import { expect, test } from './support/test';

async function openProfile(page: Page, cnpj: string) {
  const path = `/empresas/${cnpj}`;

  await page.goto(`/entrar?voltar=${encodeURIComponent(path)}`);
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(path);
  await expect(
    page.getByRole('heading', { name: 'Evolução do índice', exact: true }),
  ).toBeVisible();
}

const cardOf = (page: Page, ods: number) =>
  page.locator('bios-chart-card', {
    has: page.getByRole('heading', { name: `Evolução do índice no ODS ${String(ods)}` }),
  });

test.describe('evolução do índice no perfil (#233)', () => {
  test('mostra os degraus, o aviso e a tabela, sem variação', async ({ page }, testInfo) => {
    await openProfile(page, '04735087000104');
    const card = cardOf(page, 15);

    await expect(
      page.getByText(
        'Série reconstruída com as regras atuais, a partir das evidências disponíveis hoje.',
      ),
    ).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('bios-chart-canvas [role="img"]')).toBeVisible();
    await expect(card.locator('bios-chart-canvas svg')).not.toContainText(
      /(Feb|Apr|May|Aug|Sep|Oct|Dec)/,
    );
    await expectNoHorizontalScroll(page);
    await expectAccessible(page, testInfo, 'evolução do índice');

    await card.getByRole('radio', { name: 'Tabela' }).click();

    await expect(card.getByRole('columnheader', { name: 'Data' })).toBeVisible();
    await expect(card.getByRole('columnheader', { name: 'Evidência' })).toBeVisible();
    await expect(card.getByRole('columnheader', { name: 'Índice' })).toBeVisible();
    await expect(card).not.toContainText(/melhorou|piorou|%/i);
  });

  test('ODS com um único ano explica, com mensagem própria', async ({ page }) => {
    await openProfile(page, '04735087000104');

    await expect(cardOf(page, 13)).toContainText(
      'Ainda não há histórico para mostrar a evolução. As evidências desta empresa estão em um único ano.',
    );
  });

  test('a lista da tela principal segue sem série', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill('apresentacao@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL('/painel');

    await expect(page.getByRole('heading', { name: 'Movimentações recentes' })).toBeVisible();
    await expect(page.locator('bios-movement-card bios-chart-canvas')).toHaveCount(0);
  });
});
