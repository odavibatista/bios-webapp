import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

async function profile(page: Page, cnpj: string) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('apresentacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/painel');
  const field = page.getByRole('main').getByLabel('CNPJ ou nome da empresa');
  await field.fill(cnpj);
  await field.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/empresas/${cnpj}$`));
}

test.describe('evidências do perfil (#32)', () => {
  test('IBAMA, CEIS/CNEP e GHG aparecem em categorias próprias, com estados e referência', async ({
    page,
  }) => {
    await profile(page, '00990842000138');
    const evidences = page.getByRole('region', { name: 'Evidências' });
    const ibama = evidences.getByRole('region', { name: 'Infrações ambientais' });
    const administrative = evidences.getByRole('region', { name: 'Conduta administrativa' });
    const ghg = evidences.getByRole('region', { name: 'Inventários de emissões de GEE' });

    await expect(ibama).toContainText('Registro encontrado');
    await expect(ibama).toContainText('Publicação');
    await expect(ibama).toContainText('12/09/2008');
    const link = ibama.getByRole('link', { name: 'Consultar na fonte: 343440-D' });
    await expect(link).toHaveAttribute('href', /^https:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(administrative).toContainText('Sem registro na fonte');
    await expect(ghg).toContainText('Inventário não localizado no registro voluntário');
    await expect(ghg).toContainText('Isso não confirma ausência de inventário');
    await expect(page.getByRole('region', { name: 'Fontes consultadas' })).toContainText(
      'Não há inventário localizado para esta empresa no registro voluntário',
    );
  });

  test('sanções ficam em conduta administrativa, com período sem afirmar vigência', async ({
    page,
  }) => {
    await profile(page, '33458350000155');
    const administrative = page.getByRole('region', { name: 'Conduta administrativa' });
    const infraction = page.getByRole('region', { name: 'Infrações ambientais' });
    await expect(administrative).toContainText('Sanção administrativa registrada no CEIS');
    await expect(administrative).toContainText('Período informado pela fonte');
    await expect(administrative).toContainText('Confira a situação atual');
    await expect(infraction).not.toContainText('Sanção administrativa registrada no CEIS');
  });
});
