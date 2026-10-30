import { ApiError } from '../../core/api/api-error';
import { describeError, formatWait, UNEXPECTED_ERROR_MESSAGE } from './describe-error';

function apiError(status: number, code: string, message: string, details?: unknown): ApiError {
  return new ApiError(status, {
    statusCode: status,
    code,
    message,
    details,
    timestamp: '2026-10-30T12:00:00.000Z',
    path: '/x',
  });
}

describe('describeError', () => {
  it('422 VALIDATION_FAILED traz os campos inválidos', () => {
    const view = describeError(
      apiError(422, 'VALIDATION_FAILED', 'Os dados enviados são inválidos.', [
        { path: 'email', message: 'Informe um e-mail válido.' },
        { nao: 'é detalhe de campo' },
      ]),
    );

    expect(view).toEqual({
      kind: 'validation',
      message: 'Os dados enviados são inválidos.',
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ path: 'email', message: 'Informe um e-mail válido.' }],
      retryAfterSeconds: null,
      canRetry: false,
    });
  });

  it('429 traz o prazo de `retry_after_seconds` e permite repetir depois', () => {
    expect(
      describeError(
        apiError(429, 'RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido.', {
          limit: 10,
          retry_after_seconds: 59.2,
        }),
      ),
    ).toMatchObject({ kind: 'rate-limited', retryAfterSeconds: 60, canRetry: true });
    expect(
      describeError(apiError(429, 'ACCESS_TEMPORARILY_BLOCKED', 'Bloqueado.', null)),
    ).toMatchObject({ kind: 'rate-limited', retryAfterSeconds: null });
  });

  it('503 e os códigos de indisponibilidade são temporários, com "Tentar de novo"', () => {
    expect(describeError(apiError(503, 'COMPANY_DATA_UNAVAILABLE', 'Indisponível.'))).toMatchObject(
      {
        kind: 'unavailable',
        canRetry: true,
      },
    );
    expect(describeError(apiError(502, 'DEPENDENCY_UNAVAILABLE', 'Indisponível.'))).toMatchObject({
      kind: 'unavailable',
    });
  });

  it('500 da API é inesperado, com a mensagem dela', () => {
    expect(describeError(apiError(500, 'INTERNAL_ERROR', 'Erro interno.'))).toMatchObject({
      kind: 'unexpected',
      message: 'Erro interno.',
      canRetry: true,
    });
  });

  it('outros erros da API mostram a mensagem dela, sem repetir', () => {
    expect(describeError(apiError(404, 'COMPANY_NOT_FOUND', 'Empresa não encontrada.'))).toEqual({
      kind: 'api',
      message: 'Empresa não encontrada.',
      code: 'COMPANY_NOT_FOUND',
      fieldErrors: [],
      retryAfterSeconds: null,
      canRetry: false,
    });
  });

  it('falha que não veio da API vira a mensagem genérica em português', () => {
    expect(describeError(new TypeError('fetch failed'))).toMatchObject({
      kind: 'unexpected',
      message: UNEXPECTED_ERROR_MESSAGE,
      code: null,
      canRetry: true,
    });
  });
});

describe('formatWait', () => {
  it.each([
    [45, '45 s'],
    [60, '1 min'],
    [80, '1 min 20 s'],
    [900, '15 min'],
  ])('%i segundos: "%s"', (seconds, text) => {
    expect(formatWait(seconds)).toBe(text);
  });
});
