/** UFs e municípios do IBGE, como o gerador da base os grava (`scripts/build-locations-data.mjs`). */
export interface LocationRows {
  states: [id: number, acronym: string, name: string][];
  cities: [id: number, name: string, stateId: number, aliases?: string[]][];
}

export interface CatalogCity {
  code: string;
  name: string;
  uf: string;
  searchName: string;
  aliases: readonly string[];
}

/** Sem acento, em maiúsculas e só com letras, dígitos e espaço simples, como a API compara. */
export function toSearchName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

/** Mesma ordem da API: começo do nome, começo de palavra, meio do nome e, por fim, outra grafia. */
function rankOf({ searchName, aliases }: CatalogCity, term: string): number | null {
  if (searchName.startsWith(term)) return 0;
  if (searchName.includes(` ${term}`)) return 1;
  if (searchName.includes(term)) return 2;

  return aliases.some((alias) => alias.includes(term)) ? 3 : null;
}

const byName = (a: CatalogCity, b: CatalogCity) => a.searchName.localeCompare(b.searchName);

/** O catálogo do IBGE no navegador, com as regras de `GET /locations/...` da API (RF38). */
export class LocationCatalog {
  readonly states: { ibge_code: string; acronym: string; name: string }[];
  private readonly byState = new Map<string, CatalogCity[]>();

  constructor({ states, cities }: LocationRows) {
    const acronyms = new Map(states.map(([id, acronym]) => [id, acronym]));

    this.states = states
      .map(([id, acronym, name]) => ({ ibge_code: String(id), acronym, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    for (const [id, name, stateId, aliases = []] of cities) {
      const uf = acronyms.get(stateId) ?? '';
      const list = this.byState.get(uf) ?? [];

      list.push({
        code: String(id),
        name,
        uf,
        searchName: toSearchName(name),
        aliases: aliases.map(toSearchName),
      });
      this.byState.set(uf, list);
    }
  }

  find(code: string, uf: string): CatalogCity | null {
    return this.byState.get(uf)?.find((city) => city.code === code) ?? null;
  }

  search(uf: string, text: string | undefined): CatalogCity[] {
    const cities = this.byState.get(uf) ?? [];
    const term = toSearchName(text ?? '');

    if (term === '') return [...cities].sort(byName);

    return cities
      .flatMap((city) => {
        const rank = rankOf(city, term);

        return rank === null ? [] : [{ city, rank }];
      })
      .sort((a, b) => a.rank - b.rank || byName(a.city, b.city))
      .map(({ city }) => city);
  }
}
