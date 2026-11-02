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

**Accessibility and widths in the E2E tests (NFIN01, NFIN02).** The E2E tests run at 1280 px (`desktop`)
and 390 px (`celular`), and every test ends with the axe analysis (WCAG 2.0, 2.1 and 2.2, levels A and
AA) and with a check that the page does not scroll horizontally. Tests import `test` and `expect` from
`e2e/support/test.ts`, which does this on its own; an intermediate screen calls `expectAccessible` in
the test itself. A failure lists rule, impact and elements; the full result of each analysis is attached
as "acessibilidade (axe)" in the Playwright report (`npx playwright show-report` locally; in CI, the
`playwright-report` artifact).

**Accents in the texts (NFIN04).** `src/app/shared/portuguese-accents.spec.ts` reads the visible text of
the templates (and the attributes announced by screen readers, such as `aria-label`) and the sentences
in the code, and fails on a word from the `UNACCENTED` list written without its accent (`nao`, `indice`,
`pagina`...). Found a new misspelling without accent? Add it to the list.

**Path with parentheses on Windows.** Angular's test builder passes Vitest the absolute path of each spec
without escaping it, and a folder such as `7-SEM (2026-2)` makes Vitest find no tests. `npm test` works
around it on its own (`scripts/unit-test.mjs`: it mounts the parent folder on a temporary drive with
`subst` and unmounts it at the end). Outside Windows, or without those characters in the path, it runs
directly.

## Data layer

Screens talk only to the `BiosApi` contract (`src/app/core/api/bios-api.ts`): one method per OpenAPI
operation used by the app, with input and output from the generated types. Failures arrive as
`ApiError` (`status`, `code`, `message`, `details`), with the API's text. The provider is chosen in
`app.config.ts`; integrating with the real API means swapping only that provider.

**Session** (`src/app/core/session/`): `SessionStore` keeps the session in memory only (reloading the
page ends the local session) and provides the token to the provider. The `BiosApi` that screens receive
renews the access token on its own: a `401 NOT_AUTHENTICATED` with an open session triggers a single
`refreshSession` (simultaneous calls wait for the same one) and repeats the operation; if renewal
fails, the session is cleared and the app goes to `/entrar?voltar=<route>&sessao=encerrada`. Every route
is private by default (`privateByDefault`); public ones declare `data: { public: true }`.

In the presentation version, the provider is `MockBiosApi` (`src/app/core/mocks/`):

- **Reads** come from the captured responses (profiles, explanations, sectors, SDGs); search is redone
  over the captured profiles, and a test checks that it gives the same result as each real captured
  search. Captures load on demand (`mock-data` chunk), outside the initial bundle.
- **What the demo changes** (accounts, sessions, e-mail links, API keys, blacklist) lives in memory and
  resets on reload. Ready-made accounts: `apresentacao@example.com` (`USER`) and
  `administracao@example.com` (`ADMIN`), password `Apresentacao2026`. The links the e-mails would carry
  are kept in `MockMailbox`.
- **Determinism:** latency and failure scenarios (`forcedErrors`) come from `MOCK_API_CONFIG`, never
  from randomness. What the presentation does not reproduce (an export that was not captured, a sector
  outside the list) answers `422 NOT_AVAILABLE_IN_PRESENTATION` instead of making data up.

## Panel

Private routes live in the panel shell (`src/app/layout/`): a fixed side menu on wide screens and a
drawer on narrow ones, with the current item marked by `aria-current`. The menu comes from `PANEL_NAV`
(`panel-nav.ts`), filtered by role; only `ADMIN` sees the administration. The top bar shows who is
signed in (account name and email, session role). `/admin` routes require the role through
`requireRole('ADMIN')`: a `USER` goes to `/acesso-negado`. An unknown address with a session shows the
"not found" page inside the panel; without one, outside it, without asking to sign in. On every screen
change, focus moves to the content (`main#conteudo`).

## Sign-up and account forms

`/cadastro`, `/confirmar-email/:token` and `/reenviar-confirmacao` are public (`src/app/features/auth/`).
The confirmation route is the one in the link the API emails. Name, email and password rules
(`shared/forms/account-rules.ts`) are the API's, with the same messages; email uses Zod 4's `z.email()`
pattern, the same as bios-core-api. `bios-password-field` has a show-password button and, for a new
password, the policy visible before the first error.

