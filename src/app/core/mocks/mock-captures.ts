import { ApiError } from '../api/api-error';
import type { ErrorResponse } from '../api/generated';
import type { CapturedRequest } from './capture';
import { CAPTURES, type CaptureKey } from './fixtures';

/** Uma resposta capturada, sem o tipo exato de cada arquivo (o mock só a lê). */
export interface AnyCapture {
  operationId: string;
  scenario: string;
  request: CapturedRequest;
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

const ALL: Record<string, AnyCapture> = CAPTURES;

/** Cópia profunda: o mock nunca altera a captura original. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** A resposta capturada com esta chave. */
export function capture(key: CaptureKey): AnyCapture {
  return ALL[key];
}

/** Todas as respostas capturadas de uma operação. */
export function capturesOf(operationId: string): AnyCapture[] {
  return Object.values(ALL).filter((item) => item.operationId === operationId);
}

/** Cópia do corpo de uma resposta capturada. */
export function capturedBody<T>(key: CaptureKey): T {
  return clone(capture(key).body) as T;
}

/**
 * Erro da API a partir de uma resposta capturada, com o instante e o caminho desta chamada:
 * o texto e o código são os que a API real devolveu.
 */
export function capturedError(
  key: CaptureKey,
  path: string,
  now: number,
  patch: Partial<ErrorResponse> = {},
): ApiError {
  const { status, body } = capture(key);

  if (status < 400) throw new Error(`A captura ${key} não é uma resposta de erro.`);

  return new ApiError(status, {
    ...clone(body as ErrorResponse),
    timestamp: new Date(now).toISOString(),
    path,
    ...patch,
  });
}

/** Mensagem de um campo nos detalhes de um 422 capturado, para o mock montar o seu. */
export function capturedFieldMessage(key: CaptureKey, field: string, index = 0): string {
  const details = (capture(key).body as ErrorResponse).details as
    { path: string; message: string }[] | undefined;
  const message = details?.filter((detail) => detail.path === field)[index]?.message;

  if (message === undefined) throw new Error(`A captura ${key} não tem mensagem para ${field}.`);

  return message;
}

/** `422 VALIDATION_FAILED` com os campos inválidos desta chamada. */
export function validationError(
  key: CaptureKey,
  path: string,
  now: number,
  details: { path: string; message: string }[],
): ApiError {
  return capturedError(key, path, now, { details });
}

/**
 * O que a API faz mas a versão de apresentação não reproduz (uma exportação que não foi
 * capturada, um setor fora da lista): o mock avisa, em vez de inventar a resposta.
 */
export function notInPresentation(path: string, now: number, message: string): ApiError {
  return new ApiError(422, {
    statusCode: 422,
    code: 'NOT_AVAILABLE_IN_PRESENTATION',
    message,
    timestamp: new Date(now).toISOString(),
    path,
  });
}
