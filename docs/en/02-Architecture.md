# 02. Architecture

🇧🇷 [Português](../02-Arquitetura.md) · 🇺🇸 **English**

[Documentation index](README.md) · ← [01. Getting started](01-Getting-Started.md) · [03. Accounts and access](03-Accounts-and-Access.md) →

> Data layer, session, panel shell and screen states.

## Data layer

Screens talk only to the `BiosApi` contract (`src/app/core/api/bios-api.ts`): one method per OpenAPI
operation used by the app, with input and output from the generated types. Failures arrive as
`ApiError` (`status`, `code`, `message`, `details`), with the API's text. The provider is chosen in
`app.config.ts`; integrating with the real API means swapping only that provider.

**Session** (`src/app/core/session/`): `SessionStore` keeps the session in memory only and provides
the token to the provider. Only the presentation version provides `TabStorage`, where the mock session
survives a page reload and ends when the tab closes. The `BiosApi` that screens receive
renews the access token on its own: a `401 NOT_AUTHENTICATED` with an open session triggers a single
`refreshSession` (simultaneous calls wait for the same one) and repeats the operation; if renewal
fails, the session is cleared and the app goes to `/entrar?voltar=<route>&sessao=encerrada`. Every route
is private by default (`privateByDefault`); public ones declare `data: { public: true }`.

In the presentation version, the provider is `MockBiosApi` (`src/app/core/mocks/`):

- **Reads** come from the captured responses (profiles, explanations, sectors, SDGs); search is redone
  over the captured profiles, and a test checks that it gives the same result as each real captured
  search. Captures load on demand (`mock-data` chunk), outside the initial bundle.
- **What the demo changes** (accounts, sessions, e-mail links, API keys, blacklist) stays in the tab
  (`sessionStorage`), with password digests only, and ends when it closes. Ready-made accounts: `apresentacao@example.com` (`USER`) and
  `administracao@example.com` (`ADMIN`), password `Apresentacao2026`. The links the e-mails would carry
  are kept in `MockMailbox`.
- **Determinism:** latency and failure scenarios (`forcedErrors`) come from `MOCK_API_CONFIG`, never
  from randomness. What the presentation does not reproduce (an export that was not captured, a sector
  outside the list) answers `422 NOT_AVAILABLE_IN_PRESENTATION` instead of making data up.

## Panel

`/demonstracao` signs in with the demo account and opens the panel: it is where the presentation QR
Code points. The password is not in the URL, and outside the presentation version the route leads to login.

`/painel` is where login leads (UC18, RF34): the search and the companies whose index changed most
recently, in cards that open the profile. Each card shows, per SDG, the current index and confidence and
the direction, cause and date of the change, never the previous index or the variation (IND03). The order
is chronological only, and the page lives in the URL (`?pagina=2`), so "back" returns to the same page.

Private routes live in the panel shell (`src/app/layout/`): a fixed side menu on wide screens and a
drawer on narrow ones, with the current item marked by `aria-current`. The menu comes from `PANEL_NAV`
(`panel-nav.ts`), filtered by role; only `ADMIN` sees the administration. The top bar shows who is
signed in (account name and email, session role). `/admin` routes require the role through
`requireRole('ADMIN')`: a `USER` goes to `/acesso-negado`. An unknown address with a session shows the
"not found" page inside the panel; without one, outside it, without asking to sign in. On every screen
change, focus moves to the content (`main#conteudo`).

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
