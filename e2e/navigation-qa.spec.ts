import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

const ATTEMPTS = 5;

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

const scrollTop = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

test.describe('voltar para a lista (#261)', () => {
  for (const { name, path } of [
    { name: 'painel', path: '/painel' },
    { name: 'empresas', path: '/empresas?nome=ltda' },
    { name: 'pesquisa', path: '/pesquisa?cnae=24&ods=13&ordem=desc&visao=resultados' },
  ]) {
    test(`a posição volta em ${name}, em ${ATTEMPTS} tentativas seguidas`, async ({ page }) => {
      await signIn(page);
      await page.goto(path);

      const links = page.locator('main a[href^="/empresas/"]');

      await expect(links.first()).toBeVisible();

      for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        const target = links.last();

        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);

        const before = await scrollTop(page);

        await target.click();
        await expect(page).toHaveURL(/\/empresas\/\d{14}$/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect(await scrollTop(page)).toBeLessThanOrEqual(1);

        await page.goBack();
        await expect(links.first()).toBeVisible();
        await expect.poll(() => scrollTop(page)).toBeGreaterThan(before - 100);
        expect(Math.abs((await scrollTop(page)) - before)).toBeLessThanOrEqual(100);
      }
    });
  }
});

test.describe('arquivo do app que não carrega (#262)', () => {
  // No celular, o mesmo tratamento: só o caminho até o menu muda.
  test.skip(({ isMobile }) => isMobile);

  const CHUNK = '**/*.js';
  const isChunk = (url: string) => /\/chunk-[^/]+\.js/.test(url);

  test('recarrega uma vez, sem laço, e abre a tela', async ({ page }) => {
    await signIn(page);

    let blocked = 0;

    await page.route(CHUNK, async (route) => {
      if (isChunk(route.request().url()) && blocked === 0) {
        blocked++;
        await route.abort();
      } else {
        await route.continue();
      }
    });

    await page.getByRole('link', { name: 'Setores' }).first().click();

    await expect(page).toHaveURL(/\/setores/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(blocked).toBe(1);
  });

  test('sem conexão, avisa e oferece tentar de novo', async ({ page, context }) => {
    await signIn(page);
    await page.route(CHUNK, (route) =>
      isChunk(route.request().url()) ? route.abort() : route.continue(),
    );
    await context.setOffline(true);

    await page.getByRole('link', { name: 'Setores' }).first().click();

    await expect(page.getByText('Não foi possível abrir a tela. Confira a conexão.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
    await expect(page).toHaveURL('/painel');

    await context.setOffline(false);
    await page.unroute(CHUNK);
    await page.getByRole('button', { name: 'Tentar de novo' }).click();

    await expect(page).toHaveURL(/\/setores/);
  });
});
