import type { Page } from '@playwright/test';
import { expectNoHorizontalScroll } from './support/accessibility';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

test.describe('alinhamento da conta e privacidade (#254)', () => {
  for (const width of [1024, 1280, 1440, 1920, 2560]) {
    test(`as telas seguem as colunas das chaves em ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await signIn(page);
      await page.goto('/conta/chaves');
      const reference = await page.locator('bios-api-keys-page').boundingBox();
      expect(reference).not.toBeNull();

      for (const [path, selector] of [
        ['/conta', 'bios-account-page'],
        ['/conta/senha', 'bios-change-password'],
        ['/privacidade', 'bios-privacy-page'],
      ]) {
        await page.goto(path);
        const box = await page.locator(selector).boundingBox();
        expect(box, path).not.toBeNull();
        expect(Math.abs(box!.x - reference!.x), path).toBeLessThanOrEqual(2);
        expect(
          Math.abs(box!.x + box!.width - (reference!.x + reference!.width)),
          path,
        ).toBeLessThanOrEqual(2);
      }
    });
  }

  test('as telas continuam sem rolagem horizontal em 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await signIn(page);
    for (const path of ['/conta', '/conta/senha', '/privacidade']) {
      await page.goto(path);
      await expectNoHorizontalScroll(page);
    }
  });
});

test('a barra de rolagem usa a paleta do BIOS somente no desktop (#255)', async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.goto('/pesquisa');
  const card = page.locator('bios-chart-card', {
    has: page.getByRole('heading', { name: 'Situação cadastral' }),
  });
  await card.getByRole('radio', { name: 'Tabela' }).click();
  const colors = await card.locator('bios-table-scroll .frame').evaluate((frame) => {
    const pageColor = getComputedStyle(document.documentElement).scrollbarColor;
    const tableColor = getComputedStyle(frame).scrollbarColor;
    const width = getComputedStyle(document.documentElement, '::-webkit-scrollbar').width;
    const swatch = document.createElement('div');
    document.body.append(swatch);
    const luminance = (value: string) => {
      swatch.style.backgroundColor = value;
      const channels = getComputedStyle(swatch)
        .backgroundColor.match(/\d+/g)!
        .slice(0, 3)
        .map((channel) => {
          const normalized = Number(channel) / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const thumb = luminance('var(--bios-brand-green)');
    const track = luminance('var(--mat-sys-surface-container)');
    swatch.remove();
    const contrast = (Math.max(thumb, track) + 0.05) / (Math.min(thumb, track) + 0.05);
    return { pageColor, tableColor, width, contrast };
  });

  if (testInfo.project.name === 'desktop') {
    expect(colors.pageColor).not.toBe('auto');
    expect(colors.tableColor).toBe(colors.pageColor);
    expect(colors.width).toBe('12px');
    expect(colors.contrast).toBeGreaterThanOrEqual(3);
  } else {
    expect(colors.pageColor).toBe('auto');
  }
});
