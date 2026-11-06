import type { Params } from '@angular/router';
import type {
  ExportCompaniesXlsxData,
  GetCompanyAnalyticsData,
  SearchCompaniesData,
} from '../../core/api/generated';
import { FOREIGN_UF } from '../../shared/forms/address-rules';

/** Siglas das 27 unidades da federação, na ordem da API (UC08, regra 4). */
export const BRAZILIAN_UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

/** Itens por página: 20 por padrão, até 100 (RF13). */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type SearchOrder = 'asc' | 'desc';

/** Os critérios da pesquisa, como a tela os entende. `null` é "não informado". */
export interface SearchCriteria {
  name: string | null;
  uf: string | null;
  /** Nome do município: o que aparece no campo, e o critério dos links antigos. */
  city: string | null;
  /** Código IBGE do município escolhido na lista (RF38). */
  cityCode: string | null;
  /** Só os dígitos (2 a 7). */
  cnae: string | null;
  ods: number | null;
  /** De −100 a 100; só existe com `ods` (UC08, regra 3). */
  minScore: number | null;
  /** De 0 a 1; só existe com `ods`. */
  minConfidence: number | null;
  /** Ordenação pelo índice do ODS (FE-21); só existe com `ods`. */
  order: SearchOrder | null;
  page: number;
  pageSize: number;
}

/**
 * Os critérios na URL (`/pesquisa?uf=SP&ods=15&indice_min=...`): a pesquisa é compartilhável e o
 * "voltar" do navegador refaz a anterior. Os nomes ficam em português, como as rotas do app.
 */
export const QUERY_KEYS = {
  name: 'nome',
  uf: 'uf',
  city: 'municipio',
  cityCode: 'municipio_ibge',
  cnae: 'cnae',
  ods: 'ods',
  minScore: 'indice_min',
  minConfidence: 'confianca_min',
  order: 'ordem',
  page: 'pagina',
  pageSize: 'por_pagina',
} as const satisfies Record<keyof SearchCriteria, string>;

/** CNAE como a API aceita: sem espaço, ponto, hífen ou barra (`24.51-2/00` → `2451200`). */
export function cnaeDigits(value: string): string {
  return value.replace(/[\s.\-/]/g, '');
}

function text(value: unknown): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  return trimmed === '' ? null : trimmed;
}

