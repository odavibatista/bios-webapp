import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page, path: string) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
  await page.goto(path);
}

const ufField = (page: Page) => page.getByRole('combobox', { name: 'UF' });

test.describe('estados da pesquisa (#266)', () => {
  test('UF inexistente avisa, e o campo fica em "Todas"', async ({ page }) => {
    await signIn(page, '/pesquisa?uf=XX');

    await expect(page.getByText('A UF XX não existe.', { exact: false })).toBeVisible();
    await expect(ufField(page)).toContainText('Todas');
  });

  test('o exterior aparece no campo UF', async ({ page }) => {
    await signIn(page, '/pesquisa?uf=EX');

    await expect(ufField(page)).toContainText('Exterior');
    await expect(page.getByLabel('Município')).toBeDisabled();
  });

  test('página além da última leva à última', async ({ page }) => {
    await signIn(page, '/pesquisa?uf=SP&pagina=999999');

    await expect(page).toHaveURL(/uf=SP$/);
    await expect(page.getByRole('status').filter({ hasText: /encontrada/ })).toBeVisible();
    await expect(page.getByText(/Nenhuma empresa atende/)).toHaveCount(0);
  });
});
