import { expect, test } from './support/test';

test.describe('versão de apresentação (#17)', () => {
  test('o rodapé avisa que os dados são capturados', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('contentinfo')).toContainText('Versão de apresentação');
  });

  test('nenhuma requisição sai do próprio site: sem API real nem serviço externo', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? '').origin;
    const external: string[] = [];

    page.on('request', (request) => {
      const url = new URL(request.url());

      if (url.protocol.startsWith('http') && url.origin !== origin) external.push(url.href);
    });

    await page.goto('/');
    await page.goto('/rota-que-nao-existe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');

    expect(external).toEqual([]);
  });
});
