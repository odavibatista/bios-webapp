import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

/** Critérios de sucesso de nível A e AA das WCAG 2.0, 2.1 e 2.2 (NFIN01). */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Sentinelas do focus trap do CDK (gaveta do menu aberta no celular, diálogos): divs invisíveis,
 * com `aria-hidden` e `tabindex="0"`, que só devolvem o foco para dentro da área presa. O leitor
 * de tela nunca para nelas, mas o axe as acusa em `aria-hidden-focus`. Só elas ficam de fora; o
 * conteúdo da gaveta e do diálogo continua analisado.
 */
const FOCUS_TRAP_SENTINELS = '.cdk-focus-trap-anchor';

/**
 * Roda a análise de acessibilidade (axe) na página como ela está agora e falha com qualquer
 * violação de nível A ou AA (NFIN01). O resultado completo vai como anexo do teste, para ser
 * lido no relatório do Playwright; a falha lista regra, impacto e elementos afetados.
 */
export async function expectAccessible(
  page: Page,
  testInfo: TestInfo,
  step = 'página',
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .exclude(FOCUS_TRAP_SENTINELS)
    .analyze();

  await testInfo.attach(`acessibilidade (axe) — ${step}`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const violations = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? 'sem impacto'}): ${violation.help} — ` +
      violation.nodes.map((node) => node.target.join(' ')).join(', '),
  );

  expect(violations, `Violações de acessibilidade em ${page.url()} (${step})`).toEqual([]);
}

/**
 * Confere que a página não rola na horizontal na largura atual (NFIN02): conteúdo largo, como
 * tabelas, precisa rolar dentro do próprio contêiner.
 */
export async function expectNoHorizontalScroll(page: Page, step = 'página'): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    scrollWidth,
    `A página rola na horizontal em ${page.url()} (${step}): ${scrollWidth}px de conteúdo em ${clientWidth}px de largura`,
  ).toBeLessThanOrEqual(clientWidth);
}
