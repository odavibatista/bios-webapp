# 04. Companies and indexes

🇧🇷 [Português](../04-Empresas-e-Índices.md) · 🇺🇸 **English**

[Documentation index](README.md) · ← [03. Accounts and access](03-Accounts-and-Access.md) · [05. Presentation data](05-Presentation-Data.md) →

> Company profile, evidence, SDG indexes, search, export and sectors.

## Company profile

### Lookup

The CNPJ lookup (`bios-cnpj-search`, in `src/app/features/profile/`) sits at the top of the panel, on
`/empresas` and, on wide screens, in the top bar. The CNPJ is checked before any call, with the
algorithm of the API's value object (`shared/cnpj/cnpj.ts`: numeric and alphanumeric, check digits,
rejection of single-character sequences), and the profile opens at `/empresas/<cnpj>` with the
normalized CNPJ, without the mask in the URL.

The same field accepts a legal or trade name. Text of up to 100 characters with at least one
three-character word opens `/empresas?nome=...`, using `searchCompanies` over the local database
with 20 results per page. The name and page stay in the URL when returning from a profile. Invalid
text is rejected before a call. An empty result explains that only companies previously looked up
by CNPJ appear and offers the same field for a CNPJ lookup.

### Registration data

The profile shows the legal name, the trade name and the "Dados cadastrais" (registration data)
section: status in Portuguese (an unrecognized one with the provider's text), company size, address,
CNAEs with formatted code and description, and when the source last updated the record. "Company not
found" (`404`) and temporary unavailability (`503`, with "Tentar de novo") are different screens.

### Evidence

The "Evidências" section uses the same `getCompanyProfile` response and separates environmental
infractions, administrative conduct and GHG inventories.

- **Entry:** each one shows its source, state and publication, collection and validity dates.
- **Links:** only absolute HTTPS URLs without credentials become external links; otherwise, the
  identifier appears as text. A finding without either is displayed as unverified, without its
  confirming summary.
- **Missing data:** `UNKNOWN` and `NOT_FOUND` have distinct explanations; provenance indicates
  collection, stored data, pending updates or an unavailable source, with a suggested retry time
  when provided.
- **Sanctions:** dates are source data and do not assert current legal effect.

### SDG indexes

The "Índices por ODS" section shows each active SDG in its own card, with score and confidence side
by side and no combined index or comparison between SDGs.

- **Scale:** neutral, marks zero and appears only for calculated scores.
- **No index:** pending scores and missing conclusive evidence have different explanations.
- **Coverage:** source coverage and suggested retry time are shown in text.

### How the index was calculated

Contribution details are available from each SDG card through "Como o índice foi calculado": each
contribution shows its source, category, reference, weight, signal and points, followed by their
sum. Reduced weights and outdated evidence have explicit notices. A button focuses the corresponding
evidence in the same profile; a source link appears only for a valid HTTPS address. The profile
preserves score hundredths so the displayed sum matches the card.

## Company search

`/pesquisa` (`src/app/features/search/`) filters by name, UF, city, CNAE and, for an SDG chosen among the
ones BIOS calculates (`listOds`), by minimum score and confidence. Criteria live in the URL
(`/pesquisa?cnae=24&ods=13&indice_min=0&pagina=2&por_pagina=50`): the link can be shared and the
browser's back button redoes the previous search. `search-criteria.ts` converts between URL, form and API
query; minimums and ordering (`ordem=asc` or `ordem=desc`) only exist with the SDG, and the
query never carries them without it. Field rules (`search-rules.ts`) are the API's.

With an SDG, each company shows score and confidence in separate columns; without a calculation it shows
"Sem índice" (no score), never zero. The list is a table on wide screens and cards below 720 px; the
table scrolls inside its own container. An SDG outside the calculated ones shows the available ones, with
a button to search in each.
When ordered by score, companies without a calculation stay last in both directions and are visually
separated. Ties use higher confidence, then CNPJ. The table header announces the sort direction.

When results exist, **Exportar XLSX** downloads the full list using the URL filters and order, without
pagination. The file and its name come from the captured API response; the browser does not generate
the spreadsheet. Searches without a captured file explain the presentation version's limit. Empty
lists, oversized exports, and rate limits are reported beside the results.

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

### Profile order and source status

The profile follows the order identification, indices, evidence and sources: the result first, then what
supports it. A category without evidence states, source by source, whether the lookup found no record, is
still running or could not be verified. The "Fontes consultadas" section gathers the status of each
source, with the date of the last collection. For GHG Protocol, whose registry is voluntary, a missing
inventory appears as not located in the registry, without confirming absence (IND02). In the index
explanation, a contribution with a weight and zero points states that the category cap was already
reached by other evidence.
