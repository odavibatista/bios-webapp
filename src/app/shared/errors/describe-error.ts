import { isApiError } from '../../core/api/api-error';

/** Como a tela trata uma falha. */
export type ErrorKind = 'validation' | 'rate-limited' | 'unavailable' | 'unexpected' | 'api';

/** Um campo inválido de um `422 VALIDATION_FAILED` (`path` é o caminho do campo no corpo). */
export interface FieldError {
  path: string;
  message: string;
}

/** O que a tela mostra de uma falha (NFIN03 b). */
export interface ErrorView {
  kind: ErrorKind;
  /** O texto da API, em português; para falha que não veio da API, a mensagem genérica. */
  message: string;
  /** Código estável da API (`INVALID_CREDENTIALS`...), ou `null` se a falha não veio dela. */
  code: string | null;
  fieldErrors: FieldError[];
  /** Segundos até poder repetir, quando a API informa (429). */
  retryAfterSeconds: number | null;
  /** Se faz sentido oferecer "Tentar de novo" (indisponibilidade, limite, falha inesperada). */
  canRetry: boolean;
}

/** Falha que não veio da API (rede, erro do próprio app): nunca tela em branco. */
export const UNEXPECTED_ERROR_MESSAGE =
  'Não foi possível concluir a operação. Tente de novo em instantes.';

/** Indisponibilidade temporária, distinta de "não encontrado" (UC06, regra 6). */
const UNAVAILABLE_CODES = new Set(['COMPANY_DATA_UNAVAILABLE', 'DEPENDENCY_UNAVAILABLE']);

function retryAfter(details: unknown): number | null {
  const seconds = (details as { retry_after_seconds?: unknown } | null | undefined)
    ?.retry_after_seconds;

  return typeof seconds === 'number' && seconds > 0 ? Math.ceil(seconds) : null;
}

function fieldErrors(details: unknown): FieldError[] {
  return Array.isArray(details)
    ? details.filter(
        (detail): detail is FieldError =>
          typeof (detail as FieldError | null)?.path === 'string' &&
          typeof (detail as FieldError | null)?.message === 'string',
      )
    : [];
}

/**
 * Descreve uma falha para a tela (#16). O texto é sempre o que a API devolveu (em português desde
 * a #398 do bios-core-api); o front não reescreve mensagem por código, salvo onde a tela da issue
 * pede comportamento próprio.
 */
export function describeError(error: unknown): ErrorView {
  if (!isApiError(error)) {
    return {
      kind: 'unexpected',
      message: UNEXPECTED_ERROR_MESSAGE,
      code: null,
      fieldErrors: [],
      retryAfterSeconds: null,
      canRetry: true,
    };
  }

  const base = {
    message: error.message,
    code: error.code,
    fieldErrors: [],
    retryAfterSeconds: null,
  };

  if (error.status === 422 && error.code === 'VALIDATION_FAILED') {
    return {
      ...base,
      kind: 'validation',
      fieldErrors: fieldErrors(error.details),
      canRetry: false,
    };
  }
  if (error.status === 429) {
    return {
      ...base,
      kind: 'rate-limited',
      retryAfterSeconds: retryAfter(error.details),
      canRetry: true,
    };
  }
  if (error.status === 503 || UNAVAILABLE_CODES.has(error.code)) {
    return { ...base, kind: 'unavailable', canRetry: true };
  }
  if (error.status >= 500) return { ...base, kind: 'unexpected', canRetry: true };

  return { ...base, kind: 'api', canRetry: false };
}

/** Espera em texto: "45 s", "15 min", "1 min 20 s". */
export function formatWait(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes === 0) return `${rest} s`;

  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}
