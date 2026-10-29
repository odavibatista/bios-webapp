// @ts-check

/**
 * Padrão de mensagens de commit: Conventional Commits, como no bios-core-api.
 *
 *   <tipo>(<escopo opcional>): <descrição>
 *
 *   feat(search): adiciona o filtro por UF
 *   fix(profile): mostra a confiança ao lado do índice
 *   chore(ci): adiciona os testes e2e ao pipeline
 *
 * O escopo, quando usado, é a área do app afetada (ou shared, ci, deps, docs).
 *
 * Corpo e rodapé sem limite de largura: commits do Dependabot trazem URLs longas.
 */

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // áreas do app
        'home',
        'search',
        'profile',
        'sectors',
        'auth',
        'api-keys',
        'mocks',
        'api',
        // áreas transversais
        'app',
        'layout',
        'theme',
        'shared',
        'e2e',
        'ci',
        'deps',
        'deps-dev',
        'docs',
        'config',
        'release',
      ],
    ],
    'header-max-length': [2, 'always', 100],
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
