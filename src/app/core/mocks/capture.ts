/**
 * Forma de uma resposta real do bios-core-api capturada por `scripts/capture-api.mjs`.
 *
 * Cada arquivo em `fixtures/` declara `satisfies CapturedResponse<Respostas, Status>` com os tipos
 * gerados do OpenAPI: se a API mudar a forma de uma resposta, o typecheck recusa a captura antiga
 * em vez de a versão de apresentação mostrar um dado que a API real não devolve.
 */

/** Requisição que produziu a resposta, com senhas e tokens trocados por marcadores. */
export interface CapturedRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

/** Corpo binário (a planilha XLSX), guardado num arquivo ao lado da captura. */
export interface CapturedFile {
  file: string;
  contentType: string;
  bytes: number;
}

/** 204 não tem corpo; o XLSX vira referência ao arquivo; o resto é o JSON da resposta. */
export type CapturedBody<T> = [T] extends [void] ? null : [T] extends [Blob] ? CapturedFile : T;

/**
 * `R` é o mapa de status da operação nos tipos gerados (`<Operacao>Responses` para 2xx,
 * `<Operacao>Errors` para os erros declarados); `S`, o status capturado. Um status que o OpenAPI
 * não declara não compila.
 */
export interface CapturedResponse<R, S extends keyof R & number> {
  operationId: string;
  scenario: string;
  description: string;
  request: CapturedRequest;
  status: S;
  /** Só os cabeçalhos que as telas usam: `Retry-After`, `Content-Disposition` e `Content-Type`. */
  headers: Record<string, string>;
  body: CapturedBody<R[S]>;
}
