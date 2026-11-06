import type { Locator, Page } from '@playwright/test';
import { expect, test } from './support/test';

async function openProfile(page: Page, cnpj: string) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
  const field = page.getByRole('banner').getByLabel('Buscar empresa por CNPJ ou nome');

  await field.fill(cnpj);
  await field.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/empresas/${cnpj}$`));
  await expect(page.getByRole('heading', { name: 'Evidências', exact: true })).toBeVisible();
}

const height = async (control: Locator) => (await control.boundingBox())?.height ?? 0;

test.describe('perfil no toque (#264)', () => {
  test('links de evidência e botões com 44 px no celular', async ({ page }) => {
    test.skip(
      test.info().project.name === 'desktop',
      'Alvos de toque são medidos no projeto celular.',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await openProfile(page, '00990842000138');

    const source = page.getByRole('link', { name: /^Consultar na fonte/ }).first();

    await source.scrollIntoViewIfNeeded();

    expect(await height(source)).toBeGreaterThanOrEqual(44);
    expect(
      await height(page.getByRole('link', { name: 'Consultar outro CNPJ' })),
    ).toBeGreaterThanOrEqual(44);
    expect(
      await height(page.getByRole('button', { name: 'Atualizar perfil' })),
    ).toBeGreaterThanOrEqual(44);
  });

  test('"Ver evidência no perfil" com 44 px no celular', async ({ page }) => {
    test.skip(
      test.info().project.name === 'desktop',
      'Alvos de toque são medidos no projeto celular.',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await openProfile(page, '00990842000138');

    await page.getByText('Como o índice foi calculado para o ODS 15').click();

    const link = page.getByRole('button', { name: 'Ver evidência no perfil' }).first();

    await expect(link).toBeVisible();
    expect(await height(link)).toBeGreaterThanOrEqual(44);
  });

  for (const width of [320, 1280]) {
    test(`nenhum link isolado abaixo de 24 px em ${width} px`, async ({ page }) => {
      test.skip(
        test.info().project.name === 'desktop',
        'Alvos de toque são medidos no projeto celular.',
      );
      await page.setViewportSize({ width, height: 900 });
      await openProfile(page, '00990842000138');

      const heights = await page
        .locator('bios-environmental-evidences a, .back a, bios-environmental-evidences button')
        .evaluateAll((controls) => controls.map((item) => item.getBoundingClientRect().height));

      expect(Math.min(...heights)).toBeGreaterThanOrEqual(width < 600 ? 44 : 17);
    });
  }
});

test('"Atualizar perfil" dá retorno na apresentação (#265)', async ({ page }) => {
  await openProfile(page, '00990842000138');
  await page.getByRole('button', { name: 'Atualizar perfil' }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'nenhuma fonte foi consultada' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Atualizar perfil' })).toBeEnabled();
});
