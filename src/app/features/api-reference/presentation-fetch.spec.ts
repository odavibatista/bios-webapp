/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApiError } from '../../core/api/api-error';
import { MockBiosApi } from '../../core/mocks/mock-bios-api';
import {
  createPresentationFetch,
  operationRoutes,
  type OpenApiDocument,
  type OperationHandlers,
} from './presentation-fetch';

const BASE = 'https://bios.test/api';
const NOW = Date.parse('2026-11-18T12:00:00Z');

/** Um recorte do documento da API com os casos que o roteador precisa distinguir. */
const DOCUMENT: OpenApiDocument = {
  paths: {
    '/companies/{cnpj}': {
      get: { operationId: 'getCompanyProfile', responses: { '200': {}, '404': {} } },
    },
    '/companies/movements': {
      get: {
        operationId: 'listCompanyMovements',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': {} },
      },
    },
    '/companies/{cnpj}/scores/{odsNumber}/explanation': {
      get: {
        operationId: 'getScoreExplanation',
        parameters: [
          { name: 'cnpj', in: 'path', schema: { type: 'string' } },
          { name: 'odsNumber', in: 'path', schema: { type: 'integer' } },
        ],
        responses: { '200': {} },
      },
    },
    '/api-keys': { post: { operationId: 'createApiKey', responses: { '201': {} } } },
    '/api-keys/{id}': { delete: { operationId: 'revokeApiKey', responses: { '204': {} } } },
    '/companies/export/xlsx': {
      get: { operationId: 'exportCompaniesXlsx', responses: { '200': {} } },
    },
    '/v1/companies/{cnpj}': {
      get: { operationId: 'getPublicCompanyProfile', responses: { '200': {} } },
    },
    '/health': { get: { operationId: 'checkHealth', responses: { '200': {} } } },
  },
};

function setup(handlers: OperationHandlers) {
  const fallback = vi.fn(() => Promise.resolve(new Response('do app')));
  const tokens: (string | null)[] = [];
  const fetcher = createPresentationFetch({
    baseUrl: BASE,
    routes: operationRoutes(DOCUMENT),
    handlers,
    withAccessToken: (token, call) => {
      tokens.push(token);

      return call();
    },
    now: () => NOW,
    fallback,
  });

  return { fetcher, fallback, tokens };
}

