import type {
  CompanyAnalytics,
  CompanyFullProfileResponse,
  CompanyIndexEvolution,
  CompanyMovementItem,
  CompanySearchItem,
  ListSectorsResponse,
  OdsListResponse,
  ScoreExplanationResponse,
  SearchCompaniesData,
  SearchCompaniesResponse,
  SectorEvolution,
} from '../api/generated';
import type { ApiError } from '../api/api-error';
import {
  companyFacts,
  summarizeCompanies,
  type AnalyticsCompany,
  type CompanyFacts,
} from './company-analytics';
import type { CompanyEntry } from './company-archive';
import { byMostRecentMovement, companyMovementOf, evidenceDates } from './company-movements';
import { capturedBody, capturedError, capturesOf, notInPresentation } from './mock-captures';

/**
 * Regras das empresas na versão de apresentação: perfis, explicações e setores vêm das
 * respostas capturadas; a pesquisa é refeita sobre os perfis capturados com as regras do UC08
 * (conferidas nos testes contra as pesquisas reais capturadas).
 */

/** `cityNames`: o município escolhido, com o nome oficial e as grafias de outras fontes. */
type SearchQuery = NonNullable<SearchCompaniesData['query']> & { cityNames?: readonly string[] };

/** CNPJ sem pontuação e em maiúsculas, como a API o normaliza (UC06, regra 8). */
export function normalizeCnpj(value: string): string {
  return value.replace(/[.\-/\s]/g, '').toUpperCase();
}

/**
 * Dígitos verificadores do CNPJ, numérico ou alfanumérico (formato da Receita a partir de
 * julho de 2026): cada caractere vale o código ASCII menos 48.
 */
export function isValidCnpj(cnpj: string): boolean {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digit = (chars: string): number => {
    const weights =
      chars.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = [...chars].reduce(
      (total, char, i) => total + (char.charCodeAt(0) - 48) * (weights[i] ?? 0),
      0,
    );
    const rest = sum % 11;

    return rest < 2 ? 0 : 11 - rest;
  };
  const first = digit(cnpj.slice(0, 12));

  return first === Number(cnpj[12]) && digit(cnpj.slice(0, 13)) === Number(cnpj[13]);
}

/** Perfis completos capturados, pelo CNPJ (a "base local" da versão de apresentação). */
export const PROFILES: ReadonlyMap<string, CompanyFullProfileResponse> = new Map(
  capturesOf('getCompanyProfile')
    .filter((item) => item.status === 200 && item.scenario !== 'primeira-consulta')
    .map((item) => {
      const profile = item.body as CompanyFullProfileResponse;

      return [profile.cnpj, profile] as const;
    }),
);

/** ODS que o BIOS calcula (os ativos). */
export function activeOds(): number[] {
  return capturedBody<OdsListResponse>('listOds/sucesso').data.map((ods) => ods.ods_number);
}

/** Erro de ODS que o BIOS não calcula, com o número pedido (UC08, regra 8). */
export function odsNotAvailable(
  key: 'searchCompanies/ods-nao-calculado' | 'getSectorEvolution/ods-nao-calculado',
  ods: number,
  path: string,
  now: number,
): ApiError {
  const valid = activeOds();

  return capturedError(key, path, now, {
    message: `O ODS ${ods} não é calculado pelo BIOS. ODS disponíveis: ${valid.join(', ')}.`,
    details: { ods, valid_ods: valid },
  });
}

