import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const EMAIL = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';
const NEW_PASSWORD = 'novaSenha2026';
const SENT_MESSAGE =
  'Se houver uma conta ativa com este e-mail, enviamos um link para redefinir a senha.';

async function signIn(page: Page, password: string) {
  await page.getByLabel('E-mail').fill(EMAIL);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

/** Navega dentro do app, sem recarregar a página. */
async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    history.pushState({}, '', target);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
}

// O mock recomeça a cada carga da página: cada fluxo navega por cliques e pelo histórico.
test.describe('senha (#22)', () => {
  test('esqueci a senha: o link do aviso redefine a senha, e a nova entra', async ({
    page,
  }, testInfo) => {
    await page.goto('/entrar');
    await page.getByRole('link', { name: 'Esqueci a senha' }).click();
    await expect(page).toHaveURL('/esqueci-senha');
    await expect(page).toHaveTitle('Esqueci a senha — BIOS');

    await page.getByLabel('E-mail').fill(EMAIL);
    await page.getByRole('button', { name: 'Enviar link' }).click();
    await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeFocused();
    await expect(page.getByRole('status')).toHaveText(SENT_MESSAGE);
    await expectAccessible(page, testInfo, 'pedido de redefinição enviado');

    await page.getByRole('link', { name: 'Redefinir a senha' }).click();
    await expect(page).toHaveURL(/\/redefinir-senha\/[^/]+$/);
    await expect(
      page.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.'),
    ).toBeVisible();
    await expectAccessible(page, testInfo, 'nova senha');

    await page.getByLabel('Nova senha').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();

    await expect(page).toHaveURL('/entrar?senha=redefinida');
    await expect(page.getByRole('status')).toHaveText(
      'Sua senha foi redefinida e todas as sessões foram encerradas. Entre com a nova senha.',
    );
    await signIn(page, NEW_PASSWORD);
    await expect(page).toHaveURL('/painel');
  });

  test('e-mail sem conta recebe a mesma mensagem, e nada chega', async ({ page }) => {
    await page.goto('/esqueci-senha');

    await page.getByLabel('E-mail').fill('ninguem@example.com');
    await page.getByRole('button', { name: 'Enviar link' }).click();

    await expect(page.getByRole('status')).toHaveText(SENT_MESSAGE);
    await expect(page.getByRole('complementary', { name: 'Modo apresentação' })).toContainText(
      'não recebeu e-mail com link',
    );
  });

  test('troca de senha: a atual errada marca o campo; a certa encerra a sessão', async ({
    page,
  }, testInfo) => {
    await page.goto('/entrar');
    await signIn(page, PASSWORD);
    await expect(page).toHaveURL('/painel');

    await navigateInApp(page, '/conta/senha');
    await expect(page.getByRole('heading', { name: 'Alterar a senha' })).toBeVisible();
    await expectAccessible(page, testInfo, 'troca de senha');

    const current = page.getByLabel('Senha atual');
    await current.fill('senha-errada');
    await page.getByLabel('Nova senha').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByText('A senha atual está incorreta.')).toBeVisible();
    await expect(current).toHaveAttribute('aria-invalid', 'true');

    await current.fill(PASSWORD);
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();

    await expect(page).toHaveURL('/entrar?senha=alterada');
    await expect(page.getByRole('status')).toHaveText(
      'Sua senha foi alterada e todas as sessões foram encerradas. Entre com a nova senha.',
    );
    await signIn(page, PASSWORD);
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
    await signIn(page, NEW_PASSWORD);
    await expect(page).toHaveURL('/painel');
  });
});
