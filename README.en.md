# bios-webapp

🇧🇷 [Português](README.md) · 🇺🇸 **English**

[![CI](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/odavibatista/bios-webapp/actions/workflows/ci.yml)

Front end of **BIOS — Business Intelligence on Sustainability**, in Angular. For each company, it shows
the adherence index to **SDGs 13 and 15**, the confidence and the evidence behind them, each with its
reference to the official source.

> **Presentation version:** the app runs without the API online. The data comes from real responses of
> [bios-core-api](https://github.com/odavibatista/bios-core-api), captured and stored as JSON, behind a
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
