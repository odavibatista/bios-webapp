# bios-webapp

🇧🇷 **Português** · 🇺🇸 [English](README.en.md)

[![CI](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml)

Front-end do **BIOS — Business Intelligence on Sustainability**, em Angular. Mostra, para cada empresa,
o índice de aderência aos **ODS 13 e 15**, a confiança e as evidências que o compõem, cada uma com a
referência à fonte oficial.

> **Versão de apresentação:** o app roda sem a API no ar. Os dados vêm de respostas reais do
> [bios-core-api](https://github.com/odavibatista/bios-core-api), capturadas e guardadas no repositório, atrás
> de um serviço com a mesma interface da API: integrar de verdade é trocar só esse serviço. Só dados de
> pessoa jurídica (INL02).

Requisitos e modelagem: [bios-docs](https://github.com/odavibatista/bios-docs).

## Stack

| Camada           | Tecnologia                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Runtime          | Node.js 22.23.4 e npm 11, fixados pelo Volta (`volta` no `package.json`)                     |
| Framework        | Angular 22 (standalone, zoneless, signals), TypeScript 6 `strict` com `strictTemplates`      |
| Componentes      | Angular Material 3 e CDK, com tema gerado da paleta do BIOS                                  |
| Gráficos         | ECharts (`ngx-echarts`)                                                                      |
| Fontes e ícones  | Inter e Material Symbols servidos pelo próprio app (a apresentação funciona offline)         |
| Tipos da API     | `@hey-api/openapi-ts`, a partir do OpenAPI do bios-core-api (`api/openapi.json`)             |
| Testes unitários | Vitest (builder do Angular) e `@testing-library/angular`, cobertura mínima de 75%            |
| Testes e2e       | Playwright (Chromium)                                                                        |
| Qualidade        | Angular ESLint com lint por tipos, Prettier, Husky, lint-staged, commitlint e GitHub Actions |

## Início rápido

```bash
npm install          # dependências (com o Volta, Node e npm certos entram sozinhos)
npm start            # http://localhost:4200
```

| Script                                           | Função                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `start` / `build` / `watch`                      | Servidor de desenvolvimento, build de produção e build contínuo                         |
| `test` / `test:watch` / `test:cov`               | Testes unitários (uma vez, em modo contínuo, com cobertura)                             |
| `test:e2e`                                       | Testes e2e no Playwright (sobe o app sozinho; antes, `npx playwright install chromium`) |
| `lint` / `format` / `format:check` / `typecheck` | ESLint, Prettier e verificação de tipos                                                 |
| `api:types`                                      | Regenera os tipos de `src/app/core/api/generated` a partir de `api/openapi.json`        |
| `verify`                                         | Tipos, lint, testes com cobertura e build: o que o CI exige                             |

**Tipos da API.** O CI do bios-core-api publica o documento OpenAPI como artefato (`openapi`). Para
atualizar, substitua `api/openapi.json` por ele e rode `npm run api:types`.

**Acessibilidade e larguras nos e2e (NFIN01, NFIN02).** Os e2e rodam em 1280 px (`desktop`) e 390 px
(`celular`), e todo teste termina com a análise do axe (WCAG 2.0, 2.1 e 2.2, níveis A e AA) e com a
checagem de que a página não rola na horizontal. Os testes importam `test` e `expect` de
`e2e/support/test.ts`, que faz isso sozinho; uma tela intermediária pede `expectAccessible` no próprio
teste. A falha lista regra, impacto e elementos; o resultado completo de cada análise vai como anexo
"acessibilidade (axe)" no relatório do Playwright (`npx playwright show-report` localmente; no CI, o
artefato `playwright-report`).

**Acentuação dos textos (NFIN04).** `src/app/shared/portuguese-accents.spec.ts` lê o texto visível dos
templates (e os atributos que o leitor de tela anuncia, como `aria-label`) e as frases do código, e
reprova palavra sem acento da lista `UNACCENTED` (`nao`, `indice`, `pagina`...). Achou uma grafia nova
sem acento? Acrescente-a à lista.

**Caminho com parênteses no Windows.** O builder de testes do Angular passa ao Vitest o caminho
absoluto de cada spec sem escapar, e uma pasta como `7-SEM (2026-2)` faz o Vitest não achar nenhum
teste. O `npm test` contorna isso sozinho (`scripts/unit-test.mjs`: monta a pasta-mãe numa unidade
temporária com `subst` e desmonta no fim). Fora do Windows, ou sem esses caracteres no caminho, roda
direto.

## Dados da versão de apresentação

As respostas vêm de uma API local com empresas reais, capturadas por `scripts/capture-api.mjs`, e não
de dados inventados: a demonstração mostra o comportamento verdadeiro da API, inclusive os erros.

- **Uma captura por arquivo:** `src/app/core/mocks/fixtures/<operationId>/<cenário>.ts`, com
  `satisfies CapturedResponse<...>` sobre o tipo gerado da operação e do status. Se a API mudar a forma
  de uma resposta, o `typecheck` recusa a captura antiga. A planilha XLSX fica ao lado, como arquivo.
- **Manifesto** (`fixtures/manifest.json`): commit do bios-core-api, data de cada fase, conta de
  demonstração e as empresas, com o motivo de cada uma.
- **Nada secreto nem pessoal:** senhas, tokens e o segredo das chaves de API viram marcadores antes de
  gravar; a conta de demonstração usa o domínio reservado `example.com`. O `fixtures.spec.ts` recusa
  CPF, e-mail de outro domínio, JWT e segredo de chave (INL02).

Para capturar de novo: API local (`develop` do bios-core-api) com banco limpo, carga inicial, ingestão
do IBAMA e sincronização do GHG, e os e-mails da API indo para um Mailpit (`SMTP_HOST=localhost`,
`SMTP_PORT=1025` no ambiente de quem sobe a API), de onde o roteiro lê os links. Depois:

```bash
BIOS_CAPTURE_PASSWORD=<senha> BIOS_CORE_DIR=<pasta do bios-core-api> \
  node scripts/capture-api.mjs contas admin empresas setores limites
```

As fases e os cenários estão no cabeçalho do script. A fase `limites` bloqueia o login do IP por 15
minutos (RF20) e por isso é a última; a `setores` se repete em outro mês para a série da evolução
setorial ter duas janelas reais.

## Tema

As cores vêm da apresentação do projeto (`bios-docs/assets/BIOS - PPTX.pptx`). As paletas do Material 3
(`src/styles/_theme-colors.scss`) foram geradas com `ng generate @angular/material:theme-color`, e as
cores exatas ficam como variáveis CSS para a marca e os gráficos:

| Variável             | Cor       | Uso                               |
| -------------------- | --------- | --------------------------------- |
| `--bios-brand-green` | `#2C5F2D` | Primária: barra superior, títulos |
| `--bios-brand-leaf`  | `#97BC62` | Terciária: destaques              |
| `--bios-brand-moss`  | `#5B6B5B` | Texto de apoio                    |
| `--bios-brand-ink`   | `#1A1A1A` | Texto                             |
| `--bios-brand-paper` | `#F5F5F5` | Superfícies, rodapé               |

## Fluxo de contribuição

Branch a partir do `develop`, PR de volta para ele com título em Conventional Commits, e promoção
`develop` → `pre-prod` → `main` por PR, com os checks **Lint** e **Testes** do CI. A proteção dos
branches (NFSE11) está versionada em [`.github/rulesets/`](.github/rulesets/README.md), com o passo
para aplicá-la no GitHub.

---

Projeto acadêmico de Engenharia de Software e Gestão e Qualidade de Software (Ciência da Computação, USJT).
