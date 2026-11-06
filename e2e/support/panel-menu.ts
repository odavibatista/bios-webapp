import type { Page } from '@playwright/test';

/** Abre uma área do painel: pelo menu lateral ou, abaixo de 960 px, pelo menu do cabeçalho. */
export async function openPanelArea(page: Page, name: RegExp): Promise<void> {
  if ((page.viewportSize()?.width ?? 0) < 960) {
    await page.getByRole('banner').getByRole('button', { name: 'Áreas do painel' }).click();
    await page.getByRole('menuitem', { name }).click();

    return;
  }

  await page
    .getByRole('navigation', { name: 'Áreas do painel' })
    .getByRole('link', { name })
    .click();
}
