import type { Page } from '@playwright/test';
import { expectNoHorizontalScroll } from './support/accessibility';
import { expect, test } from './support/test';

async function signIn(page: Page, email: string): Promise<void> {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

async function openInPanel(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    history.pushState({}, '', target);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
  await expect(page).toHaveURL(path);
  await expect(page.locator('mat-sidenav-content h1')).toBeVisible();
}

test('pesquisa, setores e chaves mantêm a rolagem dentro das tabelas', async ({
  page,
}, testInfo) => {
  await signIn(page, 'apresentacao@example.com');
  const widths = testInfo.project.name === 'celular' ? [390] : [1024, 1280, 1440];

  for (const path of [
    '/pesquisa?cnae=24&ods=13&ordem=desc',
    '/setores?cnae=24&ods=13',
    '/conta/chaves',
  ]) {
    await openInPanel(page, path);
    if (path.startsWith('/pesquisa')) {
      await expect(page.getByRole('status')).toHaveText('10 empresas encontradas');
    }
    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await expectNoHorizontalScroll(page, `${path} a ${width}px`);
    }
    if (testInfo.project.name === 'celular' && !path.startsWith('/pesquisa')) {
      await expect(page.locator('.table-scroll')).toBeVisible();
      expect(
        await page
          .locator('.table-scroll')
          .evaluate((element) => element.scrollWidth > element.clientWidth),
      ).toBe(true);
    }
  }
});

test('domínios bloqueados mantêm a rolagem dentro da tabela', async ({ page }, testInfo) => {
  await signIn(page, 'administracao@example.com');
  await openInPanel(page, '/admin/dominios-bloqueados');
  await expect(page.locator('.table-scroll')).toBeVisible();

  const widths = testInfo.project.name === 'celular' ? [390] : [1024, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await expectNoHorizontalScroll(page, `domínios bloqueados a ${width}px`);
  }
  if (testInfo.project.name === 'celular') {
    expect(
      await page
        .locator('.table-scroll')
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true);
  }
});
