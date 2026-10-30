import type { ErrorResponse } from './generated';

/**
 * Erro de uma operação da API, igual nos dois provedores (HTTP e mockado): o status HTTP e o
 * `ErrorResponse` que a API devolve, com a mensagem já em português. As telas mostram `message`
 * e decidem pelo `code`, sem reescrever o texto (FE-07).
 */
export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly status: number,
    readonly body: ErrorResponse,
  ) {
    super(body.message);
  }

  /** Código estável do erro (`VALIDATION_FAILED`, `INVALID_CREDENTIALS`...). */
  get code(): string {
    return this.body.code;
  }

  /** Detalhes do erro: os campos inválidos de um 422, o prazo de um 429... */
  get details(): ErrorResponse['details'] {
    return this.body.details;
  }
}

/** Confere se um erro é da API, e não uma falha do próprio app. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
