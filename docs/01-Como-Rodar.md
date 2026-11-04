# 01. Como rodar

🇧🇷 **Português** · 🇺🇸 [English](en/01-Getting-Started.md)

[Índice da documentação](README.md) · [02. Arquitetura](02-Arquitetura.md) →

> Instalação, scripts do projeto, tipos da API e nota sobre caminhos no Windows.

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

## Tipos da API

O CI do bios-core-api publica o documento OpenAPI como artefato (`openapi`). Para
atualizar, substitua `api/openapi.json` por ele e rode `npm run api:types`.

## Caminho com parênteses no Windows

O builder de testes do Angular passa ao Vitest o caminho
absoluto de cada spec sem escapar, e uma pasta como `7-SEM (2026-2)` faz o Vitest não achar nenhum
teste. O `npm test` contorna isso sozinho (`scripts/unit-test.mjs`: monta a pasta-mãe numa unidade
temporária com `subst` e desmonta no fim). Fora do Windows, ou sem esses caracteres no caminho, roda
direto.
