import { isApiError } from '../../core/api/api-error';
import type { ExportedFile } from '../../core/api/export-file';
import type { ErrorResponse } from '../../core/api/generated';
import { notInPresentation } from '../../core/mocks/mock-captures';

/**
 * As requisições que a referência da API (Scalar) envia na versão de apresentação: em vez de sair
 * para uma API que não está no ar, cada uma é atendida no navegador pelo mesmo mock das telas,
 * que responde com as respostas reais capturadas da API. O `operationId` de cada rota do
 * documento OpenAPI é o nome do método do mock, então o roteamento sai do próprio documento.
 */

/** O pedaço do documento OpenAPI que o roteador lê. */
export interface OpenApiDocument {
  paths: Record<string, Record<string, unknown>>;
}

interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  schema?: { type?: string; items?: { type?: string } };
}

interface OpenApiOperation {
  operationId: string;
  parameters?: OpenApiParameter[];
  responses?: Record<string, unknown>;
}

/** Uma rota do documento: o método, o caminho como expressão e o que o mock precisa saber. */
export interface OperationRoute {
  method: string;
  template: string;
  pattern: RegExp;
  pathNames: string[];
  operationId: string;
  parameters: OpenApiParameter[];
  /** O primeiro status de sucesso declarado (200, 201, 204...). */
  successStatus: number;
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

/** As rotas do documento, com os caminhos fixos antes dos que têm parâmetro. */
export function operationRoutes(document: OpenApiDocument): OperationRoute[] {
  const routes: OperationRoute[] = [];

  for (const [template, item] of Object.entries(document.paths)) {
    for (const method of METHODS) {
      const operation = item[method] as OpenApiOperation | undefined;

      if (!operation?.operationId) continue;

      const pathNames: string[] = [];
      const source = template
        .split('/')
        .map((segment) => {
          const name = /^\{(.+)\}$/.exec(segment)?.[1];

          if (!name) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          pathNames.push(name);

          return '([^/]+)';
        })
        .join('/');
      const success = Object.keys(operation.responses ?? {})
        .map(Number)
        .filter((status) => status >= 200 && status < 300)
        .sort((a, b) => a - b)[0];

      routes.push({
        method: method.toUpperCase(),
        template,
        pattern: new RegExp(`^${source}/?$`),
        pathNames,
        operationId: operation.operationId,
        parameters: operation.parameters ?? [],
        successStatus: success ?? 200,
      });
    }
  }

  // `/companies/movements` antes de `/companies/{cnpj}`: o caminho fixo ganha do parâmetro.
  return routes.sort((a, b) => a.pathNames.length - b.pathNames.length);
}

/** O que o roteador usa do mock: os métodos com o nome do `operationId`. */
export type OperationHandlers = Record<string, unknown> & {
  getPublicCompanyProfile?: (cnpj: string, apiKey: string | null) => Promise<unknown>;
};

export interface PresentationFetchOptions {
  /** A URL base anunciada no documento: o que começa por ela é atendido aqui. */
  baseUrl: string;
  routes: OperationRoute[];
  handlers: OperationHandlers;
  /** Atende a chamada com o token do `Authorization` da requisição, e não com o da sessão. */
  withAccessToken: <T>(token: string | null, call: () => Promise<T>) => Promise<T>;
  now: () => number;
  /** Para o que não é da API (ex.: arquivos do próprio app). */
  fallback: typeof fetch;
}

/** Operações que existem na API e que a versão de apresentação não reproduz. */
const NOT_REPRODUCED =
  'Esta rota existe na API do BIOS, mas a versão de apresentação não a reproduz. A resposta real segue o documento OpenAPI desta página.';

/** Cria o `fetch` que a referência da API usa nas requisições de teste. */
export function createPresentationFetch(options: PresentationFetchOptions): typeof fetch {
  const base = new URL(options.baseUrl);

  return async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);

    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      return options.fallback(input, init);
    }

    const path = '/' + url.pathname.slice(base.pathname.length).replace(/^\/+/, '');
    const route = options.routes.find(
      (item) => item.method === request.method && item.pattern.test(path),
    );

    if (!route) {
      return json(
        404,
        errorBody(
          404,
          'NOT_FOUND',
          `Rota ${request.method} ${path} não encontrada.`,
          path,
          options.now(),
        ),
      );
    }

    const match = route.pattern.exec(path)!;
    const pathParams = Object.fromEntries(
      route.pathNames.map((name, i) => [
        name,
        typed(decodeURIComponent(match[i + 1] ?? ''), route, name),
      ]),
    );
    const query = queryOf(url.searchParams, route);
    let body: unknown;

    if (request.method !== 'GET' && request.method !== 'DELETE') {
      const text = await request.text();

      if (text.trim()) {
        try {
          body = JSON.parse(text);
        } catch {
          return json(
            400,
            errorBody(
              400,
              'BAD_REQUEST',
              'O corpo da requisição não é um JSON válido.',
              path,
              options.now(),
            ),
          );
        }
      }
    }

    const token = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') ?? '')?.[1] ?? null;

    try {
      const result = await options.withAccessToken(token, () =>
        call(options.handlers, route, {
          path: pathParams,
          query,
          body,
          apiKey: request.headers.get('x-api-key'),
          fullPath: path,
          now: options.now(),
        }),
      );

      return success(route, result);
    } catch (error) {
      if (isApiError(error)) return json(error.status, error.body);

      return json(
        500,
        errorBody(
          500,
          'INTERNAL_SERVER_ERROR',
          'Erro interno ao reproduzir a resposta.',
          path,
          options.now(),
        ),
      );
    }
  };
}

