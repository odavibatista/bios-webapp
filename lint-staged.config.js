// @ts-check

/**
 * Barreira de qualidade do pre-commit (RNF NFSE09), aplicada apenas aos arquivos em stage.
 *
 * Arquivos corrigidos automaticamente (ESLint --fix, Prettier) voltam ao stage sozinhos; qualquer
 * problema restante bloqueia o commit. Os testes unitários rodam no pre-push e no CI: o builder de
 * testes do Angular não seleciona os testes afetados por arquivo, como o `vitest related` da API.
 */

/** @type {import('lint-staged').Configuration} */
export default {
  // --no-warn-ignored: os tipos gerados são ignorados pelo ESLint, e o aviso disso reprovaria o commit.
  '*.ts': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.html': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{scss,md,yml,yaml,js,mjs}': 'prettier --write',
  // O lockfile fica de fora: é gerado pelo npm.
  '!(package-lock).json': 'prettier --write',
};
