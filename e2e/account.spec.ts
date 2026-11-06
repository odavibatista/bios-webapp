import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const PASSWORD = 'Apresentacao2026';

/** Entra e abre "Minha conta" pelo menu da barra, sem recarregar. */
async function openAccount(page: Page, email: string, name: RegExp) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');

  await page.getByRole('banner').getByRole('button', { name }).click();
  await page.getByRole('menuitem', { name: 'Minha conta' }).click();
  await expect(page).toHaveURL('/conta');
  await expect(page).toHaveTitle('Minha conta — BIOS');
  await expect(page.getByRole('region', { name: 'Seus dados' })).toBeVisible();
}

test.describe('conta (#23)', () => {
  test('endereço preenchido e troca de e-mail mantêm espaço entre os campos', async ({ page }) => {
    await openAccount(page, 'apresentacao@example.com', /Conta de Demonstração/);

    const address = page.locator('.address');
    for (const [above, below] of [
      ['.cep', '.number'],
      ['.number', '.neighborhood'],
      ['.neighborhood', '.city'],
    ]) {
      const first = await address.locator(above).boundingBox();
      const second = await address.locator(below).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.y - (first!.y + first!.height)).toBeGreaterThanOrEqual(11);
    }

    const emailChange = page.getByRole('region', { name: 'Trocar e-mail' });
    const email = await emailChange
      .getByLabel('Novo e-mail')
      .locator('xpath=ancestor::mat-form-field')
      .boundingBox();
    const password = await emailChange
      .getByLabel('Senha atual')
      .locator('xpath=ancestor::mat-form-field')
      .boundingBox();
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();
    expect(password!.y - (email!.y + email!.height)).toBeGreaterThanOrEqual(15);
  });

  test('edita o nome: "Salvar" só com mudança, e o nome novo aparece na barra', async ({
    page,
  }, testInfo) => {
    await openAccount(page, 'apresentacao@example.com', /Conta de Demonstração/);
    const data = page.getByRole('region', { name: 'Seus dados' });
    await expect(data).toContainText('Avenida Paulista, 1578');
    await expect(data).toContainText('CEP 01310-200');
    await expectAccessible(page, testInfo, 'conta');

    const save = page.getByRole('button', { name: 'Salvar', exact: true });
    await expect(save).toBeDisabled();
    await page.getByLabel('Nome', { exact: true }).fill('Pessoa de Demonstração');
    await expect(save).toBeEnabled();
    await save.click();

    await expect(page.getByRole('status').filter({ hasText: 'Dados salvos.' })).toBeVisible();
    await expect(data).toContainText('Pessoa de Demonstração');
    await expect(save).toBeDisabled();
    await expect(
      page.getByRole('banner').getByRole('button', { name: /Pessoa de Demonstração/ }),
    ).toBeVisible();
  });

  test('remove o endereço depois de confirmar', async ({ page }, testInfo) => {
    await openAccount(page, 'apresentacao@example.com', /Conta de Demonstração/);

    await page.getByRole('button', { name: 'Remover endereço' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Remover o endereço?' });
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await expectAccessible(page, testInfo, 'confirmação de remover o endereço');
    await dialog.getByRole('button', { name: 'Remover endereço' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Endereço removido.' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Seus dados' })).toContainText(
      'Nenhum endereço informado.',
    );
    await expect(page.getByRole('button', { name: 'Remover endereço' })).toHaveCount(0);
  });

  test('sem endereço, informa um: a máscara do CEP, as regras e a gravação', async ({ page }) => {
    await openAccount(page, 'administracao@example.com', /Administração de Demonstração/);
    const save = page.getByRole('button', { name: 'Salvar', exact: true });

    await page.getByLabel('Logradouro').fill('Avenida Rio Branco');
    await save.click();
    await expect(page.getByText('Informe um CEP válido (8 dígitos).')).toBeVisible();
    await expect(page.getByText('Informe a sigla de uma unidade da federação.')).toBeVisible();
    await expect(page.getByLabel('CEP')).toBeFocused();

    await page.getByLabel('CEP').pressSequentially('20040020');
    await expect(page.getByLabel('CEP')).toHaveValue('20040-020');
    await page.getByLabel('Número').fill('1');
    await page.getByLabel('Bairro').fill('Centro');
    await expect(page.getByLabel('Cidade')).toBeDisabled();
    await page.getByLabel('UF').click();
    await page.getByRole('option', { name: 'RJ', exact: true }).click();
    await page.getByLabel('Cidade').fill('rio');
    await page.getByRole('option', { name: 'Rio de Janeiro' }).click();
    await save.click();

    await expect(page.getByRole('status').filter({ hasText: 'Dados salvos.' })).toBeVisible();
    const data = page.getByRole('region', { name: 'Seus dados' });
    await expect(data).toContainText('Avenida Rio Branco, 1');
    await expect(data).toContainText('Centro, Rio de Janeiro – RJ');
    await expect(data).toContainText('CEP 20040-020');
    // O clique em Salvar deixa um campo anterior parcialmente sob o cabeçalho fixo.
    // Inspecione a tela inteira no estado estável, com o início do formulário visível.
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  test('leva à troca de senha', async ({ page }) => {
    await openAccount(page, 'apresentacao@example.com', /Conta de Demonstração/);

    await page.getByRole('link', { name: 'Alterar a senha' }).click();

    await expect(page).toHaveURL('/conta/senha');
  });
});