interface CallInput {
  path: Record<string, unknown>;
  query: Record<string, unknown>;
  body: unknown;
  apiKey: string | null;
  fullPath: string;
  now: number;
}

async function call(
  handlers: OperationHandlers,
  route: OperationRoute,
  input: CallInput,
): Promise<unknown> {
  if (route.operationId === 'getPublicCompanyProfile' && handlers.getPublicCompanyProfile) {
    return handlers.getPublicCompanyProfile(String(input.path['cnpj']), input.apiKey);
  }

  const handler = handlers[route.operationId];

  if (typeof handler !== 'function')
    throw notInPresentation(input.fullPath, input.now, NOT_REPRODUCED);

  const args: Record<string, unknown> = {};

  if (route.pathNames.length) args['path'] = input.path;
  if (Object.keys(input.query).length) args['query'] = input.query;
  if (input.body !== undefined) args['body'] = input.body;

  return (handler as (data: Record<string, unknown>) => Promise<unknown>).call(handlers, args);
}

function success(route: OperationRoute, result: unknown): Response {
  if (isExportedFile(result)) {
    return new Response(result.blob, {
      status: 200,
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': `attachment; filename="${result.filename}"`,
        ...PRESENTATION_HEADER,
      },
    });
  }
  if (route.successStatus === 204 || result === undefined) {
    return new Response(null, { status: 204, headers: PRESENTATION_HEADER });
  }

  return json(route.successStatus, result);
}

/** A planilha da exportação (UC09): um arquivo com nome, e não um corpo JSON. */
function isExportedFile(value: unknown): value is ExportedFile {
  const file = value as Partial<ExportedFile> | null;

  return (
    typeof file === 'object' &&
    file !== null &&
    typeof file.filename === 'string' &&
    typeof file.blob?.size === 'number'
  );
}

/** Marca as respostas: quem olha os cabeçalhos vê que vieram da versão de apresentação. */
const PRESENTATION_HEADER = {
  'x-bios-apresentacao': 'resposta capturada da API, servida no navegador',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...PRESENTATION_HEADER },
  });
}

/** Um `ErrorResponse` como o da API, para o que o roteador mesmo recusa. */
function errorBody(
  status: number,
  code: string,
  message: string,
  path: string,
  now: number,
): ErrorResponse {
  return { statusCode: status, code, message, timestamp: new Date(now).toISOString(), path };
}

/** Os parâmetros de consulta com o tipo do documento: o mock recebe números como números. */
function queryOf(params: URLSearchParams, route: OperationRoute): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  for (const name of new Set(params.keys())) {
    const declared = route.parameters.find((item) => item.in === 'query' && item.name === name);

    if (declared?.schema?.type === 'array') {
      query[name] = params
        .getAll(name)
        .map((value) => convert(value, declared.schema?.items?.type));
    } else {
      query[name] = convert(params.get(name) ?? '', declared?.schema?.type);
    }
  }

  return query;
}

function typed(value: string, route: OperationRoute, name: string): unknown {
  const declared = route.parameters.find((item) => item.in === 'path' && item.name === name);

  return convert(value, declared?.schema?.type);
}

function convert(value: string, type: string | undefined): unknown {
  if (
    (type === 'integer' || type === 'number') &&
    value.trim() !== '' &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }
  if (type === 'boolean' && (value === 'true' || value === 'false')) return value === 'true';

  return value;
}