/** Texto sem acento, caixa nem pontuação, em palavras (como a busca por nome compara). */
export function words(text: string | null | undefined): string[] {
  return (text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** O que a pesquisa precisa saber de um perfil. */
export function entryOf(profile: CompanyFullProfileResponse): CompanyEntry {
  return {
    cnpj: profile.cnpj,
    legal_name: profile.legal_name,
    trade_name: profile.trade_name,
    registration_status: profile.registration_status,
    city: profile.address.city ?? '',
    uf: profile.address.uf ?? '',
    main_cnae: profile.main_cnae,
    cnaes: [profile.main_cnae?.code, ...profile.secondary_cnaes.map((item) => item.code)].filter(
      (code): code is string => code != null,
    ),
    scores: Object.fromEntries(
      profile.ods_scores.map((score) => [
        score.ods_number,
        { score_value: score.score_value, confidence_value: score.confidence_value },
      ]),
    ),
  };
}

/** Item da pesquisa, com o índice e a confiança do ODS escolhido. */
export function searchItem(entry: CompanyEntry, ods?: number): CompanySearchItem {
  const score = ods === undefined ? undefined : entry.scores[ods];

  return {
    cnpj: entry.cnpj,
    legal_name: entry.legal_name,
    trade_name: entry.trade_name,
    registration_status: entry.registration_status,
    city: entry.city,
    uf: entry.uf,
    main_cnae: entry.main_cnae,
    ods_score:
      ods === undefined
        ? null
        : {
            ods_number: ods,
            score_value: score?.score_value ?? null,
            confidence_value: score?.confidence_value ?? null,
          },
  };
}

/** Caminho com a busca, como a API o registra nos erros (`/companies?cnae=24&ods=7`). */
export function pathWithQuery(path: string, query: object | undefined): string {
  const params = new URLSearchParams(
    Object.entries(query ?? {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return params ? `${path}?${params}` : path;
}

/** Os critérios da pesquisa, sem a paginação, em texto (para comparar com uma captura). */
export function criteriaOf(query: object | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query ?? {})
      .filter(
        ([key, value]) =>
          !['page', 'page_size'].includes(key) && value !== undefined && value !== '',
      )
      .map(([key, value]) => [key, String(value)]),
  );
}

function sameCriteria(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  return [...keys].every((key) => a[key] === b[key]);
}

/**
 * Valida os critérios da pesquisa como a API (UC08, regras 3 e 8) e devolve o erro, se houver.
 * Vale também para a exportação, que aplica os mesmos critérios (UC09, regra 4).
 */
export function searchCriteriaError(
  query: SearchQuery | undefined,
  path: string,
  now: number,
  { criterionRequired = true } = {},
): ApiError | null {
  const { name, uf, city, city_ibge_code, cnae, ods, order, min_score, min_confidence } =
    query ?? {};
  const noCriterion = [name, uf, city, city_ibge_code, cnae, ods].every(
    (value) => value === undefined || value === '',
  );

  if (criterionRequired && noCriterion) {
    return capturedError('searchCompanies/sem-criterio', path, now);
  }
  if ((city !== undefined || city_ibge_code !== undefined) && uf === undefined) {
    return capturedError('searchCompanies/ordem-sem-ods', path, now, {
      message: 'Informe a UF do município.',
      details: [{ path: 'uf', message: 'Informe a UF do município.' }],
    });
  }
  if (name !== undefined && !words(name).some((word) => word.length >= 3)) {
    return capturedError('searchCompanies/nome-curto', path, now);
  }
  if (ods !== undefined && !activeOds().includes(ods)) {
    return odsNotAvailable('searchCompanies/ods-nao-calculado', ods, path, now);
  }

  const withoutOds = (
    [
      ['order', order],
      ['min_score', min_score],
      ['min_confidence', min_confidence],
    ] as const
  ).find(([, value]) => value !== undefined);

  if (ods === undefined && withoutOds) {
    return capturedError('searchCompanies/ordem-sem-ods', path, now, {
      details: [
        { path: withoutOds[0], message: 'Informe o ODS (`ods`) a que o filtro se refere.' },
      ],
    });
  }

  return null;
}

/** Palavras de cada empresa: calculadas uma vez, porque a base tem centenas de milhares. */
const WORDS = new WeakMap<CompanyEntry, string[]>();

function wordsOf(entry: CompanyEntry): string[] {
  let found = WORDS.get(entry);

  if (!found) {
    found = [...words(entry.legal_name), ...words(entry.trade_name)];
    WORDS.set(entry, found);
  }

  return found;
}

/**
 * As empresas que atendem aos critérios, na ordem do resultado (UC06 1.1, UC08): critérios somados,
 * nome por início de palavra sem acento nem caixa, ordenação pelo índice do ODS com as empresas sem
 * índice ao fim (regra 7).
 */
export function matchEntries(
  entries: readonly CompanyEntry[],
  query: SearchQuery | undefined,
): CompanyEntry[] {
  const { name, uf, city, cityNames, cnae, ods, order, min_score, min_confidence } = query ?? {};
  const nameWords = words(name);
  const wantedCities = cityNames ?? (city === undefined ? undefined : [city]);
  const cities = wantedCities && new Set(wantedCities.map((item) => words(item).join(' ')));
  const wantedUf = uf?.toUpperCase();
  const cnaeDigits = cnae?.replace(/\D/g, '');
  const scoreOf = (entry: CompanyEntry) => (ods === undefined ? undefined : entry.scores[ods]);

  const matches = entries.filter((entry) => {
    const score = scoreOf(entry);

    return (
      (wantedUf === undefined || entry.uf === wantedUf) &&
      (cnaeDigits === undefined || entry.cnaes.some((code) => code.startsWith(cnaeDigits))) &&
      (min_score === undefined || (score?.score_value != null && score.score_value >= min_score)) &&
      (min_confidence === undefined ||
        (score?.confidence_value != null && score.confidence_value >= min_confidence)) &&
      (cities === undefined || cities.has(words(entry.city).join(' '))) &&
      nameWords.every((word) => wordsOf(entry).some((candidate) => candidate.startsWith(word)))
    );
  });

  const byName = (a: CompanyEntry, b: CompanyEntry) =>
    a.legal_name === b.legal_name
      ? a.cnpj.localeCompare(b.cnpj)
      : a.legal_name < b.legal_name
        ? -1
        : 1;
  const phrase = nameWords.join(' ');
  const startsWithPhrase = (entry: CompanyEntry) =>
    phrase !== '' &&
    [entry.legal_name, entry.trade_name].some((value) => words(value).join(' ').startsWith(phrase));

  return matches.sort((a, b) => {
    if (order) {
      const scoreA = scoreOf(a)?.score_value ?? null;
      const scoreB = scoreOf(b)?.score_value ?? null;

      if (scoreA === null || scoreB === null) {
        return scoreA === scoreB ? byName(a, b) : scoreA === null ? 1 : -1;
      }
      if (scoreA !== scoreB) return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;

      const confidenceA = scoreOf(a)?.confidence_value ?? 0;
      const confidenceB = scoreOf(b)?.confidence_value ?? 0;

      return confidenceA !== confidenceB ? confidenceB - confidenceA : a.cnpj.localeCompare(b.cnpj);
    }

    const first = Number(startsWithPhrase(b)) - Number(startsWithPhrase(a));

    return first !== 0 ? first : byName(a, b);
  });
}

/** Pesquisa paginada sobre a base (paginação estável). */
/**
 * As empresas capturadas na lista de movimentações. A captura guarda um retrato só, sem histórico
 * de recálculos: a movimentação é reconstruída como a API a reconstrói (`company-movements.ts`).
 */
export function capturedMovements(now: number): CompanyMovementItem[] {
  return [...PROFILES.values()]
    .flatMap((profile) => {
      const explanations = Object.fromEntries(
        capturesOf('getScoreExplanation').flatMap((capture) => {
          const explanation = capture.body as ScoreExplanationResponse;

          return capture.status === 200 && explanation.cnpj === profile.cnpj
            ? [[explanation.ods_number, explanation]]
            : [];
        }),
      ) as Record<number, ScoreExplanationResponse>;
      const movement = companyMovementOf({ profile, explanations }, now);

      return movement ? [movement] : [];
    })
    .sort(byMostRecentMovement);
}

export function searchEntries(
  entries: readonly CompanyEntry[],
  query: SearchQuery | undefined,
): SearchCompaniesResponse {
  const page = query?.page ?? 1;
  const pageSize = query?.page_size ?? 20;
  const matches = matchEntries(entries, query);
  const total = matches.length;

  return {
    data: matches
      .slice((page - 1) * pageSize, page * pageSize)
      .map((entry) => searchItem(entry, query?.ods)),
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
}

/** Pesquisa sobre os perfis capturados. */
export function searchProfiles(query: SearchQuery | undefined): SearchCompaniesResponse {
  return searchEntries([...PROFILES.values()].map(entryOf), query);
}

/** O panorama de um conjunto de empresas, a partir dos fatos da base publicada. */
export function analyticsOf(
  entries: readonly CompanyEntry[],
  facts: ReadonlyMap<string, CompanyFacts>,
  sectors: ListSectorsResponse,
): CompanyAnalytics {
  const names = new Map(sectors.data.map((item) => [item.cnae_division, item.description]));
  const ods = activeOds();

  return summarizeCompanies(
    entries.flatMap((entry) => {
      const company = facts.get(entry.cnpj);

      return company ? [analyticsCompany(entry, company, ods)] : [];
    }),
    ods,
    (division) => names.get(division) ?? division,
  );
}

function analyticsCompany(
  entry: CompanyEntry,
  facts: CompanyFacts,
  ods: readonly number[],
): AnalyticsCompany {
  return {
    registrationStatus: entry.registration_status,
    uf: entry.uf,
    scores: ods.map((number) => ({ ods: number, ...entry.scores[number] })),
    facts,
  };
}

/** O panorama das empresas capturadas, para os testes sem a base publicada. */
export function capturedAnalytics(query: SearchQuery | undefined): CompanyAnalytics {
  const profiles = new Map([...PROFILES.values()].map((item) => [item.cnpj, item]));
  const ods = activeOds();

  return summarizeCompanies(
    matchEntries([...profiles.values()].map(entryOf), query).map((entry) =>
      analyticsCompany(entry, companyFacts(profiles.get(entry.cnpj)!), ods),
    ),
    ods,
    (division) => division,
  );
}

/** A evolução das empresas capturadas: as contribuições somadas na ordem das datas. */
export function companyEvolution(cnpj: string, now: number): CompanyIndexEvolution {
  const profile = companyProfile(cnpj, now);
  const nature = profile.legal_nature_code;
  const blocked =
    nature === null ? 'LEGAL_NATURE_PENDING' : nature === '2135' ? 'INDIVIDUAL_ENTREPRENEUR' : null;

  return {
    cnpj: profile.cnpj,
    reconstructed: true,
    ods: profile.ods_scores.map((score) => {
      if (blocked) return { ods_number: score.ods_number, status: blocked, steps: [] };

      return capturedOdsEvolution(profile, score);
    }),
  };
}

function capturedOdsEvolution(
  profile: CompanyFullProfileResponse,
  score: CompanyFullProfileResponse['ods_scores'][number],
): CompanyIndexEvolution['ods'][number] {
  const dates = evidenceDates({ profile });
  const dated = score.contributions
    .flatMap((contribution) => {
      const date = dates.get(contribution.evidence.id);

      return date ? [{ contribution, date }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const years = new Set(dated.map(({ date }) => date.slice(0, 4)));

  if (!dated.length) {
    return { ods_number: score.ods_number, status: 'NO_DATED_EVIDENCE', steps: [] };
  }
  if (years.size < 2) return { ods_number: score.ods_number, status: 'SHORT_HISTORY', steps: [] };

  const steps: CompanyIndexEvolution['ods'][number]['steps'] = [];
  let total = 0;

  for (const { contribution, date } of dated) {
    const { id, category, source_slug, source, source_reference, source_url } =
      contribution.evidence;
    const previous = steps.at(-1)?.date === date ? steps.pop() : undefined;

    total += contribution.points;
    steps.push({
      date,
      score_value: total,
      cause: 'EVIDENCE_ADDED',
      evidence_count: (previous?.evidence_count ?? 0) + 1,
      evidence: {
        id,
        category,
        source_slug,
        source,
        summary: null,
        source_reference,
        source_url,
      },
    });
  }

  return { ods_number: score.ods_number, status: 'AVAILABLE', steps };
}

/** Pesquisa capturada com os mesmos critérios e a mesma página, se houver. */
export function capturedSearch(query: SearchQuery | undefined): SearchCompaniesResponse | null {
  const wanted = criteriaOf(query);
  const page = String(query?.page ?? 1);
  const pageSize = String(query?.page_size ?? 20);
  const found = capturesOf('searchCompanies').find(
    (item) =>
      item.status === 200 &&
      sameCriteria(criteriaOf(item.request.query), wanted) &&
      (item.request.query?.['page'] ?? '1') === page &&
      (item.request.query?.['page_size'] ?? '20') === pageSize,
  );

  return found ? (JSON.parse(JSON.stringify(found.body)) as SearchCompaniesResponse) : null;
}

/** Planilha capturada para estes critérios, se houver (a planilha é sempre a da API real). */
export function capturedExportFile(
  query: object | undefined,
): { file: string; contentType: string; disposition: string | undefined } | null {
  const wanted = criteriaOf(query);
  const found = capturesOf('exportCompaniesXlsx').find(
    (item) => item.status === 200 && sameCriteria(criteriaOf(item.request.query), wanted),
  );

  return found
    ? {
        ...(found.body as { file: string; contentType: string }),
        disposition: found.headers['content-disposition'],
      }
    : null;
}

/** Divisão CNAE do setor pedido (UC10), ou o erro que a API daria. */
export function sectorDivision(cnae: string, ods: number, now: number): string {
  const digits = cnae.replace(/[.\-/\s]/g, '');
  const path = `/sectors/${cnae}/evolution?ods=${ods}`;

  // Como `cnaeDivisionOf` da API: 2, 3, 5 ou 7 dígitos, e a divisão 00 não existe.
  if (!/^\d{2}(\d|\d{3}|\d{5})?$/.test(digits) || digits.startsWith('00')) {
    throw capturedError('getSectorEvolution/cnae-invalido', path, now);
  }
  if (!activeOds().includes(ods)) {
    throw odsNotAvailable('getSectorEvolution/ods-nao-calculado', ods, path, now);
  }

  return digits.slice(0, 2);
}

/** Setor sem série na base: o mock avisa, em vez de inventar. */
export function sectorNotAvailable(cnae: string, ods: number, now: number): ApiError {
  return notInPresentation(
    `/sectors/${cnae}/evolution?ods=${ods}`,
    now,
    'A evolução deste setor não faz parte da versão de apresentação. Escolha um setor da lista.',
  );
}

/** Evolução setorial (UC10): a série capturada da divisão e do ODS pedidos. */
export function sectorEvolution(cnae: string, ods: number, now: number): SectorEvolution {
  const division = sectorDivision(cnae, ods, now);
  const found = capturesOf('getSectorEvolution').find((item) => {
    const body = item.body as SectorEvolution;

    return item.status === 200 && body.cnae_division === division && body.ods_number === ods;
  });

  if (!found) throw sectorNotAvailable(cnae, ods, now);

  return JSON.parse(JSON.stringify(found.body)) as SectorEvolution;
}

/** Perfil completo do CNPJ, ou o erro que a API daria (UC06, fluxos 2.1 e 3.3). */
export function companyProfile(cnpj: string, now: number): CompanyFullProfileResponse {
  const normalized = normalizeCnpj(cnpj);
  const path = `/companies/${cnpj}`;

  if (!isValidCnpj(normalized)) throw capturedError('getCompanyProfile/cnpj-invalido', path, now);

  const profile = PROFILES.get(normalized);

  if (!profile) throw capturedError('getCompanyProfile/nao-encontrada', path, now);

  return JSON.parse(JSON.stringify(profile)) as CompanyFullProfileResponse;
}
