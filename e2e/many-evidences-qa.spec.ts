import { expect, test } from './support/test';

test('o perfil abre os grupos de evidência e leva à evidência citada no índice (#267)', async ({
  page,
}) => {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
  await page.goto('/empresas/00990842000138');

  const scores = page.getByRole('region', { name: 'Índices por ODS' });
  const ods15 = scores.getByRole('article', { name: 'ODS 15' });

  await ods15.getByText('Como o índice foi calculado para o ODS 15').click();
  await ods15.getByRole('button', { name: 'Ver evidência no perfil' }).first().click();

  await expect(page.locator('.evidence:focus')).toBeVisible();
});
