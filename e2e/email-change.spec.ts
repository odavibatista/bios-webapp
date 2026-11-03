import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const CURRENT = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';
const NEW_EMAIL = 'novo.endereco@example.com';
const REQUESTED =
  'Se o e-mail puder ser usado, enviamos um link de confirmação para ele. A troca só vale depois que você abrir o link.';

async function signIn(page: Page, email = CURRENT) {
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

/** Entra e abre "Minha conta" pelo menu da barra, sem recarregar a página. */
async function openAccount(page: Page) {
  await page.goto('/entrar');
  await signIn(page);
  await page
    .getByRole('banner')
    .getByRole('button', { name: /Conta de Demonstração/ })
    .click();
  await page.getByRole('menuitem', { name: /Minha conta/ }).click();
  await expect(page).toHaveURL('/conta');
}

function emailSection(page: Page) {
  return page.getByRole('region', { name: 'Trocar e-mail' });
}

async function requestChange(page: Page, newEmail: string, password = PASSWORD) {
  const section = emailSection(page);

  await section.getByLabel('Novo e-mail').fill(newEmail);
  await section.getByLabel('Senha atual', { exact: true }).fill(password);
  await section.getByRole('button', { name: 'Enviar link de confirmação' }).click();
}

test.describe('troca de e-mail (#29)', () => {
  test('pede a troca, o e-mail atual vale até o link, e o link efetiva a troca', async ({
    page,
  }, testInfo) => {
    await openAccount(page);
    await expectAccessible(page, testInfo, 'conta com a troca de e-mail');

    await requestChange(page, NEW_EMAIL, 'senha-errada');
    await expect(emailSection(page).getByText('A senha atual está incorreta.')).toBeVisible();

    await requestChange(page, NEW_EMAIL);
    await expect(emailSection(page).getByRole('status')).toHaveText(REQUESTED);
    await expect(page.getByRole('region', { name: 'Seus dados' })).toContainText(CURRENT);

    await emailSection(page).getByRole('link', { name: 'Confirmar o novo e-mail' }).click();
    await expect(page).toHaveURL(/\/confirmar-novo-email\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'E-mail atualizado' })).toBeVisible();
    await expectAccessible(page, testInfo, 'novo e-mail confirmado');

    await page.getByRole('link', { name: 'Ver minha conta' }).click();
    await expect(page.getByRole('region', { name: 'Seus dados' })).toContainText(NEW_EMAIL);

    // O novo e-mail é o que entra agora.
    await page
      .getByRole('banner')
      .getByRole('button', { name: /Conta de Demonstração/ })
      .click();
    await page.getByRole('menuitem', { name: 'Sair', exact: true }).click();
    await expect(page).toHaveURL('/entrar');
    await signIn(page, NEW_EMAIL);
  });

  test('e-mail de outra conta recebe a mesma resposta, e nenhum link chega', async ({ page }) => {
    await openAccount(page);

    await requestChange(page, 'administracao@example.com');

    await expect(emailSection(page).getByRole('status')).toHaveText(REQUESTED);
    await expect(
      emailSection(page).getByRole('complementary', { name: 'Modo apresentação' }),
    ).toContainText('não recebeu e-mail com link');
  });
});
