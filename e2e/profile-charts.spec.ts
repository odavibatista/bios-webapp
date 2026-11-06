import type { Page } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll } from './support/accessibility';
import { signIn } from './support/session';
import { expect, test } from './support/test';

async function openProfile(page: Page, cnpj: string) {
  const path = `/empresas/${cnpj}`;

  await signIn(page, path);
  await expect(page.getByRole('heading', { name: 'Evidências em gráficos' })).toBeVisible();
}

test.describe('gráficos do perfil (#232)', () => {
  test('mostra a linha do tempo e a tabela com os mesmos números', async ({ page }, testInfo) => {
    await openProfile(page, '04735087000104');
    const card = page.locator('bios-chart-card', {
      has: page.getByRole('heading', { name: 'Linha do tempo' }),
    });

    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('[role="img"][aria-label]').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page, testInfo, 'gráficos do perfil');

    await card.getByRole('radio', { name: 'Tabela' }).click();

    await expect(card.getByRole('columnheader', { name: 'Ano' })).toBeVisible();
    await expect(card.getByRole('columnheader', { name: 'Evidências' })).toBeVisible();
  });

  test('cada fonte diz o que respondeu', async ({ page }) => {
    await openProfile(page, '04735087000104');
    const sources = page.getByRole('region', { name: 'Resultado por fonte' });

    await expect(sources.getByRole('listitem')).toHaveCount(4);
    await expect(sources).toContainText('Ausência de registro não é ponto positivo nem negativo.');
  });
});
