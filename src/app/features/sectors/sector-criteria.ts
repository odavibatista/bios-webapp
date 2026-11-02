import type { AbstractControl, ValidationErrors } from '@angular/forms';
import type { Params } from '@angular/router';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';

/** O setor e o ODS da evolução, como a tela os entende. `null` é "não informado". */
export interface SectorCriteria {
  /** Só os dígitos do CNAE informado (divisão, grupo, classe ou subclasse). */
  cnae: string | null;
  ods: number | null;
}

/** Os critérios na URL (`/setores?cnae=24&ods=13`): o link é compartilhável. */
export const SECTOR_QUERY_KEYS = { cnae: 'cnae', ods: 'ods' } as const satisfies Record<
  keyof SectorCriteria,
  string
>;

/** A mensagem da API para um CNAE fora do formato (UC10, regra 2). */
export const INVALID_SECTOR_CNAE =
  'CNAE inválido: informe a divisão (2 dígitos), o grupo, a classe ou a subclasse.';

/** CNAE como a API aceita na rota: sem espaço, ponto, hífen ou barra (`24.31-8/00` → `2431800`). */
export function sectorCnaeDigits(value: string): string {
  return value.replace(/[\s.\-/]/g, '');
}

/**
 * Se os dígitos formam um CNAE de setor, como o `cnaeDivisionOf` da API: divisão (2), grupo (3),
 * classe (5) ou subclasse (7), e a divisão não é 00. Se a divisão existe na CNAE 2.3 é a API quem
 * diz: a tela não tem a tabela inteira.
 */
export function isSectorCnae(digits: string): boolean {
  return /^\d{2}(\d|\d{3}|\d{5})?$/.test(digits) && !digits.startsWith('00');
}

/** Regra do campo de CNAE: obrigatório e no formato que a API aceita. */
export function sectorCnaeRule(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  const digits = sectorCnaeDigits(typeof value === 'string' ? value.trim() : '');

  return isSectorCnae(digits) ? null : { [RULES_ERROR_KEY]: [INVALID_SECTOR_CNAE] };
}

function text(value: unknown): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  return trimmed === '' ? null : trimmed;
}

/**
 * Lê os critérios da URL. O CNAE segue como veio (sem a máscara): um código fora do formato vai à
 * API, que responde com a mensagem dela. ODS ilegível vira "não informado"; ODS fora dos
 * calculados segue para a API, que responde com os disponíveis.
 */
export function sectorCriteriaFromParams(params: Params): SectorCriteria {
  const cnae = text(params[SECTOR_QUERY_KEYS.cnae]);
  const ods = Number(text(params[SECTOR_QUERY_KEYS.ods]) ?? Number.NaN);

  return {
    cnae: cnae === null ? null : sectorCnaeDigits(cnae),
    ods: Number.isInteger(ods) ? ods : null,
  };
}

/** Os critérios em parâmetros de URL, sem os vazios. */
export function sectorCriteriaToParams(criteria: SectorCriteria): Params {
  const params: Params = {};

  if (criteria.cnae !== null) params[SECTOR_QUERY_KEYS.cnae] = criteria.cnae;
  if (criteria.ods !== null) params[SECTOR_QUERY_KEYS.ods] = String(criteria.ods);

  return params;
}

/** A evolução só é pedida com setor e ODS (UC10, passo 1). */
export function isCompleteSectorCriteria(
  criteria: SectorCriteria,
): criteria is { cnae: string; ods: number } {
  return criteria.cnae !== null && criteria.ods !== null;
}
