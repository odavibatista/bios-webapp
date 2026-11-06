import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { openPanelArea } from './support/panel-menu';
import { expect, test } from './support/test';

const USER = 'apresentacao@example.com';
const ADMIN = 'administracao@example.com';
const PASSWORD = 'Apresentacao2026';

/** Entra só pelo teclado e envia com Enter. */
async function signInByKeyboard(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail').focus();
  await page.keyboard.type(email);
  await page.keyboard.press('Tab');
  await page.keyboard.type(password);
  await page.keyboard.press('Enter');
}

/** Navega dentro do app, sem recarregar a página. */
async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    history.pushState({}, '', target);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
}

test.describe('login (#20)', () => {
  test('e-mail e senha têm a mesma largura, com botão de senha acessível', async ({ page }) => {
    await page.goto('/entrar');

    const email = page.getByLabel('E-mail').locator('xpath=ancestor::mat-form-field');
    const password = page
      .getByLabel('Senha', { exact: true })
      .locator('xpath=ancestor::mat-form-field');
    const emailBox = await email.boundingBox();
    const passwordBox = await password.boundingBox();
    expect(emailBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();
    expect(Math.abs(emailBox!.width - passwordBox!.width)).toBeLessThanOrEqual(0.5);

    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  });

  test('USER entra pelo destino guardado e vê o painel sem a administração', async ({
    page,
  }, testInfo) => {
    await page.goto('/painel');
    await expect(page).toHaveURL('/entrar?voltar=%2Fpainel');
    await expectAccessible(page, testInfo, 'login');

    await signInByKeyboard(page, USER, PASSWORD);

    await expect(page).toHaveURL('/painel');
    await expect(page).toHaveTitle('Painel — BIOS');
    await expect(
      page.getByRole('banner').getByRole('button', { name: /Conta de Demonstração/ }),
    ).toBeVisible();

    if (testInfo.project.name === 'celular') {
      await page.getByRole('banner').getByRole('button', { name: 'Áreas do painel' }).click();
      await expect(page.getByRole('menuitem', { name: /Setores/ })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /Administração/ })).toHaveCount(0);
      await page.keyboard.press('Escape');
    } else {
      const menu = page.getByRole('navigation', { name: 'Áreas do painel' });

      await expect(menu.getByRole('link', { name: /Setores/ })).toBeVisible();
      await expect(menu.getByRole('link', { name: /Administração/ })).toHaveCount(0);
    }
  });

  test('recarregar mantém a sessão, e uma aba nova começa sem ela', async ({ page, context }) => {
    await page.goto('/entrar');
    await signInByKeyboard(page, USER, PASSWORD);
    await expect(page).toHaveURL('/painel');

    await page.reload();

    await expect(page).toHaveURL('/painel');
    await expect(
      page.getByRole('banner').getByRole('button', { name: /Conta de Demonstração/ }),
    ).toBeVisible();

    const otherTab = await context.newPage();

    await otherTab.goto('/painel');
    await expect(otherTab).toHaveURL('/entrar?voltar=%2Fpainel');
  });

  test('USER que abre a administração vai para o acesso negado', async ({ page }) => {
    await page.goto('/entrar');
    await signInByKeyboard(page, USER, PASSWORD);
    await expect(page).toHaveURL('/painel');

    await navigateInApp(page, '/admin/dominios-bloqueados');

    await expect(page).toHaveURL('/acesso-negado');
    await expect(page.getByText('Seu perfil não permite acessar esta área.')).toBeVisible();
  });

  test('ADMIN vê e abre a administração', async ({ page }) => {
    await page.goto('/entrar');
    await signInByKeyboard(page, ADMIN, PASSWORD);
    await expect(page).toHaveURL('/painel');

    await openPanelArea(page, /Administração/);

    await expect(page).toHaveURL('/admin/dominios-bloqueados');
  });

  test('credenciais inválidas mostram a mensagem genérica da API', async ({ page }) => {
    await page.goto('/entrar');

    await signInByKeyboard(page, USER, 'senha-errada');

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
    await expect(page).toHaveURL('/entrar');
  });

  test('depois de 5 senhas erradas, o acesso fica bloqueado com o tempo restante', async ({
    page,
  }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill(USER);
    const password = page.getByLabel('Senha', { exact: true });
    const enter = page.getByRole('button', { name: 'Entrar', exact: true });

    for (let attempt = 1; attempt <= 5; attempt++) {
      await password.fill(`senha-errada-${attempt}`);
      await enter.click();
      await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
    }
    await password.fill(PASSWORD);
    await enter.click();

    await expect(page.getByRole('alert')).toHaveText(
      'Acesso temporariamente bloqueado. Tente novamente mais tarde.',
    );
    await expect(page.getByText(/Você poderá tentar de novo em 1[45] min/)).toBeVisible();
    await expect(enter).toBeDisabled();
  });

  test('sessão encerrada explica por que pede o login', async ({ page }) => {
    await page.goto('/entrar?voltar=%2Fsetores&sessao=encerrada');

    await expect(page.getByRole('status')).toHaveText(
      'Sua sessão terminou. Entre de novo para continuar.',
    );
  });
});
