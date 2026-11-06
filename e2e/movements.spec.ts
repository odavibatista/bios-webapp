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

  test('recorte por categoria fica na URL e volta à primeira página', async ({ page }) => {
    await page.goto('/painel?pagina=2');
    const category = page.getByRole('combobox', { name: 'Categoria da evidência' });

    await category.selectOption('emissoes');
    await expect(page).toHaveURL('/painel?categoria=emissoes');
    await expect(category).toHaveValue('emissoes');
    await expect(page.locator('bios-movement-card').first()).toBeVisible();

    await page.reload();
    await expect(category).toHaveValue('emissoes');
    await category.selectOption('');
    await expect(page).toHaveURL('/painel');
  });

  test('a busca continua na tela principal', async ({ page }) => {
    await expect(page.getByRole('banner').getByRole('search')).toBeVisible();
    await expect(page.getByRole('main').getByRole('search')).toHaveCount(0);
  });

  test('o cabeçalho mantém busca e menu sem cobrir os cards durante a rolagem', async ({
    page,
  }) => {
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

    const header = page.getByRole('banner');
    await expect(header).toBeInViewport();
    const navButton = header.getByRole('button', { name: 'Áreas do painel' });
    if (page.viewportSize()!.width < 960) {
      await expect(navButton).toBeVisible();
    } else {
      await expect(navButton).toBeHidden();
    }
    const lookup = header.getByRole('search');
    await expect(lookup).toBeInViewport();
    await lookup.getByLabel('Buscar empresa por CNPJ ou nome').fill('00990842000138');
    await expect(lookup.getByLabel('Buscar empresa por CNPJ ou nome')).toHaveValue(
      '00990842000138',
    );
    await expect(page.getByRole('main').getByRole('search')).toHaveCount(0);
    if (page.viewportSize()!.width < 960) {
      await navButton.click();
      await expect(page.getByRole('menuitem', { name: 'Empresas' })).toBeVisible();
    }
  });

  test('a busca única no cabeçalho cabe nas larguras móvel e desktop', async ({ page }) => {
    test.skip(test.info().project.name === 'celular', 'Larguras definidas pelo próprio teste.');
    for (const width of [390, 1024, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.getByRole('banner').getByRole('search')).toBeInViewport();
      const navButton = page.getByRole('banner').getByRole('button', { name: 'Áreas do painel' });
      if (width < 960) {
        await expect(navButton).toBeVisible();
      } else {
        await expect(navButton).toBeHidden();
      }
      await expect(page.getByRole('main').getByRole('search')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });

  test('a busca permanece no cabeçalho ao alternar entre Empresas e Pesquisa', async ({ page }) => {
    test.skip(test.info().project.name === 'celular', 'Larguras definidas pelo próprio teste.');
    for (const width of [390, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of ['/empresas', '/pesquisa']) {
        await page.evaluate((target) => {
          history.pushState({}, '', target);
          dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        }, route);
        const search = page.getByRole('banner').getByRole('search');
        await expect(search).toBeVisible();
        await expect(search.getByLabel('Buscar empresa por CNPJ ou nome')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
      }
    }
  });

  test('o link do QR Code abre o painel sem pedir login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/demonstracao');

    await expect(page).toHaveURL('/painel');
    await expect(page.locator('bios-movement-card').first()).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL('/painel');
    await context.close();
  });
});
