import { expectAccessible, expectNoHorizontalScroll } from './support/accessibility';
import { expect, test } from './support/test';

test.describe('página inicial', () => {
  test('abre em português, com a marca e os ODS calculados', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('BIOS');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('link', { name: 'BIOS, página inicial' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('evidência por evidência');
    await expect(page.getByText('ODS 13', { exact: true })).toBeVisible();
    await expect(page.getByText('ODS 15', { exact: true })).toBeVisible();
  });

  test('o atalho de teclado leva direto ao conteúdo', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  });
});

test('rota inexistente mostra a página de não encontrado e volta ao início', async ({
  page,
}, testInfo) => {
  await page.goto('/rota-que-nao-existe');

  await expect(page).toHaveTitle('Página não encontrada — BIOS');
  await expectAccessible(page, testInfo, 'não encontrado');
  await expectNoHorizontalScroll(page, 'não encontrado');

  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page).toHaveURL('/');
});
