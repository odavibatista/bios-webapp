import type { Locator, Page } from '@playwright/test';
import { expect, test } from './support/test';

const WIDTHS = [320, 390, 768, 1024, 1280, 1366, 1440, 1920, 2560];

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

/** O que falta para a última peça de cada fileira chegar à borda direita do contêiner. */
async function gaps(items: Locator, container: Locator) {
  const right = (await container.boundingBox())?.x ?? 0;
  const width = (await container.boundingBox())?.width ?? 0;
  const boxes = await items.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();

      return { top: Math.round(box.top), right: box.right };
    }),
  );
  const rows = new Map<number, number>();

  for (const box of boxes) rows.set(box.top, Math.max(rows.get(box.top) ?? 0, box.right));

  return [...rows.values()].map((edge) => Math.round(right + width - edge));
}

/** A distância do topo do card até a divisória, com a fileira de cada um. */
function dividers(page: Page) {
  return page.locator('.movement-list > li').evaluateAll((items) =>
    items.map((item) => ({
      row: Math.round(item.getBoundingClientRect().top),
      top: item.querySelector('.ods-list')?.getBoundingClientRect().top ?? 0,
      offset:
        (item.querySelector('.ods-list')?.getBoundingClientRect().top ?? 0) -
        item.getBoundingClientRect().top,
    })),
  );
}

test.describe('grades do painel e da pesquisa (#256, #257)', () => {
  for (const width of WIDTHS) {
    test(`nenhuma fileira fica com buraco em ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await signIn(page);

      const list = page.locator('.movement-list');
      const tiles = page.locator('bios-overview-totals .tiles');

      await expect(list.locator('> li').first()).toBeVisible();
      await expect(tiles.locator('> div:not(.skeleton)').first()).toBeVisible();

      for (const gap of await gaps(list.locator('> li'), list)) expect(gap).toBeLessThanOrEqual(1);
      for (const gap of await gaps(tiles.locator('> div'), tiles)) {
        expect(gap).toBeLessThanOrEqual(1);
      }

      await page.goto('/pesquisa');

      const fields = page.locator('.fields');

      await expect(fields.locator('> *').first()).toBeVisible();

      for (const gap of await gaps(fields.locator('> *'), fields)) {
        expect(gap).toBeLessThanOrEqual(1);
      }
    });

    test(`divisórias dos cards alinhadas em ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await signIn(page);
      await expect(page.locator('.movement-list > li').first()).toBeVisible();

      const cards = await dividers(page);

      if (width < 768) {
        const offsets = cards.map(({ offset }) => offset);

        expect(Math.max(...offsets) - Math.min(...offsets)).toBeLessThanOrEqual(1);
      } else {
        for (const { row } of cards) {
          const tops = cards.filter((card) => card.row === row).map(({ top }) => top);

          expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
        }
      }
    });
  }
});