Password: `/esqueci-senha` requests the link (same message whether or not the account exists) and
`/redefinir-senha/:token`, the route in the API's email link, sets the new one; a password outside the
policy does not spend the link. At `/conta/senha`, a signed-in user changes the password by giving the
current one; API errors without `details` (wrong current password, new equal to current) mark the right
field (`setApiError`). Changing or resetting ends every session, this browser's included: the app clears
the local session and the login page says why (`?senha=alterada` or `?senha=redefinida`).

After submitting, sign-up and resend show only the API's message, the same for a new and an already
registered email (RF01 b). In the presentation build, `bios-mail-preview` stands in for the inbox: it
shows the link the email would carry as a hyperlink, or says nothing arrived.

`/entrar` opens the session and goes to the destination stored in `?voltar=`, if it is a path of the app
itself (`safeReturnUrl`), or to `/painel`. Messages are the API's, without pointing at which field was
wrong. An unconfirmed account gets the option to resend the link; a lockout after failed attempts shows
the remaining time and disables the button until then. The sign-in password only has to be present
(`currentPasswordRules`), without the new-password policy.

The account menu has "Sair" (sign out) and "Sair de todos os dispositivos" (sign out everywhere); the
second asks for confirmation (`confirmAction`, in `shared/dialogs/`, with initial focus on "Cancelar").
The local session is cleared even if the call fails, and the app goes to the login page.

## Account

`/conta` (`src/app/features/account/`) shows the signed-in person's data (name, email, role and address)
and edits the name and the address. The account comes from `OwnAccount` (`core/account/`), the same one
the top bar menu reads: on save, the API's response applies in both places, without another read.

- **Only what changed:** "Salvar" is enabled only when something changed (`accountChanges`), and the
  edit sends only what changed; the address goes whole, with the postal code as digits.
- **Optional address:** without a saved address, blank fields are not required; starting to fill them in
  requires the others, with the API's rules and messages (`shared/forms/address-rules.ts`). The postal
  code has a mask (`00000-000`) and the state comes from the 27 abbreviations.
- **Remove address:** asks for confirmation and sends `address: null`.
- **Delete account:** the dialog lists what will be erased and asks for the password; "Excluir conta" is
  enabled only once it is filled in, and a wrong password keeps the dialog open, with the error on the
  field. Once deleted, the local session is cleared (the API already ended it) and the app goes back to
  the home page with a notice (`/?conta=excluida`).
- Email change (FE-13) comes in as another section of this page.

## Screen states and errors

Every screen that loads data uses the same states (`src/app/shared/`, NFIN03):

- `bios-async-state` combines loading (`bios-loading`, announced to screen readers), error
  (`bios-error-state`) and empty (`bios-empty-state`, with the list's own explanation), and marks the
  region with `aria-busy` while waiting.
- `describeError` decides how to show a failure: the message is always the API's (a failure that did not
  come from the API becomes a generic message in Portuguese); `429` shows when it can be retried and
  blocks "Tentar de novo" until then; `503` is a temporary unavailability, with the button.
- Forms: `applyApiErrors` marks each field by the `details[].path` of a 422 (`apiErrorOf` reads the
  message in `mat-error`), and `bios-form-error-summary` shows at the top what does not belong to a field.

## Company profile

The CNPJ lookup (`bios-cnpj-search`, in `src/app/features/profile/`) sits at the top of the panel, on
`/empresas` and, on wide screens, in the top bar. The CNPJ is checked before any call, with the
algorithm of the API's value object (`shared/cnpj/cnpj.ts`: numeric and alphanumeric, check digits,
rejection of single-character sequences), and the profile opens at `/empresas/<cnpj>` with the
normalized CNPJ, without the mask in the URL.

