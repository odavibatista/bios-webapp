import type { Page } from '@playwright/test';
import { AXE_EXCLUDE } from './support/accessibility';
import { openPanelArea } from './support/panel-menu';
import { signIn } from './support/session';
import { expect, test } from './support/test';

/** Requisições que saem do próprio app (CDN, telemetria, assistente): a página não pode ter. */
function externalRequests(page: Page, baseURL: string | undefined): string[] {
  const origin = new URL(baseURL ?? 'http://localhost').origin;
  const found: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());

    if (/^https?:$/.test(url.protocol) && url.origin !== origin) found.push(request.url());
  });

  return found;
}

/**
 * Partes do Scalar que o axe acusa e que o app não controla: o cliente de requisições (campos de
 * chave e valor sem nome acessível), os editores de código (CodeMirror) e o botão de copiar
 * deles. Depois de abrir o cliente, elas ficam na página; o resto da documentação segue
 * analisado. A página só com a referência passa sem exclusão (primeiro teste).
 */
const SCALAR_THIRD_PARTY = ['.scalar-client', '.cm-editor', 'button[aria-label="Copy code"]'];

function excludeScalarThirdParty(): void {
  for (const selector of SCALAR_THIRD_PARTY) {
    test.info().annotations.push({ type: AXE_EXCLUDE, description: selector });
  }
}

async function closeClient(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Cliente de API' })).toBeHidden();
}

test.describe('documentação da API (RF17)', () => {
  test('abre pelo menu do painel, em português, com o tema do BIOS e sem sair do app', async ({
    page,
    baseURL,
  }) => {
    const external = externalRequests(page, baseURL);

    await signIn(page);
    await openPanelArea(page, /Documentação da API/);

    await expect(page).toHaveURL('/documentacao-api');
    await expect(page).toHaveTitle('Documentação da API — BIOS');
    await expect(page.getByRole('heading', { name: 'BIOS API' })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /Testar Requisição/ }).first()).toBeVisible();
    // O fundo é o claro da paleta do BIOS, e não o escuro padrão do Scalar.
    await expect(page.locator('.scalar-app').first()).toHaveCSS(
      '--scalar-background-1',
      /#fbfcf8/i,
    );
    await expect(page.getByText('Perguntar à IA')).toHaveCount(0);
    expect(external).toEqual([]);
  });

  test('testar uma rota responde no navegador, com o token de quem entrou', async ({
    page,
    baseURL,
  }) => {
    const external = externalRequests(page, baseURL);

    excludeScalarThirdParty();
    await signIn(page, '/documentacao-api#tag/%C3%ADndices-por-ods/GET/ods');
    const test = page.getByRole('button', { name: /Testar Requisição\s*\(get \/ods\)/ });

    await expect(test).toBeVisible({ timeout: 30_000 });
    await test.click();

    const client = page.getByRole('dialog', { name: 'Cliente de API' });

    await client.getByRole('button', { name: /Enviar requisição get/ }).click();
    await expect(client.getByText('200 OK')).toBeVisible();
    await expect(client).toContainText('Vida Terrestre');
    expect(external).toEqual([]);
    await closeClient(page);
  });

  test('sem sessão, a página abre e a rota privada responde 401, como a API', async ({ page }) => {
    excludeScalarThirdParty();
    await page.goto('/documentacao-api#tag/%C3%ADndices-por-ods/GET/ods');
    const test = page.getByRole('button', { name: /Testar Requisição\s*\(get \/ods\)/ });

    await expect(test).toBeVisible({ timeout: 30_000 });
    await test.click();

    const client = page.getByRole('dialog', { name: 'Cliente de API' });

    await client.getByRole('button', { name: /Enviar requisição get/ }).click();
    await expect(client.getByText(/401/).first()).toBeVisible();
    await expect(client).toContainText('NOT_AUTHENTICATED');
    await closeClient(page);
  });
});
