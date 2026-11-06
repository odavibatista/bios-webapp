import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function signIn(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
}

test('a explicação longa só cria o trecho aberto e mantém o destino da evidência (#293)', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/empresas/33000167000101');
  const scores = page.getByRole('region', { name: 'Índices por ODS' });
  const card = scores.getByRole('article', { name: 'ODS 15' });
  const detail = card.locator('details.explanation');
  const entries = detail.locator('.contributions li');

  await expect(detail).toBeVisible();
  await expect(entries).toHaveCount(0);
  await detail.locator('summary').click();
  await expect(entries).toHaveCount(20);
  const total = await detail.locator('.total').textContent();
  await expect(detail.getByText('Mostrando 20 de 2.535 contribuições.')).toBeVisible();
  await detail.getByRole('button', { name: 'Mostrar mais' }).click();
  await expect(entries).toHaveCount(40);
  await expect(detail.locator('.total')).toHaveText(total!);
  await detail.locator('summary').click();
  await expect(entries).toHaveCount(0);
  await detail.locator('summary').click();
  await expect(entries).toHaveCount(40);

  await entries.nth(20).getByRole('button', { name: 'Ver evidência no perfil' }).click();
  await expect(page.locator('bios-environmental-evidences article.evidence:focus')).toHaveCount(1);
});
