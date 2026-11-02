import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** Pesos do módulo 11 para o primeiro e o segundo dígito verificador. */
const FIRST_CHECK_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const SECOND_CHECK_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

/** Doze posições alfanuméricas (a raiz e a ordem) e dois dígitos verificadores. */
const CNPJ_PATTERN = /^[0-9A-Z]{12}\d{2}$/;

/** Pontuação aceita na entrada e removida na normalização. */
const MASK_CHARACTERS = /[./\-\s]/g;

/** Código de "0" na tabela ASCII: o valor de cada caractere é o seu código menos 48. */
const ASCII_ZERO = 48;

/** A mensagem que a API dá ao CNPJ inválido (`422 INVALID_CNPJ`), para o campo dizer o mesmo. */
export const INVALID_CNPJ_MESSAGE = 'CNPJ inválido. Confira os dígitos e tente de novo.';

/** Chave do erro no controle (`control.errors.cnpj`). */
export const CNPJ_ERROR_KEY = 'cnpj';

function checkDigit(characters: string, weights: readonly number[]): number {
  const sum = [...characters].reduce(
    (total, character, index) =>
      total + (character.charCodeAt(0) - ASCII_ZERO) * (weights[index] ?? 0),
    0,
  );
  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

/** O texto sem pontuação e em maiúsculas: a forma que vai para a URL e para a API. */
export function normalizeCnpj(text: string): string {
  return text.replace(MASK_CHARACTERS, '').toUpperCase();
}

/**
 * CNPJ na forma canônica (14 caracteres, sem pontuação, em maiúsculas), ou `null` quando o texto
 * não é um CNPJ válido (UC06, regra 8). É o algoritmo do value object da API: aceita a máscara e o
 * CNPJ alfanumérico (Receita Federal, a partir de julho de 2026), confere os dois dígitos
 * verificadores e recusa as sequências de um caractere só, que passam no cálculo.
 *
 * Cada caractere vale o seu código ASCII menos 48: os algarismos valem 0 a 9 e as letras 17 a 42,
 * e para os algarismos o cálculo é o clássico — o mesmo código vale para os CNPJs antigos.
 */
export function parseCnpj(text: string): string | null {
  const cnpj = normalizeCnpj(text);

  if (!CNPJ_PATTERN.test(cnpj)) return null;
  if (new Set(cnpj).size === 1) return null;

  const first = checkDigit(cnpj.slice(0, 12), FIRST_CHECK_WEIGHTS);
  const second = checkDigit(cnpj.slice(0, 13), SECOND_CHECK_WEIGHTS);

  return cnpj.endsWith(`${first}${second}`) ? cnpj : null;
}

/** CNPJ canônico com a máscara de exibição (`11.222.333/0001-81`); outro texto volta como veio. */
export function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(.{2})(.{3})(.{3})(.{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/** Validador do campo de CNPJ: a mesma regra e a mesma mensagem da API. */
export function cnpjRule(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;

  return typeof value === 'string' && parseCnpj(value)
    ? null
    : { [CNPJ_ERROR_KEY]: INVALID_CNPJ_MESSAGE };
}
