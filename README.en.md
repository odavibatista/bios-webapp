# bios-webapp

🇧🇷 [Português](README.md) · 🇺🇸 **English**

[![CI](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml)

Front end of **BIOS — Business Intelligence on Sustainability**, in Angular. For each company, it shows
the adherence index to **SDGs 13 and 15**, the confidence and the evidence behind them, each with its
reference to the official source.

> **Presentation version:** the app runs without the API online. The data comes from real responses of
> [bios-core-api](https://github.com/odavibatista/bios-core-api), captured and stored in the repository, behind a
> service with the same interface as the API: a real integration only swaps that service. Legal-entity
> data only (INL02).

The app speaks Portuguese, like the API. Requirements and modeling:
[bios-docs](https://github.com/odavibatista/bios-docs) (in Portuguese).

## Stack

| Layer           | Technology                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Runtime         | Node.js 22.23.4 and npm 11, pinned by Volta (`volta` in `package.json`)                             |
| Framework       | Angular 22 (standalone, zoneless, signals), TypeScript 6 `strict` with `strictTemplates`            |
| Components      | Angular Material 3 and CDK, with a theme generated from the BIOS palette                            |
| Charts          | ECharts (`ngx-echarts`)                                                                             |
| Fonts and icons | Inter and Material Symbols served by the app itself (the presentation works offline)                |
| API types       | `@hey-api/openapi-ts`, from the bios-core-api OpenAPI document (`api/openapi.json`)                 |
| Unit tests      | Vitest (Angular builder) and `@testing-library/angular`, 75% minimum coverage                       |
| E2E tests       | Playwright (Chromium)                                                                               |
| Quality         | Angular ESLint with type-aware linting, Prettier, Husky, lint-staged, commitlint and GitHub Actions |

## Quick start

```bash
npm install          # dependencies (with Volta, the right Node and npm come along)
npm start            # http://localhost:4200
```

| Script                                           | Purpose                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `start` / `build` / `watch`                      | Development server, production build and continuous build                                      |
| `test` / `test:watch` / `test:cov`               | Unit tests (once, in watch mode, with coverage)                                                |
| `test:e2e`                                       | E2E tests with Playwright (starts the app itself; first run `npx playwright install chromium`) |
| `lint` / `format` / `format:check` / `typecheck` | ESLint, Prettier and type checking                                                             |
| `api:types`                                      | Regenerates the types in `src/app/core/api/generated` from `api/openapi.json`                  |
| `verify`                                         | Types, lint, tests with coverage and build: what CI requires                                   |

**API types.** The bios-core-api CI publishes the OpenAPI document as an artifact (`openapi`). To update,
replace `api/openapi.json` with it and run `npm run api:types`.

**Path with parentheses on Windows.** Angular's test builder passes Vitest the absolute path of each spec
without escaping it, and a folder such as `7-SEM (2026-2)` makes Vitest find no tests. `npm test` works
around it on its own (`scripts/unit-test.mjs`: it mounts the parent folder on a temporary drive with
`subst` and unmounts it at the end). Outside Windows, or without those characters in the path, it runs
directly.

## Presentation data

The responses come from a local API with real companies, captured by `scripts/capture-api.mjs`, not
from made-up data: the demo shows the API's real behavior, errors included.

- **One capture per file:** `src/app/core/mocks/fixtures/<operationId>/<scenario>.ts`, with
  `satisfies CapturedResponse<...>` over the generated type of the operation and status. If the API
  changes the shape of a response, `typecheck` rejects the old capture. The XLSX spreadsheet sits next
  to it as a file.
- **Manifest** (`fixtures/manifest.json`): bios-core-api commit, date of each phase, the demo account
  and the companies, with the reason for each one.
- **Nothing secret or personal:** passwords, tokens and the API key secret become placeholders before
  writing; the demo account uses the reserved `example.com` domain. `fixtures.spec.ts` rejects a CPF,
  an e-mail from another domain, a JWT and a key secret (INL02).

To capture again: a local API (bios-core-api `develop`) with a clean database, initial load, IBAMA
ingestion and GHG sync, and the API e-mails going to a Mailpit (`SMTP_HOST=localhost`,
`SMTP_PORT=1025` in the environment of whoever starts the API), where the script reads the links from.
Then:

```bash
BIOS_CAPTURE_PASSWORD=<password> BIOS_CORE_DIR=<bios-core-api folder> \
  node scripts/capture-api.mjs contas admin empresas setores limites
```

The phases and scenarios are in the script header. The `limites` phase blocks login from the IP for 15
minutes (RF20), so it runs last; `setores` is repeated in another month so the sector evolution series
has two real windows.

## Theme

The colors come from the project's presentation (`bios-docs/assets/BIOS - PPTX.pptx`). The Material 3
palettes (`src/styles/_theme-colors.scss`) were generated with `ng generate @angular/material:theme-color`,
and the exact colors are CSS variables for the brand and the charts:

| Variable             | Color     | Use                        |
| -------------------- | --------- | -------------------------- |
| `--bios-brand-green` | `#2C5F2D` | Primary: top bar, headings |
| `--bios-brand-leaf`  | `#97BC62` | Tertiary: highlights       |
| `--bios-brand-moss`  | `#5B6B5B` | Secondary text             |
| `--bios-brand-ink`   | `#1A1A1A` | Text                       |
| `--bios-brand-paper` | `#F5F5F5` | Surfaces, footer           |

## Contribution flow

Branch from `develop`, a PR back into it with a Conventional Commits title, and promotion
`develop` → `pre-prod` → `main` through PRs, with the CI's **Lint** and **Testes** checks.

---

Academic project for Software Engineering and Software Management and Quality (Computer Science, USJT).
