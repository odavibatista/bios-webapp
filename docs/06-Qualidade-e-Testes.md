# 06. Qualidade e testes

🇧🇷 **Português** · 🇺🇸 [English](en/06-Quality-and-Tests.md)

[Índice da documentação](README.md) · ← [05. Dados da versão de apresentação](05-Dados-de-Apresentação.md) · [07. Tema e publicação](07-Tema-e-Publicação.md) →

> Acessibilidade nos e2e, trava de acentuação e fluxo de contribuição.

## Acessibilidade e larguras nos e2e (NFIN01, NFIN02)

Os e2e rodam em 1280 px (`desktop`) e 390 px
(`celular`), e todo teste termina com a análise do axe (WCAG 2.0, 2.1 e 2.2, níveis A e AA) e com a
checagem de que a página não rola na horizontal. Os testes importam `test` e `expect` de
`e2e/support/test.ts`, que faz isso sozinho; uma tela intermediária pede `expectAccessible` no próprio
teste. A falha lista regra, impacto e elementos; o resultado completo de cada análise vai como anexo
"acessibilidade (axe)" no relatório do Playwright (`npx playwright show-report` localmente; no CI, o
artefato `playwright-report`).

## Acentuação dos textos (NFIN04)

`src/app/shared/portuguese-accents.spec.ts` lê o texto visível dos
templates (e os atributos que o leitor de tela anuncia, como `aria-label`) e as frases do código, e
reprova palavra sem acento da lista `UNACCENTED` (`nao`, `indice`, `pagina`...). Achou uma grafia nova
sem acento? Acrescente-a à lista.

## Fluxo de contribuição

Branch a partir do `develop`, PR de volta para ele com título em Conventional Commits, e promoção
`develop` → `pre-prod` → `main` por PR, com os checks **Lint** e **Testes** do CI. A proteção dos
branches (NFSE11) está versionada em [`.github/rulesets/`](../.github/rulesets/README.md), com o passo
para aplicá-la no GitHub.

---

Projeto acadêmico de Engenharia de Software e Gestão e Qualidade de Software (Ciência da Computação, USJT).
