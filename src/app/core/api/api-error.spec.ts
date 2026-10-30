import { ApiError, isApiError } from './api-error';

describe('ApiError', () => {
  const error = new ApiError(429, {
    statusCode: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Limite de requisições excedido. Tente novamente em instantes.',
    details: { limit: 10, retry_after_seconds: 60 },
    timestamp: '2026-10-30T13:38:43.087Z',
    path: '/companies/export/xlsx?name=gerdau',
  });

  it('leva o status, o código, a mensagem e os detalhes da API', () => {
    expect(error.status).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.message).toBe('Limite de requisições excedido. Tente novamente em instantes.');
    expect(error.details).toEqual({ limit: 10, retry_after_seconds: 60 });
    expect(error.name).toBe('ApiError');
  });

  it('distingue erro da API de falha do próprio app', () => {
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error('falha'))).toBe(false);
  });
});