function number(value: unknown): number | null {
  const raw = text(value);
  const parsed = raw === null ? Number.NaN : Number(raw.replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : null;
}

function isKnownUf(uf: string): boolean {
  return uf === FOREIGN_UF || (BRAZILIAN_UFS as readonly string[]).includes(uf);
}

/** A UF da URL que não existe, para a tela avisar por que a ignorou. */
export function ignoredUf(params: Params): string | null {
  const uf = text(params[QUERY_KEYS.uf])?.toUpperCase() ?? null;

  return uf === null || isKnownUf(uf) ? null : uf;
}

function positiveInteger(value: unknown, fallback: number, max = Infinity): number {
  const parsed = number(value);

  return parsed !== null && Number.isInteger(parsed) && parsed >= 1 && parsed <= max
    ? parsed
    : fallback;
}

/**
 * Lê os critérios da URL. Valor ilegível vira "não informado", e os filtros do ODS (mínimos e
 * ordenação) só valem com um ODS: sem ele, a tela nunca manda à API um pedido que ela recusaria
 * por falta de ODS. ODS fora dos calculados segue para a API, que responde com os disponíveis.
 */
export function criteriaFromParams(params: Params): SearchCriteria {
  const ods = number(params[QUERY_KEYS.ods]);
  const withOds = ods !== null && Number.isInteger(ods);
  const order = text(params[QUERY_KEYS.order])?.toLowerCase();
  const cnae = text(params[QUERY_KEYS.cnae]);
  const cityCode = text(params[QUERY_KEYS.cityCode]);
  const uf = text(params[QUERY_KEYS.uf])?.toUpperCase() ?? null;

  return {
    name: text(params[QUERY_KEYS.name]),
    uf: uf !== null && isKnownUf(uf) ? uf : null,
    city: text(params[QUERY_KEYS.city]),
    cityCode: /^\d{7}$/.test(cityCode ?? '') ? cityCode : null,
    cnae: cnae === null ? null : cnaeDigits(cnae),
    ods: withOds ? ods : null,
    minScore: withOds ? number(params[QUERY_KEYS.minScore]) : null,
    minConfidence: withOds ? number(params[QUERY_KEYS.minConfidence]) : null,
    order: withOds && (order === 'asc' || order === 'desc') ? order : null,
    page: positiveInteger(params[QUERY_KEYS.page], 1),
    pageSize: positiveInteger(params[QUERY_KEYS.pageSize], DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  };
}

/** Os critérios em parâmetros de URL, sem os vazios nem a página e o tamanho padrão. */
export function criteriaToParams(criteria: SearchCriteria): Params {
  const params: Params = {};
  const set = (key: keyof SearchCriteria, value: string | number | null) => {
    if (value !== null) params[QUERY_KEYS[key]] = String(value);
  };

  set('name', criteria.name);
  set('uf', criteria.uf);
  set('city', criteria.city);
  set('cityCode', criteria.cityCode);
  set('cnae', criteria.cnae);
  set('ods', criteria.ods);
  if (criteria.ods !== null) {
    set('minScore', criteria.minScore);
    set('minConfidence', criteria.minConfidence);
    set('order', criteria.order);
  }
  if (criteria.page !== 1) set('page', criteria.page);
  if (criteria.pageSize !== DEFAULT_PAGE_SIZE) set('pageSize', criteria.pageSize);

  return params;
}

/** Ao menos um critério (nome, UF, município, CNAE ou ODS) é exigido (UC08, regra 3). */
export function hasCriterion(criteria: SearchCriteria): boolean {
  return [
    criteria.name,
    criteria.uf,
    criteria.city,
    criteria.cityCode,
    criteria.cnae,
    criteria.ods,
  ].some((value) => value !== null);
}

/** A consulta de `searchCompanies`, com os nomes da API e só o que foi informado. */
export function toApiQuery(criteria: SearchCriteria): NonNullable<SearchCompaniesData['query']> {
  const query: NonNullable<SearchCompaniesData['query']> = {
    page: criteria.page,
    page_size: criteria.pageSize,
  };

  if (criteria.name !== null) query.name = criteria.name;
  if (criteria.uf !== null) query.uf = criteria.uf;
  if (criteria.cityCode !== null) query.city_ibge_code = criteria.cityCode;
  else if (criteria.city !== null) query.city = criteria.city;
  if (criteria.cnae !== null) query.cnae = criteria.cnae;
  if (criteria.ods !== null) {
    query.ods = criteria.ods;
    if (criteria.minScore !== null) query.min_score = criteria.minScore;
    if (criteria.minConfidence !== null) query.min_confidence = criteria.minConfidence;
    if (criteria.order !== null) query.order = criteria.order;
  }

  return query;
}

/** Os mesmos filtros da lista: página e ordem não mudam os totais do recorte (UC19). */
export function toAnalyticsQuery(
  criteria: SearchCriteria,
): NonNullable<GetCompanyAnalyticsData['query']> {
  const query = { ...toExportQuery(criteria) };
  delete query.order;
  return query;
}

/** Duas consultas iguais não refazem a requisição: mudar de aba também muda a URL. */
export const sameQuery = (first: object, second: object): boolean =>
  JSON.stringify(first) === JSON.stringify(second);

/** A exportação usa os mesmos filtros e ordem, sem paginação (UC09, regra 4). */
export function toExportQuery(
  criteria: SearchCriteria,
): NonNullable<ExportCompaniesXlsxData['query']> {
  const query = { ...toApiQuery(criteria) };
  delete query.page;
  delete query.page_size;
  return query;
}
