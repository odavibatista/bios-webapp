# bios-webapp

🇧🇷 **Português** · 🇺🇸 [English](README.en.md)

[![CI](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml)

Front-end do **BIOS — Business Intelligence on Sustainability**, em Angular. Mostra, para cada empresa,
o índice de aderência aos **ODS 13 e 15**, a confiança e as evidências que o compõem, cada uma com a
referência à fonte oficial.

> **Versão de apresentação:** o app roda sem a API no ar. Os dados vêm de respostas reais do
> [bios-core-api](https://github.com/odavibatista/bios-core-api), capturadas e guardadas como JSON, atrás
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

**Caminho com parênteses no Windows.** O builder de testes do Angular passa ao Vitest o caminho
absoluto de cada spec sem escapar, e uma pasta como `7-SEM (2026-2)` faz o Vitest não achar nenhum
teste. O `npm test` contorna isso sozinho (`scripts/unit-test.mjs`: monta a pasta-mãe numa unidade
temporária com `subst` e desmonta no fim). Fora do Windows, ou sem esses caracteres no caminho, roda
direto.

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
`develop` → `pre-prod` → `main` por PR, com os checks **Lint** e **Testes** do CI.

---

Projeto acadêmico de Engenharia de Software e Gestão e Qualidade de Software (Ciência da Computação, USJT).