describe('roteador da referência da API na apresentação', () => {
  it('o caminho fixo ganha do parâmetro: /companies/movements não vira um CNPJ', async () => {
    const listCompanyMovements = vi.fn(() => Promise.resolve({ data: [] }));
    const getCompanyProfile = vi.fn(() => Promise.resolve({}));
    const { fetcher } = setup({ listCompanyMovements, getCompanyProfile });

    const response = await fetcher(
      `${BASE}/companies/movements?page=2&category=INFRACAO_AMBIENTAL`,
    );

    expect(response.status).toBe(200);
    expect(getCompanyProfile).not.toHaveBeenCalled();
    // Os parâmetros chegam com o tipo do documento: a página é número, a categoria é texto.
    expect(listCompanyMovements).toHaveBeenCalledWith({
      query: { page: 2, category: 'INFRACAO_AMBIENTAL' },
    });
  });

  it('responde em JSON com o status declarado e marca a resposta como da apresentação', async () => {
    const getScoreExplanation = vi.fn(() => Promise.resolve({ score_value: -80 }));
    const createApiKey = vi.fn(() => Promise.resolve({ id: 'k1', key: 'bios_D0000001_x' }));
    const { fetcher } = setup({ getScoreExplanation, createApiKey });

    const explanation = await fetcher(`${BASE}/companies/04735087000104/scores/15/explanation`);
    const created = await fetcher(`${BASE}/api-keys`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Integração' }),
    });

    expect(getScoreExplanation).toHaveBeenCalledWith({
      path: { cnpj: '04735087000104', odsNumber: 15 },
    });
    await expect(explanation.json()).resolves.toEqual({ score_value: -80 });
    expect(explanation.headers.get('x-bios-apresentacao')).toContain('navegador');
    expect(createApiKey).toHaveBeenCalledWith({ body: { name: 'Integração' } });
    expect(created.status).toBe(201);
  });

  it('o erro da API sai com o status e o ErrorResponse dela', async () => {
    const body = {
      statusCode: 404,
      code: 'COMPANY_NOT_FOUND',
      message: 'Empresa não encontrada.',
      timestamp: '2026-11-18T12:00:00.000Z',
      path: '/companies/12345678000100',
    };
    const { fetcher } = setup({
      getCompanyProfile: vi.fn(() => Promise.reject(new ApiError(404, body))),
    });

    const response = await fetcher(`${BASE}/companies/12345678000100`);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual(body);
  });

  it('o token vem do Authorization da própria requisição; sem ele, nenhum', async () => {
    const { fetcher, tokens } = setup({ getCompanyProfile: vi.fn(() => Promise.resolve({})) });

    await fetcher(`${BASE}/companies/04735087000104`, {
      headers: { authorization: 'Bearer mock-access-7' },
    });
    await fetcher(`${BASE}/companies/04735087000104`);

    expect(tokens).toEqual(['mock-access-7', null]);
  });

  it('a API pública confere a chave do cabeçalho x-api-key', async () => {
    const getPublicCompanyProfile = vi.fn(() => Promise.resolve({ cnpj: '04735087000104' }));
    const { fetcher } = setup({ getPublicCompanyProfile });

    const response = await fetcher(`${BASE}/v1/companies/04735087000104`, {
      headers: { 'x-api-key': 'bios_D0000003_segredo-de-demonstracao-3' },
    });

    expect(response.status).toBe(200);
    expect(getPublicCompanyProfile).toHaveBeenCalledWith(
      '04735087000104',
      'bios_D0000003_segredo-de-demonstracao-3',
    );
  });

  it('rota que a apresentação não reproduz avisa, em vez de inventar a resposta', async () => {
    const { fetcher } = setup({});

    const response = await fetcher(`${BASE}/health`);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: 'NOT_AVAILABLE_IN_PRESENTATION',
      path: '/health',
    });
  });

  it('rota inexistente é 404; JSON quebrado é 400', async () => {
    const { fetcher } = setup({ createApiKey: vi.fn() });

    const missing = await fetcher(`${BASE}/nada-aqui`);
    const broken = await fetcher(`${BASE}/api-keys`, { method: 'POST', body: '{"name":' });

    expect(missing.status).toBe(404);
    expect(broken.status).toBe(400);
    await expect(broken.json()).resolves.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('204 sai sem corpo, e a planilha sai como arquivo XLSX', async () => {
    // O Blob sai do próprio Response: no jsdom, o construtor global é de outro contexto.
    const blob = await new Response('planilha').blob();
    const { fetcher } = setup({
      revokeApiKey: vi.fn(() => Promise.resolve(undefined)),
      exportCompaniesXlsx: vi.fn(() =>
        Promise.resolve({ blob, filename: 'empresas-bios-2026-11-18.xlsx' }),
      ),
    });

    const revoked = await fetcher(`${BASE}/api-keys/k1`, { method: 'DELETE' });
    const exported = await fetcher(`${BASE}/companies/export/xlsx?uf=SP`);

    expect(revoked.status).toBe(204);
    expect(await revoked.text()).toBe('');
    expect(exported.headers.get('content-disposition')).toBe(
      'attachment; filename="empresas-bios-2026-11-18.xlsx"',
    );
    await expect(exported.text()).resolves.toBe('planilha');
  });

  it('o que não é da API segue para o fetch do navegador', async () => {
    const { fetcher, fallback } = setup({});

    const response = await fetcher('https://bios.test/openapi/openapi.json');

    expect(fallback).toHaveBeenCalledTimes(1);
    await expect(response.text()).resolves.toBe('do app');
  });
});

describe('documento OpenAPI publicado', () => {
  // As rotas que a versão de apresentação não reproduz, e que respondem com o aviso.
  const NOT_REPRODUCED = [
    'checkHealth',
    'listCompanyRemovals',
    'addCompanyRemoval',
    'restoreCompany',
    'getCompanyEvidences',
    'importCrmCompanies',
  ];

  it('toda rota do documento tem método no mock, exceto as que a apresentação não reproduz', () => {
    const document = JSON.parse(
      readFileSync(join(process.cwd(), 'api/openapi.json'), 'utf8'),
    ) as OpenApiDocument;
    const handlers = MockBiosApi.prototype as unknown as Record<string, unknown>;
    const missing = operationRoutes(document)
      .map((route) => route.operationId)
      .filter((id) => typeof handlers[id] !== 'function' && !NOT_REPRODUCED.includes(id));

    expect(missing).toEqual([]);
  });
});
