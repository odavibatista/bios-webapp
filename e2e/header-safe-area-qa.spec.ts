import type { Page } from '@playwright/test';
import { signIn } from './support/session';
import { expect, test } from './support/test';

// Faixa da barra de status de um iPhone com Dynamic Island, em pixels CSS.
const STATUS_BAR = 59;

/** Emula as áreas reservadas do aparelho (`env(safe-area-inset-*)`) pelo protocolo do Chromium. */
async function emulateSafeArea(page: Page, top: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', {
    insets: {
      top,
      topMax: top,
      left: 0,
      leftMax: 0,
      bottom: 34,
      bottomMax: 34,
      right: 0,
      rightMax: 0,
    },
  });
}

test.describe('cabeçalho na área da barra de status do iPhone', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name === 'desktop', 'Cenário específico do projeto celular.');
  });

  test('a página ocupa a faixa da barra de status (viewport-fit=cover)', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/,
    );
  });

  test('rolando, o cabeçalho cobre a barra de status e nada da página aparece acima dele', async ({
    page,
  }) => {
    await emulateSafeArea(page, STATUS_BAR);
    await signIn(page);

    const header = page.getByRole('banner');
    const brand = header.getByRole('link', { name: 'BIOS, página inicial' });

    await expect(header.getByRole('button', { name: /Conta de Demonstração/ })).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, 600);
    });

    expect((await header.boundingBox())?.y).toBe(0);
    // O conteúdo da barra começa abaixo da faixa reservada.
    expect((await brand.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(STATUS_BAR);
    // No topo da tela, por trás da barra de status, está o próprio cabeçalho, e não a página.
    const topIsHeader = await page.evaluate(() => {
      const element = document.elementFromPoint(window.innerWidth / 2, 2);
      return !!element?.closest('[role="banner"]');
    });
    expect(topIsHeader).toBe(true);
  });

  test('sem barra de status, o cabeçalho mantém a altura de antes', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await signIn(page);

    const header = page.getByRole('banner');

    await expect(header.getByRole('button', { name: /Conta de Demonstração/ })).toBeVisible();
    expect((await header.boundingBox())?.height ?? 0).toBeLessThanOrEqual(568 * 0.2);
    await expect(header).toHaveCSS('padding-top', '0px');
  });

  test('em navegador embutido, que prende o cabeçalho abaixo da própria barra, o verde cobre a faixa de cima', async ({
    page,
  }) => {
    await signIn(page);

    const header = page.getByRole('banner');

    await expect(header.getByRole('button', { name: /Conta de Demonstração/ })).toBeVisible();
    // Simula o navegador do Telegram no iPhone: a barra dele, translúcida, ocupa o topo da tela e o
    // cabeçalho fica preso logo abaixo dela, com a faixa reservada valendo zero. O `pointer-events`
    // deixa o teste encontrar o verde estendido pelo ponto da tela.
    await page.addStyleTag({
      content:
        '.topbar { top: 120px !important } .topbar::before { pointer-events: auto !important }',
    });
    await page.evaluate(() => {
      window.scrollTo(0, 600);
    });

    expect((await header.boundingBox())?.y).toBe(120);
    const coveredRows = await page.evaluate(() =>
      [2, 60, 118].map(
        (y) => !!document.elementFromPoint(window.innerWidth / 2, y)?.closest('[role="banner"]'),
      ),
    );
    expect(coveredRows).toEqual([true, true, true]);
  });

  test('o link para pular ao conteúdo, focado no topo, fica por cima do verde estendido', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });

    await expect(skipLink).toBeFocused();
    const box = await skipLink.boundingBox();
    const onTop = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.textContent?.trim(),
      [(box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2],
    );
    expect(onTop).toBe('Pular para o conteúdo');
  });
});
