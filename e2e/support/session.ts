import { expect, type Page } from '@playwright/test';
import { test } from './test';

const DEMO_USER = 'apresentacao@example.com';
const DEMO_PASSWORD = 'Apresentacao2026';
const RESTORED_KEY = 'bios.e2e.restaurada';

/** O que o login deixa na aba: a sessão e o estado da API simulada. Um por e-mail, em cada worker. */
const tabs = new Map<string, Promise<Record<string, string>>>();

async function loginOnce(page: Page, email: string): Promise<Record<string, string>> {
  const context = await page.context().browser()!.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const loginPage = await context.newPage();

  try {
    await loginPage.goto('/entrar');
    await loginPage.getByLabel('E-mail').fill(email);
    await loginPage.getByLabel('Senha', { exact: true }).fill(DEMO_PASSWORD);
    await loginPage.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(loginPage).toHaveURL('/painel');

    return await loginPage.evaluate(() => ({ ...sessionStorage }));
  } finally {
    await context.close();
  }
}

/**
 * Abre `path` com a sessão de `email` já na aba. O login de verdade pela tela acontece uma vez por
 * worker, e cada teste recebe uma cópia do `sessionStorage` que ele deixou: o estado segue isolado
 * por teste, e o app não ganha caminho nenhum para os e2e. O login em si fica em `login.spec.ts`.
 */
export async function signIn(page: Page, path = '/painel', email = DEMO_USER): Promise<void> {
  if (!tabs.has(email)) tabs.set(email, loginOnce(page, email));

  // Roda a cada carregamento, e só a primeira restaura: recarregar não desfaz o que o teste fez.
  await page.addInitScript(
    ({ tab, key }) => {
      if (location.origin === 'null' || sessionStorage.getItem(key)) return;
      for (const [name, value] of Object.entries(tab)) sessionStorage.setItem(name, value);
      sessionStorage.setItem(key, 'sim');
    },
    { tab: await tabs.get(email)!, key: RESTORED_KEY },
  );
  await page.goto(path);
  await expect(page).toHaveURL(path);
  // A URL do `goto` já vem certa: quem diz que a tela chegou é o título, como depois de um login.
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
}
