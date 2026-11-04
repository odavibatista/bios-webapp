# 01. Getting started

🇧🇷 [Português](../01-Como-Rodar.md) · 🇺🇸 **English**

[Documentation index](README.md) · [02. Architecture](02-Architecture.md) →

> Installation, project scripts, API types and a note on Windows paths.

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

## API types

The bios-core-api CI publishes the OpenAPI document as an artifact (`openapi`). To update,
replace `api/openapi.json` with it and run `npm run api:types`.

## Parentheses in the path on Windows

Angular's test builder passes Vitest the absolute path of each spec
without escaping it, and a folder such as `7-SEM (2026-2)` makes Vitest find no tests. `npm test` works
around it on its own (`scripts/unit-test.mjs`: it mounts the parent folder on a temporary drive with
`subst` and unmounts it at the end). Outside Windows, or without those characters in the path, it runs
directly.
