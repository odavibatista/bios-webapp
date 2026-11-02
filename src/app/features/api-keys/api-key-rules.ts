import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';

export const API_KEY_NAME_MIN_LENGTH = 2;
export const API_KEY_NAME_MAX_LENGTH = 60;
/** Teto de chaves ativas por conta (UC11, regra 5). */
export const MAX_ACTIVE_API_KEYS = 10;

/**
 * Nome de identificação da chave (UC11, regra 4): de 2 a 60 caracteres, sem contar os espaços das
 * pontas, com as mensagens da API (`CreateApiKeyRequestSchema`).
 */
export function apiKeyNameRules(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  const name = typeof value === 'string' ? value.trim() : '';
  const messages = [
    ...(name.length < API_KEY_NAME_MIN_LENGTH
      ? [`O nome deve ter ao menos ${API_KEY_NAME_MIN_LENGTH} caracteres.`]
      : []),
    ...(name.length > API_KEY_NAME_MAX_LENGTH
      ? [`O nome deve ter no máximo ${API_KEY_NAME_MAX_LENGTH} caracteres.`]
      : []),
  ];

  return messages.length ? { [RULES_ERROR_KEY]: messages } : null;
}
