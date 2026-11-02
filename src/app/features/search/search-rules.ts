import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';
import { BRAZILIAN_UFS, cnaeDigits } from './search-criteria';

/** Tamanho máximo do nome e do município, como na API. */
export const MAX_TEXT_LENGTH = 100;

/**
 * Palavras como a API as compara: sem acento, em maiúsculas, cortadas em tudo o que não é letra
 * ou dígito (`S.A.` vira `S` e `A`).
 */
export function nameTerms(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((term) => term.length > 0);
}

function rule(check: (value: string) => string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    const raw = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    const messages = check(raw.trim());

    return messages.length ? { [RULES_ERROR_KEY]: messages } : null;
  };
}

/** Nome: opcional; com texto, ao menos uma palavra de 3 letras ou mais (senão casaria com tudo). */
export const nameRule = rule((value) => [
  ...(value !== '' && !nameTerms(value).some((term) => term.length >= 3)
    ? ['Informe ao menos uma palavra com 3 letras ou mais.']
    : []),
  ...(value.length > MAX_TEXT_LENGTH
    ? [`O nome deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`]
    : []),
]);

/** Município: opcional; com texto, precisa ter letras ou dígitos. */
export const cityRule = rule((value) => [
  ...(value !== '' && nameTerms(value).length === 0 ? ['Informe o nome do município.'] : []),
  ...(value.length > MAX_TEXT_LENGTH
    ? [`O município deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`]
    : []),
]);

/** UF: opcional; uma das 27 siglas. */
export const ufRule = rule((value) =>
  value === '' || (BRAZILIAN_UFS as readonly string[]).includes(value.toUpperCase())
    ? []
    : ['Escolha uma das 27 unidades da federação.'],
);

/** CNAE: opcional; de 2 a 7 dígitos, com ou sem a pontuação (`24.51-2/00`). */
export const cnaeRule = rule((value) =>
  value === '' || /^\d{2,7}$/.test(cnaeDigits(value)) ? [] : ['Informe de 2 a 7 dígitos do CNAE.'],
);

function rangeRule(min: number, max: number, message: string): ValidatorFn {
  return rule((value) => {
    if (value === '') return [];

    const parsed = Number(value.replace(',', '.'));

    return Number.isFinite(parsed) && parsed >= min && parsed <= max ? [] : [message];
  });
}

/** Índice mínimo no ODS escolhido: de −100 a 100. */
export const minScoreRule = rangeRule(-100, 100, 'Informe um índice de −100 a 100.');

/** Confiança mínima no ODS escolhido: de 0 a 1. */
export const minConfidenceRule = rangeRule(0, 1, 'Informe uma confiança de 0 a 1.');
