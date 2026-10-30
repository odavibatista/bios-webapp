import type {
  CompanyFullProfileResponse,
  CompanySearchItem,
  OdsListResponse,
  SearchCompaniesData,
  SearchCompaniesResponse,
  SectorEvolution,
} from '../api/generated';
import type { ApiError } from '../api/api-error';
import { capturedBody, capturedError, capturesOf, notInPresentation } from './mock-captures';

/**
 * Regras das empresas na versão de apresentação: perfis, explicações e setores vêm das
 * respostas capturadas; a pesquisa é refeita sobre os perfis capturados com as regras do UC08
 * (conferidas nos testes contra as pesquisas reais capturadas).
 */

type SearchQuery = NonNullable<SearchCompaniesData['query']>;

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

/** Item da pesquisa a partir do perfil, com o índice e a confiança do ODS escolhido. */
export function searchItem(profile: CompanyFullProfileResponse, ods?: number): CompanySearchItem {
  const score = profile.ods_scores.find((item) => item.ods_number === ods);

  return {
    cnpj: profile.cnpj,
    legal_name: profile.legal_name,
    trade_name: profile.trade_name,
    registration_status: profile.registration_status,
    city: profile.address.city ?? '',
    uf: profile.address.uf ?? '',
    main_cnae: profile.main_cnae,
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
): ApiError | null {
  const { name, uf, city, cnae, ods, order, min_score, min_confidence } = query ?? {};

  if ([name, uf, city, cnae, ods].every((value) => value === undefined || value === '')) {
    return capturedError('searchCompanies/sem-criterio', path, now);
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

/**
 * Pesquisa sobre os perfis capturados (UC06 1.1, UC08): critérios somados, nome por início de
 * palavra sem acento nem caixa, ordenação pelo índice do ODS com as empresas sem índice ao fim
 * (regra 7), paginação estável.
 */
export function searchProfiles(query: SearchQuery | undefined): SearchCompaniesResponse {
  const { name, uf, city, cnae, ods, order, min_score, min_confidence } = query ?? {};
  const page = query?.page ?? 1;
  const pageSize = query?.page_size ?? 20;
  const nameWords = words(name);
  const cnaeDigits = cnae?.replace(/\D/g, '');

  const matches = [...PROFILES.values()].filter((profile) => {
    const companyWords = [...words(profile.legal_name), ...words(profile.trade_name)];
    const cnaes = [profile.main_cnae?.code, ...profile.secondary_cnaes.map((item) => item.code)];
    const score = profile.ods_scores.find((item) => item.ods_number === ods);

    return (
      nameWords.every((word) => companyWords.some((candidate) => candidate.startsWith(word))) &&
      (uf === undefined || profile.address.uf === uf.toUpperCase()) &&
      (city === undefined || words(profile.address.city).join(' ') === words(city).join(' ')) &&
      (cnaeDigits === undefined || cnaes.some((code) => code?.startsWith(cnaeDigits))) &&
      (min_score === undefined || (score?.score_value != null && score.score_value >= min_score)) &&
      (min_confidence === undefined ||
        (score?.confidence_value != null && score.confidence_value >= min_confidence))
    );
  });

  const byName = (a: CompanySearchItem, b: CompanySearchItem) =>
    a.legal_name === b.legal_name
      ? a.cnpj.localeCompare(b.cnpj)
      : a.legal_name < b.legal_name
        ? -1
        : 1;
  const phrase = nameWords.join(' ');
  const startsWithPhrase = (item: CompanySearchItem) =>
    phrase !== '' &&
    [item.legal_name, item.trade_name].some((value) => words(value).join(' ').startsWith(phrase));

  const items = matches
    .map((profile) => searchItem(profile, ods))
    .sort((a, b) => {
      if (order) {
        const scoreA = a.ods_score?.score_value ?? null;
        const scoreB = b.ods_score?.score_value ?? null;

        if (scoreA === null || scoreB === null) {
          return scoreA === scoreB ? byName(a, b) : scoreA === null ? 1 : -1;
        }
        if (scoreA !== scoreB) return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;

        const confidenceA = a.ods_score?.confidence_value ?? 0;
        const confidenceB = b.ods_score?.confidence_value ?? 0;

        return confidenceA !== confidenceB
          ? confidenceB - confidenceA
          : a.cnpj.localeCompare(b.cnpj);
      }

      const first = Number(startsWithPhrase(b)) - Number(startsWithPhrase(a));

      return first !== 0 ? first : byName(a, b);
    });

  const total = items.length;

  return {
    data: items.slice((page - 1) * pageSize, page * pageSize),
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
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
): { file: string; contentType: string } | null {
  const wanted = criteriaOf(query);
  const found = capturesOf('exportCompaniesXlsx').find(
    (item) => item.status === 200 && sameCriteria(criteriaOf(item.request.query), wanted),
  );

  return found ? (found.body as { file: string; contentType: string }) : null;
}

/** Evolução setorial (UC10): a série capturada da divisão e do ODS pedidos. */
export function sectorEvolution(cnae: string, ods: number, now: number): SectorEvolution {
  const digits = cnae.replace(/[.\-/\s]/g, '');
  const path = `/sectors/${cnae}/evolution?ods=${ods}`;

  if (!/^\d{2}(\d|\d{3}|\d{5})?$/.test(digits)) {
    throw capturedError('getSectorEvolution/cnae-invalido', path, now);
  }
  if (!activeOds().includes(ods)) {
    throw odsNotAvailable('getSectorEvolution/ods-nao-calculado', ods, path, now);
  }

  const division = digits.slice(0, 2);
  const found = capturesOf('getSectorEvolution').find((item) => {
    const body = item.body as SectorEvolution;

    return item.status === 200 && body.cnae_division === division && body.ods_number === ods;
  });

  if (!found) {
    throw notInPresentation(
      path,
      now,
      'A evolução deste setor não faz parte da versão de apresentação. Escolha um setor da lista.',
    );
  }

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
