import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const SUCCESS_MESSAGE =
  'Se o e-mail puder ser cadastrado, enviamos um link de confirmação. Verifique sua caixa de entrada.';

/** Preenche o cadastro só pelo teclado e envia com Enter. */
async function registerByKeyboard(page: Page, email: string) {
  await page.getByLabel('Nome').focus();
  await page.keyboard.type('Nova Pessoa');
  await page.keyboard.press('Tab');
  await page.keyboard.type(email);
  await page.keyboard.press('Tab');
  await page.keyboard.type('senha123');
  await page.keyboard.press('Enter');
}

// O mock recomeça a cada carga da página: o fluxo inteiro navega por cliques e pelo histórico.
test.describe('cadastro e confirmação de e-mail (#19)', () => {
  test('cria a conta, confirma pelo link do aviso e não reaproveita o link usado', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Criar conta' }).click();
    await expect(page).toHaveURL('/cadastro');
    await expect(page).toHaveTitle('Criar conta — BIOS');
    await expect(
      page.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.'),
    ).toBeVisible();
    await expectAccessible(page, testInfo, 'formulário de cadastro');

    await registerByKeyboard(page, 'nova.pessoa@example.com');

    await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeFocused();
    await expect(page.getByRole('status')).toHaveText(SUCCESS_MESSAGE);
    await expectAccessible(page, testInfo, 'cadastro enviado');

    await page.getByRole('link', { name: 'Confirmar o e-mail' }).click();
    await expect(page).toHaveURL(/\/confirmar-email\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'E-mail confirmado' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entrar' }).last()).toHaveAttribute(
      'href',
      '/entrar',
    );
    await expectAccessible(page, testInfo, 'e-mail confirmado');

    // Abrir o mesmo link de novo: já foi usado (fluxo 6.1).
    await page.goBack();
    await page.goForward();
    await expect(
      page.getByText('O link é inválido, expirou ou já foi usado. Solicite um novo.'),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Pedir um novo link' }).click();

    await expect(page).toHaveURL('/reenviar-confirmacao');
    await page.getByLabel('E-mail').fill('nova.pessoa@example.com');
    await page.getByRole('button', { name: 'Enviar novo link' }).click();
    await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeFocused();
    // A conta já está ativa: nenhum link novo chega.
    await expect(page.getByRole('complementary', { name: 'Modo apresentação' })).toContainText(
      'não recebeu e-mail com link',
    );
  });

  test('e-mail já cadastrado recebe a mesma tela do sucesso', async ({ page }) => {
    await page.goto('/cadastro');

    await registerByKeyboard(page, 'apresentacao@example.com');

    await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(SUCCESS_MESSAGE);
  });

  test('domínio bloqueado mostra a mensagem genérica da API', async ({ page }) => {
    await page.goto('/cadastro');

    await registerByKeyboard(page, 'demonstracao@0-mail.com');

    await expect(page.getByRole('alert')).toHaveText(
      'Não é possível usar este endereço de e-mail. Informe outro.',
    );
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('dados fora das regras não saem da tela e o foco vai ao primeiro erro', async ({ page }) => {
    await page.goto('/cadastro');

    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByLabel('Nome')).toBeFocused();
    await expect(page.getByText('O nome deve ter ao menos 2 caracteres.')).toBeVisible();
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  });
});
