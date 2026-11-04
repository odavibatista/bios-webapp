# 06. Quality and tests

🇧🇷 [Português](../06-Qualidade-e-Testes.md) · 🇺🇸 **English**

[Documentation index](README.md) · ← [05. Presentation data](05-Presentation-Data.md) · [07. Theme and publishing](07-Theme-and-Publishing.md) →

> Accessibility in e2e tests, accent check and contribution flow.

## Accessibility and widths in e2e tests (NFIN01, NFIN02)

The E2E tests run at 1280 px (`desktop`)
and 390 px (`celular`), and every test ends with the axe analysis (WCAG 2.0, 2.1 and 2.2, levels A and
AA) and with a check that the page does not scroll horizontally. Tests import `test` and `expect` from
`e2e/support/test.ts`, which does this on its own; an intermediate screen calls `expectAccessible` in
the test itself. A failure lists rule, impact and elements; the full result of each analysis is attached
as "acessibilidade (axe)" in the Playwright report (`npx playwright show-report` locally; in CI, the
`playwright-report` artifact).

## Accents in the texts (NFIN04)

`src/app/shared/portuguese-accents.spec.ts` reads the visible text of
the templates (and the attributes announced by screen readers, such as `aria-label`) and the sentences
in the code, and fails on a word from the `UNACCENTED` list written without its accent (`nao`, `indice`,
`pagina`...). Found a new misspelling without accent? Add it to the list.

## Contribution flow

Branch from `develop`, a PR back into it with a Conventional Commits title, and promotion
`develop` → `pre-prod` → `main` through PRs, with the CI's **Lint** and **Testes** checks. Branch
protection (NFSE11) is versioned in [`.github/rulesets/`](../../.github/rulesets/README.md), with the steps
to apply it on GitHub.

---

Academic project for Software Engineering and Software Management and Quality (Computer Science, USJT).
