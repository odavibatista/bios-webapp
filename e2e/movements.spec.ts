import { expect, test } from './support/test';

const USER = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';

test.describe('tela principal com as movimentações (#168)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/entrar');
    await page.getByRole('textbox', { name: 'E-mail' }).fill(USER);
    await page.getByRole('textbox', { name: 'Senha' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL('/painel');
  });

  test('o login leva às movimentações, com sentido, causa e data', async ({ page }) => {
    await expect(page).toHaveTitle('Painel — BIOS');
    await expect(page.getByRole('heading', { name: 'Movimentações recentes' })).toBeVisible();

    const cards = page.locator('bios-movement-card');

    await expect(cards.first()).toBeVisible();
    await expect(cards.getByText(/^Índice (subiu|desceu|calculado)$/).first()).toBeVisible();
    await expect(cards.getByText(/, em \d{2}\/\d{2}\/\d{4}$/).first()).toBeVisible();
    await expect(cards.first()).not.toContainText(/melhorou|piorou|sustent/);
  });

  test('o cartão abre o perfil, e o voltar devolve à lista', async ({ page }) => {
    const card = page.locator('bios-movement-card').first();
    const name = await card.getByRole('link').textContent();

    await card.click({ position: { x: 8, y: 8 } });

    await expect(page).toHaveURL(/\/empresas\/\d{14}$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name!.trim());

    await page.goBack();

    await expect(page).toHaveURL('/painel');
    await expect(page.locator('bios-movement-card').first()).toBeVisible();
  });

  test('a busca continua na tela principal', async ({ page }) => {
    await expect(
      page.getByRole('search', { name: 'Buscar empresa por CNPJ ou nome' }),
    ).toBeVisible();
  });

  test('os cards rolam pelo documento e mantêm a busca acessível no desktop', async ({
    page,
  }, testInfo) => {
    // As fixtures e2e só têm movimentações na primeira página; o layout é o mesmo da página 2.
    await page.goto('/painel');
    await expect(page.getByRole('heading', { name: 'Movimentações recentes' })).toBeVisible();
    await expect(page.locator('bios-movement-card').first()).toBeVisible();

    const panelContent = page.locator('mat-sidenav-content');
    expect(await panelContent.evaluate((element) => getComputedStyle(element).overflowY)).toBe(
      'visible',
    );

    await page.locator('bios-movement-card').first().hover();
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(await panelContent.evaluate((element) => element.scrollTop)).toBe(0);

    const lookup = page.getByRole('search', { name: 'Buscar empresa por CNPJ ou nome' }).last();
    if (testInfo.project.name === 'desktop') {
      await expect(lookup).toBeInViewport();
      await lookup.getByLabel('CNPJ ou nome da empresa').fill('00990842000138');
      await expect(lookup.getByLabel('CNPJ ou nome da empresa')).toHaveValue('00990842000138');
    }
  });
});
