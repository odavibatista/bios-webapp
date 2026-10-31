import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { apiErrorOf } from '../errors/form-errors';

/** Chave dos erros de regra num controle (`control.errors.rules`): as mensagens, na ordem da API. */
export const RULES_ERROR_KEY = 'rules';

/**
 * E-mail aceito pela API: o padrão do `z.email()` do Zod 4, que valida o cadastro, o login e o
 * reenvio no bios-core-api. Com outro padrão, o front aceitaria o que a API recusa (ou o inverso).
 */
export const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** A política de senha, mostrada antes de a pessoa errar (UC01, regra 4). */
export const PASSWORD_POLICY = `De ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres, com ao menos uma letra e um número.`;

function rules(check: (value: string) => string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    const messages = check(typeof value === 'string' ? value : '');

    return messages.length ? { [RULES_ERROR_KEY]: messages } : null;
  };
}

/** Nome de exibição: de 2 a 100 caracteres, sem contar os espaços das bordas. */
export const nameRules = rules((value) => {
  const name = value.trim();

  return [
    ...(name.length < NAME_MIN_LENGTH
      ? [`O nome deve ter ao menos ${NAME_MIN_LENGTH} caracteres.`]
      : []),
    ...(name.length > NAME_MAX_LENGTH
      ? [`O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`]
      : []),
  ];
});

/** E-mail: o formato da API e até 254 caracteres, sem contar os espaços das bordas. */
export const emailRules = rules((value) => {
  const email = value.trim();

  return [
    ...(EMAIL_PATTERN.test(email) ? [] : ['Informe um e-mail válido.']),
    ...(email.length > EMAIL_MAX_LENGTH
      ? [`O e-mail deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres.`]
      : []),
  ];
});

/** Senha nova: de 8 a 128 caracteres, com ao menos uma letra e um número. */
export const passwordRules = rules((value) => [
  ...(value.length < PASSWORD_MIN_LENGTH
    ? [`A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`]
    : []),
  ...(value.length > PASSWORD_MAX_LENGTH
    ? [`A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`]
    : []),
  ...(/\p{L}/u.test(value) ? [] : ['A senha deve conter ao menos uma letra.']),
  ...(/\d/.test(value) ? [] : ['A senha deve conter ao menos um número.']),
]);

/**
 * O que o `mat-error` do campo mostra: as regras que o valor quebra ou, depois do envio, o que a
 * API disse do campo.
 */
export function fieldMessage(control: AbstractControl | null): string | null {
  const broken: unknown = control?.errors?.[RULES_ERROR_KEY];

  if (Array.isArray(broken) && broken.length) return broken.join(' ');

  return apiErrorOf(control);
}
