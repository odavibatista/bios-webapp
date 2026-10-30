import { test as base } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll } from './accessibility';

/**
 * `test` dos e2e do webapp: ao fim de todo teste, a página em que ele terminou passa pela
 * análise de acessibilidade (NFIN01) e pela checagem de rolagem horizontal (NFIN02), sem o
 * teste precisar lembrar. Telas intermediárias pedem `expectAccessible` no próprio teste.
 *
 * Os e2e importam `test` e `expect` daqui, e não de `@playwright/test`.
 */
export const test = base.extend<{ finalPageChecks: void }>({
  finalPageChecks: [
    async ({ page }, use, testInfo) => {
      await use();

      // Teste que já falhou, ou que não abriu página, não tem tela para conferir.
      if (testInfo.status !== testInfo.expectedStatus || page.url() === 'about:blank') return;

      await expectAccessible(page, testInfo, 'fim do teste');
      await expectNoHorizontalScroll(page, 'fim do teste');
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
