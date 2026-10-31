import { expect, test } from './support/test';

// O painel com sessão (menu por papel, acesso negado) está em `login.spec.ts`.
test.describe('painel sem sessão', () => {
  test('o painel leva ao login, guardando o destino', async ({ page }) => {
    await page.goto('/painel');

    await expect(page).toHaveURL('/entrar?voltar=%2Fpainel');
  });

  test('a administração também leva ao login', async ({ page }) => {
    await page.goto('/admin/dominios-bloqueados');

    await expect(page).toHaveURL('/entrar?voltar=%2Fadmin%2Fdominios-bloqueados');
  });

  test('a página inicial convida a entrar e a criar conta', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar');
    await expect(page.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
  });
});
