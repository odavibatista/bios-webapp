import type { Page } from '@playwright/test';
import { expectAccessible } from './support/accessibility';
import { expect, test } from './support/test';

const PAULISTA = {
  cep: '01310-200',
  logradouro: 'Avenida Paulista',
  complemento: 'de 1047 a 1865 - lado ímpar',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  ibge: '3550308',
};

/** O ViaCEP é o único serviço externo: aqui ele é simulado, e nenhum teste sai para a internet. */
async function stubViaCep(page: Page, body: unknown, status = 200) {
  const asked: string[] = [];

  await page.route('https://viacep.com.br/**', async (route) => {
    asked.push(route.request().url());
    await route.fulfill({ status, json: body, headers: { 'access-control-allow-origin': '*' } });
  });

  return asked;
}

/** A conta começa em branco (ADMIN) ou com endereço na Avenida Paulista (USER). */
async function openAccount(page: Page, email: string) {
  await page.goto('/entrar?voltar=%2Fconta');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('Apresentacao2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Editar dados' })).toBeVisible();
}

const ADMIN = 'administracao@example.com';
const USER = 'apresentacao@example.com';

test.describe('endereço pelo CEP (#271)', () => {
  test('oito dígitos preenchem o endereço, e o foco segue para o número', async ({
    page,
  }, testInfo) => {
    const asked = await stubViaCep(page, PAULISTA);

    await openAccount(page, ADMIN);
    await page.getByLabel('CEP').pressSequentially('01310200');

    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Paulista');
    await expect(page.getByLabel('Bairro')).toHaveValue('Bela Vista');
    await expect(page.getByLabel('UF')).toContainText('SP');
    await expect(page.getByLabel('Cidade')).toHaveValue('São Paulo');
    await expect(page.getByLabel('Número')).toHaveValue('');
    await expect(page.getByLabel('Número')).toBeFocused();
    await expect(page.getByText('Endereço preenchido pelo CEP. Confira os campos.')).toBeVisible();
    await expectAccessible(page, testInfo, 'endereço preenchido pelo CEP');
    expect(asked).toEqual(['https://viacep.com.br/ws/01310200/json/']);

    await page.getByLabel('Número').fill('1000');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();

    await expect(page.getByRole('region', { name: 'Seus dados' })).toContainText(
      'Avenida Paulista, 1000',
    );
  });

  test('tudo continua editável depois de preencher', async ({ page }) => {
    await stubViaCep(page, PAULISTA);

    await openAccount(page, ADMIN);
    await page.getByLabel('CEP').pressSequentially('01310200');
    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Paulista');

    await page.getByLabel('Logradouro').fill('Rua Particular');

    await expect(page.getByLabel('Logradouro')).toHaveValue('Rua Particular');
  });

  test('CEP inexistente avisa e não apaga o que foi digitado', async ({ page }) => {
    await stubViaCep(page, { erro: 'true' });

    await openAccount(page, ADMIN);
    await page.getByLabel('Logradouro').fill('Rua Particular');
    await page.getByLabel('CEP').pressSequentially('00000000');

    await expect(page.getByText(/CEP não encontrado/)).toBeVisible();
    await expect(page.getByLabel('Logradouro')).toHaveValue('Rua Particular');
  });

  test('serviço fora do ar libera o preenchimento à mão, e salvar funciona', async ({ page }) => {
    await page.route('https://viacep.com.br/**', (route) => route.abort());

    await openAccount(page, ADMIN);
    await page.getByLabel('CEP').pressSequentially('20040020');
    await expect(page.getByText(/Preencha o endereço à mão/)).toBeVisible();

    await page.getByLabel('Logradouro').fill('Avenida Rio Branco');
    await page.getByLabel('Número').fill('1');
    await page.getByLabel('Bairro').fill('Centro');
    await page.getByLabel('UF').click();
    await page.getByRole('option', { name: 'RJ', exact: true }).click();
    await page.getByLabel('Cidade').fill('rio');
    await page.getByRole('option', { name: 'Rio de Janeiro' }).click();
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Dados salvos.' })).toBeVisible();
  });

  test('com endereço diferente já preenchido, pergunta antes de trocar', async ({ page }) => {
    await stubViaCep(page, {
      ...PAULISTA,
      cep: '20040-020',
      logradouro: 'Avenida Rio Branco',
      bairro: 'Centro',
      localidade: 'Rio de Janeiro',
      uf: 'RJ',
      ibge: '3304557',
    });

    await openAccount(page, USER);
    await page.getByLabel('CEP').fill('');
    await page.getByLabel('CEP').pressSequentially('20040020');

    await expect(page.getByText('Este CEP tem outro endereço.', { exact: false })).toBeVisible();
    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Paulista');

    await page.getByRole('button', { name: 'Usar este endereço' }).click();

    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Rio Branco');
    await expect(page.getByLabel('Cidade')).toHaveValue('Rio de Janeiro');
  });

  test('manter o que digitei não troca nada', async ({ page }) => {
    await stubViaCep(page, { ...PAULISTA, cep: '20040-020', logradouro: 'Avenida Rio Branco' });

    await openAccount(page, USER);
    await page.getByLabel('CEP').fill('');
    await page.getByLabel('CEP').pressSequentially('20040020');
    await page.getByRole('button', { name: 'Manter o que digitei' }).click();

    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Paulista');
    await expect(page.getByRole('button', { name: 'Usar este endereço' })).toHaveCount(0);
  });

  test('só o ViaCEP é chamado fora do site, e só com o CEP', async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? '').origin;
    const external: string[] = [];

    page.on('request', (request) => {
      const url = new URL(request.url());

      if (url.protocol.startsWith('http') && url.origin !== origin) external.push(url.href);
    });
    await stubViaCep(page, PAULISTA);

    await openAccount(page, ADMIN);
    await page.getByLabel('CEP').pressSequentially('01310200');
    await expect(page.getByLabel('Logradouro')).toHaveValue('Avenida Paulista');

    expect(external).toEqual(['https://viacep.com.br/ws/01310200/json/']);
  });
});