The profile shows the legal name, the trade name and the "Dados cadastrais" (registration data)
section: status in Portuguese (an unrecognized one with the provider's text), company size, address,
CNAEs with formatted code and description, and when the source last updated the record. "Company not
found" (`404`) and temporary unavailability (`503`, with "Tentar de novo") are different screens.
Evidence and the per-SDG indices come as new sections of the same page, from the same
`getCompanyProfile`.

## API keys

`/conta/chaves` (`src/app/features/api-keys/`) creates, lists and revokes the account's API keys. The
name follows the API rule (2 to 60 characters, not counting surrounding spaces). The full key only
exists in the creation response and is shown once, in a dialog with "Copiar a chave" (copy key), which
announces "Chave copiada" and, if copying fails, leaves the key selected for Ctrl+C; the dialog only
closes through its button, and nothing in the app keeps the value afterwards. The list shows only name,
prefix, creation date and last use ("Nunca usada" when never used), with the count against the limit of
10 active keys. Revoking asks for confirmation (`confirmAction`); a key that no longer exists (`404`)
refreshes the list. The page also explains how to use the key in the public API: the `x-api-key`
header on `GET /v1/companies/{cnpj}`, with the OpenAPI documentation at `/docs` on the API's address.

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

## Company search

`/pesquisa` (`src/app/features/search/`) filters by name, UF, city, CNAE and, for an SDG chosen among the
ones BIOS calculates (`listOds`), by minimum score and confidence. Criteria live in the URL
(`/pesquisa?cnae=24&ods=13&indice_min=0&pagina=2&por_pagina=50`): the link can be shared and the
browser's back button redoes the previous search. `search-criteria.ts` converts between URL, form and API
query; minimums and ordering (`ordem`, whose control comes with FE-21) only exist with the SDG, and the
query never carries them without it. Field rules (`search-rules.ts`) are the API's.

With an SDG, each company shows score and confidence in separate columns; without a calculation it shows
"Sem índice" (no score), never zero. The list is a table on wide screens and cards below 720 px; the
table scrolls inside its own container. An SDG outside the calculated ones shows the available ones, with
a button to search in each.

## Sectors

`/setores` shows how a sector's (CNAE division) average score for an SDG evolves month by month
(`src/app/features/sectors/`). Sector and SDG live in the URL (`/setores?cnae=24&ods=13`); the field
accepts a division, group, class or subclass, with or without mask, and suggests the sectors from
`listSectors`. Everything is aggregated: no company appears on the screen.

The line chart (ECharts, only the modules in use, loaded on demand) puts average score and average
confidence on separate axes, never combined; the table next to it carries the same numbers for screen
readers. An average withheld for the minimum sample is an explained gap, never zero, and the counts stay
visible. With fewer than two recorded months, the screen says the history is still insufficient and
shows what there is. In the presentation build, only the windows captured from the API appear: no month
is generated in the front end.

## Administration

`/admin/dominios-bloqueados` is the blacklist of email domains (`src/app/features/admin/`), for the
`ADMIN` role only: a `USER` does not see the menu item and, through the URL, goes to `/acesso-negado`.
The list is alphabetical and paginated, with the origin ("Carga inicial" or "Administrador") and the
date it was added. Adding validates the domain with the API's rule (`shared/forms/domain-rules.ts`: the
domain only, without `@`) and stores it in lowercase; an already blocked domain marks the field with the
API's notice. Removing asks for confirmation. The effect is immediate: the domain starts (or stops)
blocking sign-ups and email changes right away.

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

## Publishing (Vercel)

The presentation version is static and is published on Vercel (Hobby plan) on every merge into
`main`. `vercel.json` defines the install (the same npm 11 as CI), the build (`npm run build`), the
published folder (`dist/bios-webapp/browser`) and the rewrite of every route to `index.html`, so a deep
link (`/empresas/<cnpj>`) opens directly. The footer says the data is captured, and an E2E test checks
that the site makes no request outside its own origin: there is no real API and no secret in the build.

To create the project (once):

1. On vercel.com, **Add New → Project → Import** the `odavibatista/bios-webapp` repository.
2. **Framework Preset:** Other (`vercel.json` already sets install, build and output). No environment
   variables.
3. Once created: **Settings → Git → Production Branch:** `main`; **Settings → Build and Deployment →
   Node.js Version:** 22.x, the same as Volta.
4. Check the public address: the home page opens, and a route that does not exist
   (`/rota-que-nao-existe`) shows the app's "not found" page, not Vercel's 404.

## Contribution flow

Branch from `develop`, a PR back into it with a Conventional Commits title, and promotion
`develop` → `pre-prod` → `main` through PRs, with the CI's **Lint** and **Testes** checks. Branch
protection (NFSE11) is versioned in [`.github/rulesets/`](.github/rulesets/README.md), with the steps
to apply it on GitHub.

---

Academic project for Software Engineering and Software Management and Quality (Computer Science, USJT).
