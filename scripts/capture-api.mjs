// Captura respostas reais do bios-core-api para a versão de apresentação (#11, FE-03).
//
// A versão de apresentação roda sem API no ar: as telas leem estas capturas. Elas vêm de uma API
// local com empresas reais, e não de dados inventados, para a demonstração mostrar o comportamento
// verdadeiro da API, inclusive os erros.
//
// Uso (API local no ar, banco limpo, Mailpit recebendo os e-mails da API):
//   BIOS_CAPTURE_PASSWORD=<senha> BIOS_CORE_DIR=<pasta do bios-core-api> \
//     node scripts/capture-api.mjs contas admin empresas setores limites
//
// Fases (rodam na ordem dada; cada uma grava as próprias capturas e atualiza o manifesto):
//   contas     cadastro, confirmação, login, sessão, conta, senha, troca de e-mail e chaves (só
//              num banco sem a conta de demonstração: o cadastro dela é o primeiro cenário)
//   admin      blacklist de domínios (promove a conta de demonstração a ADMIN pelo CLI do core)
//   empresas   perfis das empresas do manifesto, explicações, pesquisa, exportação, ODS e setores
//   setores    evolução setorial (rodar depois do agregador; repetir em outro mês para a série)
//   limites    429 da exportação, exclusão de conta e bloqueio de login (bloqueia o IP por 15 min:
//              por isso é a última)
//   teto       422 da exportação acima do teto (só com a API subida com EXPORT_MAX_COMPANIES baixo)
//
// Variáveis: BIOS_API_URL (padrão http://localhost:3000), MAILPIT_URL (padrão
// http://localhost:8025), BIOS_CAPTURE_PASSWORD (senha da conta de demonstração; nunca é gravada)
// e BIOS_CORE_DIR (a fase `admin`, para promover a conta, e o commit do core no manifesto).
//
// Nada secreto vai para os arquivos: senhas, tokens de sessão, tokens dos links de e-mail e o
// segredo das chaves de API são trocados por marcadores antes de gravar.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.BIOS_API_URL ?? 'http://localhost:3000';
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';
const PASSWORD = process.env.BIOS_CAPTURE_PASSWORD;
const CORE_DIR = process.env.BIOS_CORE_DIR;

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = join(ROOT, 'src', 'app', 'core', 'mocks', 'fixtures');
const MANIFEST = join(FIXTURES, 'manifest.json');

/** Conta de demonstração: domínio reservado para exemplos (RFC 2606), nenhum dado de pessoa real. */
const DEMO = {
  name: 'Conta de Demonstração',
  email: 'apresentacao@example.com',
  newEmail: 'apresentacao.nova@example.com',
};

/** Domínio da blacklist usado no cenário de recusa (vem do seed do core). */
const BLOCKED_DOMAIN = '0-mail.com';

/**
 * Empresas reais da demonstração e o que cada uma mostra (como a API respondeu na captura de
 * 30/10/2026). As dez da divisão 24 passam da amostra mínima do setor nos dois ODS
 * (`SECTOR_SNAPSHOT_MIN_COMPANIES`, padrão 5), para a evolução setorial ter média.
 */
const COMPANIES = [
  {
    cnpj: '60894730000105',
    slug: 'usiminas',
    reason: 'Divisão CNAE 24; autos do IBAMA e inventário de emissões confirmado no GHG Protocol',
  },
  {
    cnpj: '33042730000104',
    slug: 'csn',
    reason: 'Divisão CNAE 24; auto do IBAMA e inventário de emissões confirmado no GHG Protocol',
  },
  {
    cnpj: '33611500000119',
    slug: 'gerdau',
    reason: 'Divisão CNAE 24; sem registro nas fontes, GHG não verificado (índices indisponíveis)',
  },
  {
    cnpj: '07358761000169',
    slug: 'gerdau-acos-longos',
    reason:
      'Divisão CNAE 24; inventário GHG publicado com este CNPJ, mas não localizado pelo nome (GHG UNKNOWN)',
  },
  {
    cnpj: '17469701000177',
    slug: 'arcelormittal',
    reason: 'Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol',
  },
  {
    cnpj: '07005330000119',
    slug: 'ternium',
    reason: 'Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol',
  },
  {
    cnpj: '23637697000101',
    slug: 'alcoa',
    reason: 'Divisão CNAE 24 (metalurgia de não ferrosos); autos do IBAMA',
  },
  {
    cnpj: '00990842000138',
    slug: 'aco-cearense',
    reason: 'Divisão CNAE 24; autos do IBAMA; GHG não verificado nesta coleta (UNKNOWN)',
  },
  {
    cnpj: '04735087000104',
    slug: 'sidermin',
    reason: 'Divisão CNAE 24; autos do IBAMA e inventário de emissões confirmado no GHG Protocol',
  },
  {
    cnpj: '82643537000134',
    slug: 'electro-aco-altona',
    reason:
      'Divisão CNAE 24; inventário de emissões confirmado no GHG Protocol, sem autos do IBAMA',
  },
  {
    cnpj: '50375702000128',
    slug: 'eccheli',
    reason: 'Sanção vigente no CEIS (conduta administrativa)',
  },
  {
    cnpj: '33458350000155',
    slug: 'atuante',
    reason: 'Sanções vigentes no CEIS e no CNEP; situação cadastral inapta',
  },
  {
    cnpj: '42240841000116',
    slug: 'fox-store',
    reason: 'Sanção do CEIS vencida em 2024 (registro histórico); situação cadastral inapta',
  },
  {
    cnpj: '47960950000121',
    slug: 'magazine-luiza',
    reason: 'Sem registro em nenhuma fonte ambiental (NOT_FOUND); GHG não verificado',
  },
];

// ---------------------------------------------------------------------------------------------
// Segredos: todo valor registrado aqui sai dos arquivos trocado pelo marcador.
// ---------------------------------------------------------------------------------------------

const secrets = new Map();

function secret(value, placeholder) {
  if (typeof value === 'string' && value.length > 0) secrets.set(value, placeholder);
  return value;
}

function redact(text) {
  let out = text;
  // Os mais longos primeiro: um segredo pode conter outro (a chave contém o prefixo).
  for (const [value, placeholder] of [...secrets].sort((a, b) => b[0].length - a[0].length)) {
    out = out.split(value).join(placeholder);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// HTTP com ritmo: o limite geral da API é de 120 requisições por minuto por IP.
// ---------------------------------------------------------------------------------------------

const sent = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pace(limitPerMinute = 90) {
  for (;;) {
    const now = Date.now();
    while (sent.length && now - sent[0] > 60_000) sent.shift();
    if (sent.length < limitPerMinute) break;
    await sleep(60_000 - (now - sent[0]) + 50);
  }
  sent.push(Date.now());
}

/** Faz a chamada e devolve status, cabeçalhos relevantes e corpo (JSON, binário ou nada). */
async function call(method, path, { query, body, token, paced = true } = {}) {
  if (paced) await pace();
  const url = new URL(path, API);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, String(value));
  const bearer = typeof token === 'function' ? await token() : token;
  const send = () =>
    fetch(url, {
      method,
      headers: {
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  // Uma nova tentativa só para falha de rede (a API respondeu nada): uma conexão keep-alive que o
  // servidor fechou enquanto o roteiro esperava (ex.: o CLI de promoção) falha na primeira reutilização.
  const response = await send().catch(() => sleep(500).then(send));
  const headers = {};
  for (const name of ['content-type', 'retry-after', 'content-disposition']) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  const type = response.headers.get('content-type') ?? '';
  let parsed = null;
  if (response.status !== 204) {
    parsed = type.includes('application/json')
      ? await response.json()
      : Buffer.from(await response.arrayBuffer());
  }
  return { status: response.status, headers, body: parsed, request: { method, path, query, body } };
}

/** Falha a fase se a API não respondeu como o roteiro espera (captura errada não vai a arquivo). */
function expectStatus(res, ...expected) {
  if (!expected.includes(res.status)) {
    const detail = Buffer.isBuffer(res.body)
      ? `${res.body.length} bytes`
      : JSON.stringify(res.body);
    throw new Error(
      `${res.request.method} ${res.request.path}: esperava ${expected.join('/')}, veio ${res.status} ${detail}`,
    );
  }
  return res;
}

// ---------------------------------------------------------------------------------------------
// Capturas
// ---------------------------------------------------------------------------------------------

const captures = [];

/** Senhas nas requisições gravadas viram marcador; o resto da requisição fica como foi. */
function cleanRequest(request) {
  const out = { method: request.method, path: request.path };
  if (request.query && Object.keys(request.query).length) {
    out.query = Object.fromEntries(Object.entries(request.query).map(([k, v]) => [k, String(v)]));
  }
  if (request.body !== undefined) {
    out.body = Object.fromEntries(
      Object.entries(request.body).map(([k, v]) => [
        k,
        /password/.test(k) && typeof v === 'string' ? '<senha>' : v,
      ]),
    );
  }
  return out;
}

function capture(operationId, scenario, description, res) {
  captures.push({ operationId, scenario, description, res });
  console.log(`  ${res.status} ${operationId}/${scenario}`);
  return res;
}

const pascal = (id) => id[0].toUpperCase() + id.slice(1);

function writeCaptures() {
  for (const { operationId, scenario, description, res } of captures) {
    const dir = join(FIXTURES, operationId);
    mkdirSync(dir, { recursive: true });
    let body = res.body;
    if (Buffer.isBuffer(body)) {
      const file = `${scenario}.xlsx`;
      writeFileSync(join(dir, file), body);
      body = {
        file,
        contentType: res.headers['content-type'] ?? 'application/octet-stream',
        bytes: body.length,
      };
    }
    const fixture = {
      operationId,
      scenario,
      description,
      request: cleanRequest(res.request),
      status: res.status,
      headers: res.headers,
      body,
    };
    const map =
      res.status < 400 ? `${pascal(operationId)}Responses` : `${pascal(operationId)}Errors`;
    const source = [
      '// Gerado por scripts/capture-api.mjs a partir da API real. Não editar à mão: capture de novo.',
      `import type { ${map} } from '../../../api/generated';`,
      `import type { CapturedResponse } from '../../capture';`,
      '',
      `export default ${redact(JSON.stringify(fixture, null, 2))} satisfies CapturedResponse<${map}, ${res.status}>;`,
      '',
    ].join('\n');
    writeFileSync(join(dir, `${scenario}.ts`), source);
  }
}

/** Índice de todas as capturas (inclusive as de fases anteriores), para o mock e os testes. */
function writeIndex() {
  const entries = [];
  for (const operationId of readdirSync(FIXTURES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()) {
    for (const file of readdirSync(join(FIXTURES, operationId))
      .filter((f) => f.endsWith('.ts'))
      .sort()) {
      entries.push(`${operationId}/${file.slice(0, -3)}`);
    }
  }
  const name = (entry) => entry.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  const source = [
    '// Gerado por scripts/capture-api.mjs. Não editar à mão.',
    ...entries.map((entry) => `import ${name(entry)} from './${entry}';`),
    '',
    '/** Todas as respostas capturadas, pela chave `<operationId>/<cenário>`. */',
    'export const CAPTURES = {',
    ...entries.map((entry) => `  '${entry}': ${name(entry)},`),
    '} as const;',
    '',
    'export type CaptureKey = keyof typeof CAPTURES;',
    '',
  ].join('\n');
  writeFileSync(join(FIXTURES, 'index.ts'), source);
  return entries.length;
}

function coreCommit() {
  if (!CORE_DIR) return null;
  try {
    return execFileSync('git', ['-C', CORE_DIR, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

function writeManifest(phases) {
  const previous = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
    : { phases: {} };
  const now = new Date().toISOString();
  const manifest = {
    description:
      'Respostas reais do bios-core-api capturadas por scripts/capture-api.mjs para a versão de apresentação (#11).',
    api: {
      repository: 'odavibatista/bios-core-api',
      commit: coreCommit() ?? previous.api?.commit ?? null,
    },
    demo_account: { name: DEMO.name, email: DEMO.email },
    blocked_domain_used: BLOCKED_DOMAIN,
    companies: COMPANIES.map(({ cnpj, slug, reason }) => ({ cnpj, slug, reason })),
    phases: { ...previous.phases, ...Object.fromEntries(phases.map((phase) => [phase, now])) },
    notes: previous.notes ?? [],
  };
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

// ---------------------------------------------------------------------------------------------
// E-mails (Mailpit): os links trazem o token de confirmação, de troca e de redefinição.
// ---------------------------------------------------------------------------------------------

async function clearMailbox() {
  await fetch(new URL('/api/v1/messages', MAILPIT), { method: 'DELETE' });
}

/** Espera o e-mail mais novo para `to` com um link de `route` e devolve o token do link. */
async function tokenFromEmail(to, route, sinceMs) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const list = await (await fetch(new URL('/api/v1/messages?limit=50', MAILPIT))).json();
    const candidates = (list.messages ?? [])
      .filter((m) => m.To?.some((t) => t.Address.toLowerCase() === to.toLowerCase()))
      .filter((m) => Date.parse(m.Created) >= sinceMs - 2_000);
    for (const message of candidates) {
      const full = await (await fetch(new URL(`/api/v1/message/${message.ID}`, MAILPIT))).json();
      const match = new RegExp(`/${route}/([^\\s"'<>]+)`).exec(
        `${full.Text ?? ''} ${full.HTML ?? ''}`,
      );
      if (match) return secret(decodeURIComponent(match[1]), 'token-do-link-de-demonstracao');
    }
    await sleep(1_000);
  }
  throw new Error(`Nenhum e-mail com /${route}/ para ${to}: a API está enviando ao Mailpit?`);
}

// ---------------------------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------------------------

let sessions = 0;

async function login(email, password) {
  const res = expectStatus(await call('POST', '/auth/login', { body: { email, password } }), 200);
  sessions += 1;
  secret(res.body.access_token, `token-de-acesso-de-demonstracao-${sessions}`);
  secret(res.body.refresh_token, `token-de-renovacao-de-demonstracao-${sessions}`);
  return res;
}

/**
 * Token da conta de demonstração que se renova sozinho: o de acesso vence em 15 minutos, e a fase
 * das empresas (coletas e recálculos reais) passa disso.
 */
function renewingToken() {
  let token;
  let openedAt = 0;
  return async () => {
    if (Date.now() - openedAt > 10 * 60_000) {
      token = (await login(DEMO.email, PASSWORD)).body.access_token;
      openedAt = Date.now();
    }
    return token;
  };
}

/** Cadastra e confirma uma conta auxiliar (não capturada). */
async function createConfirmedAccount(email, name) {
  const since = Date.now();
  expectStatus(await call('POST', '/accounts', { body: { name, email, password: PASSWORD } }), 202);
  const token = await tokenFromEmail(email, 'confirmar-email', since);
  expectStatus(await call('POST', '/accounts/confirm-email', { body: { token } }), 200);
}

// ---------------------------------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------------------------------

/** Endereço de um lugar público (o do museu na Avenida Paulista), não de uma pessoa. */
const ADDRESS = {
  postal_code: '01310-200',
  street: 'Avenida Paulista',
  number: '1578',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
};

async function phaseAccounts() {
  const otherPassword = `${PASSWORD}-2`;
  secret(otherPassword, '<senha>');
  await clearMailbox();

  // Cadastro e confirmação (UC01).
  let since = Date.now();
  const register = { name: DEMO.name, email: DEMO.email, password: PASSWORD };
  capture(
    'registerAccount',
    'sucesso',
    'Cadastro aceito; o link de confirmação vai por e-mail',
    expectStatus(await call('POST', '/accounts', { body: register }), 202),
  );
  capture(
    'registerAccount',
    'email-ja-cadastrado',
    'E-mail já cadastrado: mesma resposta do sucesso (RF01 b)',
    expectStatus(await call('POST', '/accounts', { body: register }), 202),
  );
  capture(
    'registerAccount',
    'dominio-bloqueado',
    'Domínio da blacklist (RF22)',
    expectStatus(
      await call('POST', '/accounts', {
        body: { ...register, email: `demonstracao@${BLOCKED_DOMAIN}` },
      }),
      422,
    ),
  );
  capture(
    'registerAccount',
    'validacao',
    'Campos fora das regras',
    expectStatus(
      await call('POST', '/accounts', {
        body: { name: 'A', email: 'nao-e-email', password: 'curta' },
      }),
      422,
    ),
  );

  const token = await tokenFromEmail(DEMO.email, 'confirmar-email', since);
  capture(
    'confirmEmail',
    'sucesso',
    'Link de confirmação válido ativa a conta',
    expectStatus(await call('POST', '/accounts/confirm-email', { body: { token } }), 200),
  );
  capture(
    'confirmEmail',
    'token-invalido',
    'Link já usado (ou expirado)',
    expectStatus(await call('POST', '/accounts/confirm-email', { body: { token } }), 400),
  );
  capture(
    'confirmEmail',
    'validacao',
    'Token vazio',
    expectStatus(await call('POST', '/accounts/confirm-email', { body: { token: '' } }), 422),
  );

  // Conta que nunca confirma: login recusado com 403 e reenvio do link.
  const pending = 'pendente@example.com';
  expectStatus(
    await call('POST', '/accounts', {
      body: { name: 'Conta Pendente de Demonstração', email: pending, password: PASSWORD },
    }),
    202,
  );
  capture(
    'resendEmailConfirmation',
    'sucesso',
    'Reenvio do link: mesma resposta exista ou não a conta',
    expectStatus(
      await call('POST', '/accounts/resend-confirmation', { body: { email: pending } }),
      202,
    ),
  );
  capture(
    'login',
    'conta-nao-confirmada',
    'Senha certa, e-mail ainda não confirmado (UC02, 3.4)',
    expectStatus(
      await call('POST', '/auth/login', { body: { email: pending, password: PASSWORD } }),
      403,
    ),
  );

  // Login (UC02). Uma falha só: cinco bloqueiam o IP (fase `limites`).
  capture(
    'login',
    'credenciais-invalidas',
    'Senha incorreta: mesma mensagem de e-mail inexistente',
    expectStatus(
      await call('POST', '/auth/login', { body: { email: DEMO.email, password: otherPassword } }),
      401,
    ),
  );
  capture(
    'login',
    'validacao',
    'Corpo fora das regras',
    expectStatus(
      await call('POST', '/auth/login', { body: { email: 'nao-e-email', password: '' } }),
      422,
    ),
  );
  let session = capture(
    'login',
    'sucesso',
    'Sessão aberta',
    await login(DEMO.email, PASSWORD),
  ).body;

  const refreshed = expectStatus(
    await call('POST', '/auth/refresh', { body: { refresh_token: session.refresh_token } }),
    200,
  );
  sessions += 1;
  secret(refreshed.body.access_token, `token-de-acesso-de-demonstracao-${sessions}`);
  secret(refreshed.body.refresh_token, `token-de-renovacao-de-demonstracao-${sessions}`);
  capture('refreshSession', 'sucesso', 'Renovação: novo par de tokens', refreshed);
  session = refreshed.body;
  capture(
    'refreshSession',
    'token-invalido',
    'Refresh token inexistente',
    expectStatus(
      await call('POST', '/auth/refresh', {
        body: { refresh_token: randomBytes(32).toString('base64url') },
      }),
      401,
    ),
  );

  // Conta (UC05).
  const auth = () => ({ token: session.access_token });
  capture(
    'getOwnAccount',
    'sucesso',
    'Dados da própria conta',
    expectStatus(await call('GET', '/accounts/me', auth()), 200),
  );
  capture(
    'getOwnAccount',
    'sem-sessao',
    'Sem token de acesso',
    expectStatus(await call('GET', '/accounts/me'), 401),
  );
  capture(
    'updateOwnAccount',
    'nome',
    'Troca do nome',
    expectStatus(
      await call('PATCH', '/accounts/me', { ...auth(), body: { name: DEMO.name } }),
      200,
    ),
  );
  capture(
    'updateOwnAccount',
    'endereco',
    'Endereço gravado (cifrado na API)',
    expectStatus(
      await call('PATCH', '/accounts/me', { ...auth(), body: { address: ADDRESS } }),
      200,
    ),
  );
  capture(
    'updateOwnAccount',
    'validacao',
    'CEP e UF inválidos',
    expectStatus(
      await call('PATCH', '/accounts/me', {
        ...auth(),
        body: { address: { ...ADDRESS, postal_code: '123', state: 'XX' } },
      }),
      422,
    ),
  );
  capture(
    'updateOwnAccount',
    'remover-endereco',
    'Endereço removido (`address: null`)',
    expectStatus(await call('PATCH', '/accounts/me', { ...auth(), body: { address: null } }), 200),
  );
  expectStatus(await call('PATCH', '/accounts/me', { ...auth(), body: { address: ADDRESS } }), 200);

  // Blacklist sem ser administrador.
  capture(
    'listBlockedEmailDomains',
    'sem-permissao',
    'Conta USER na área de administração',
    expectStatus(await call('GET', '/admin/blocked-email-domains', auth()), 403),
  );

  // Chaves de API (UC11).
  const created = expectStatus(
    await call('POST', '/api-keys', { ...auth(), body: { name: 'Planilha de fornecedores' } }),
    201,
  );
  secret(created.body.key, `${created.body.prefix}_segredo-de-demonstracao`);
  capture('createApiKey', 'sucesso', 'Chave criada: o segredo aparece só nesta resposta', created);
  const second = expectStatus(
    await call('POST', '/api-keys', { ...auth(), body: { name: 'Painel de BI' } }),
    201,
  );
  secret(second.body.key, `${second.body.prefix}_segredo-de-demonstracao-2`);
  capture(
    'createApiKey',
    'validacao',
    'Nome vazio',
    expectStatus(await call('POST', '/api-keys', { ...auth(), body: { name: '' } }), 422),
  );
  capture(
    'listApiKeys',
    'com-chaves',
    'Duas chaves ativas',
    expectStatus(await call('GET', '/api-keys', auth()), 200),
  );
  capture(
    'revokeApiKey',
    'sucesso',
    'Chave revogada',
    expectStatus(await call('DELETE', `/api-keys/${second.body.id}`, auth()), 204),
  );
  capture(
    'revokeApiKey',
    'nao-encontrada',
    'Chave inexistente (ou de outra conta)',
    expectStatus(await call('DELETE', '/api-keys/ffffffffffffffffffffffff', auth()), 404),
  );
  capture(
    'listApiKeys',
    'apos-revogacao',
    'Lista depois da revogação',
    expectStatus(await call('GET', '/api-keys', auth()), 200),
  );

  // Troca de e-mail (UC05, 1.1).
  capture(
    'requestEmailChange',
    'senha-incorreta',
    'Senha atual errada',
    expectStatus(
      await call('POST', '/accounts/me/email-change', {
        ...auth(),
        body: { new_email: DEMO.newEmail, current_password: otherPassword },
      }),
      401,
      422,
    ),
  );
  capture(
    'requestEmailChange',
    'mesmo-email',
    'Novo e-mail igual ao atual',
    expectStatus(
      await call('POST', '/accounts/me/email-change', {
        ...auth(),
        body: { new_email: DEMO.email, current_password: PASSWORD },
      }),
      422,
    ),
  );
  capture(
    'requestEmailChange',
    'dominio-bloqueado',
    'Novo e-mail na blacklist (RF22)',
    expectStatus(
      await call('POST', '/accounts/me/email-change', {
        ...auth(),
        body: { new_email: `demonstracao@${BLOCKED_DOMAIN}`, current_password: PASSWORD },
      }),
      422,
    ),
  );
  capture(
    'requestEmailChange',
    'email-de-outra-conta',
    'E-mail de outra conta: mesma resposta do sucesso (regra 5)',
    expectStatus(
      await call('POST', '/accounts/me/email-change', {
        ...auth(),
        body: { new_email: pending, current_password: PASSWORD },
      }),
      202,
    ),
  );
  since = Date.now();
  capture(
    'requestEmailChange',
    'sucesso',
    'Link enviado ao novo endereço; o atual vale até a confirmação',
    expectStatus(
      await call('POST', '/accounts/me/email-change', {
        ...auth(),
        body: { new_email: DEMO.newEmail, current_password: PASSWORD },
      }),
      202,
    ),
  );
  const changeToken = await tokenFromEmail(DEMO.newEmail, 'confirmar-novo-email', since);
  capture(
    'confirmEmailChange',
    'sucesso',
    'Troca efetivada pelo link',
    expectStatus(
      await call('POST', '/accounts/confirm-email-change', { body: { token: changeToken } }),
      200,
    ),
  );
  capture(
    'confirmEmailChange',
    'token-invalido',
    'Link já usado',
    expectStatus(
      await call('POST', '/accounts/confirm-email-change', { body: { token: changeToken } }),
      400,
    ),
  );

  // 409: o endereço pedido passa a ser de outra conta antes da confirmação.
  const disputed = 'apresentacao.disputa@example.com';
  since = Date.now();
  expectStatus(
    await call('POST', '/accounts/me/email-change', {
      ...auth(),
      body: { new_email: disputed, current_password: PASSWORD },
    }),
    202,
  );
  const disputedToken = await tokenFromEmail(disputed, 'confirmar-novo-email', since);
  await createConfirmedAccount(disputed, 'Conta Concorrente de Demonstração');
  capture(
    'confirmEmailChange',
    'email-ja-em-uso',
    'O endereço passou a ser de outra conta antes da confirmação',
    expectStatus(
      await call('POST', '/accounts/confirm-email-change', { body: { token: disputedToken } }),
      409,
    ),
  );

  // Volta ao e-mail de demonstração (não capturado).
  since = Date.now();
  expectStatus(
    await call('POST', '/accounts/me/email-change', {
      ...auth(),
      body: { new_email: DEMO.email, current_password: PASSWORD },
    }),
    202,
  );
  expectStatus(
    await call('POST', '/accounts/confirm-email-change', {
      body: { token: await tokenFromEmail(DEMO.email, 'confirmar-novo-email', since) },
    }),
    200,
  );

  // Senha (UC04).
  capture(
    'changePassword',
    'senha-atual-incorreta',
    'Senha atual errada',
    expectStatus(
      await call('POST', '/auth/change-password', {
        ...auth(),
        body: { current_password: otherPassword, new_password: `${otherPassword}x` },
      }),
      401,
      422,
    ),
  );
  capture(
    'changePassword',
    'senha-igual',
    'Nova senha igual à atual',
    expectStatus(
      await call('POST', '/auth/change-password', {
        ...auth(),
        body: { current_password: PASSWORD, new_password: PASSWORD },
      }),
      422,
    ),
  );
  capture(
    'changePassword',
    'validacao',
    'Nova senha fora da política',
    expectStatus(
      await call('POST', '/auth/change-password', {
        ...auth(),
        body: { current_password: PASSWORD, new_password: 'curta' },
      }),
      422,
    ),
  );
  const oldToken = session.access_token;
  capture(
    'changePassword',
    'sucesso',
    'Senha trocada; todas as sessões caem',
    expectStatus(
      await call('POST', '/auth/change-password', {
        ...auth(),
        body: { current_password: PASSWORD, new_password: otherPassword },
      }),
      204,
    ),
  );
  capture(
    'getOwnAccount',
    'sessao-encerrada',
    'Token de uma sessão encerrada pela troca de senha',
    expectStatus(await call('GET', '/accounts/me', { token: oldToken }), 401),
  );

  since = Date.now();
  capture(
    'forgotPassword',
    'sucesso',
    'Pedido de redefinição: mesma resposta exista ou não a conta',
    expectStatus(await call('POST', '/auth/forgot-password', { body: { email: DEMO.email } }), 202),
  );
  capture(
    'forgotPassword',
    'email-desconhecido',
    'E-mail sem conta: mesma resposta (RF25 b)',
    expectStatus(
      await call('POST', '/auth/forgot-password', { body: { email: 'ninguem@example.com' } }),
      202,
    ),
  );
  const resetToken = await tokenFromEmail(DEMO.email, 'redefinir-senha', since);
  capture(
    'resetPassword',
    'senha-fora-da-politica',
    'Senha nova inválida não gasta o link (UC04, regra 6)',
    expectStatus(
      await call('POST', '/auth/reset-password', {
        body: { token: resetToken, new_password: 'curta' },
      }),
      422,
    ),
  );
  capture(
    'resetPassword',
    'sucesso',
    'O mesmo link grava a senha nova',
    expectStatus(
      await call('POST', '/auth/reset-password', {
        body: { token: resetToken, new_password: PASSWORD },
      }),
      204,
    ),
  );
  capture(
    'resetPassword',
    'token-invalido',
    'Link já usado',
    expectStatus(
      await call('POST', '/auth/reset-password', {
        body: { token: resetToken, new_password: PASSWORD },
      }),
      400,
    ),
  );

  // Encerrar sessão (UC03).
  session = (await login(DEMO.email, PASSWORD)).body;
  capture(
    'logout',
    'sucesso',
    'Sessão deste dispositivo encerrada',
    expectStatus(await call('POST', '/auth/logout', { token: session.access_token }), 204),
  );
  capture(
    'logout',
    'sem-sessao',
    'Token de sessão já encerrada',
    expectStatus(await call('POST', '/auth/logout', { token: session.access_token }), 401),
  );
  await login(DEMO.email, PASSWORD);
  session = (await login(DEMO.email, PASSWORD)).body;
  capture(
    'logoutAllDevices',
    'sucesso',
    'Todas as sessões da conta encerradas',
    expectStatus(await call('POST', '/auth/logout-all', { token: session.access_token }), 204),
  );
}

async function phaseAdmin() {
  if (!CORE_DIR)
    throw new Error('A fase `admin` precisa de BIOS_CORE_DIR para promover a conta a ADMIN.');
  // Administração da blacklist (UC13): promove a conta pelo CLI do core, como no runbook. Promover
  // quem já é ADMIN não muda nada, então a fase pode ser repetida.
  execFileSync(
    process.execPath,
    ['--env-file=.env', 'dist/app/cli/promote-account.main.js', '--email', DEMO.email, '--apply'],
    { cwd: CORE_DIR, stdio: 'inherit' },
  );
  const session = (await login(DEMO.email, PASSWORD)).body;
  const auth = () => ({ token: session.access_token });
  capture(
    'listBlockedEmailDomains',
    'primeira-pagina',
    'Primeira página da blacklist',
    expectStatus(
      await call('GET', '/admin/blocked-email-domains', {
        ...auth(),
        query: { page: 1, page_size: 20 },
      }),
      200,
    ),
  );
  const domain = 'caixa-temporaria-demonstracao.com';
  const added = capture(
    'addBlockedEmailDomain',
    'sucesso',
    'Domínio incluído pelo administrador',
    expectStatus(
      await call('POST', '/admin/blocked-email-domains', { ...auth(), body: { domain } }),
      201,
    ),
  );
  capture(
    'addBlockedEmailDomain',
    'duplicado',
    'Domínio já bloqueado',
    expectStatus(
      await call('POST', '/admin/blocked-email-domains', { ...auth(), body: { domain } }),
      409,
    ),
  );
  capture(
    'addBlockedEmailDomain',
    'validacao',
    'Texto que não é domínio',
    expectStatus(
      await call('POST', '/admin/blocked-email-domains', {
        ...auth(),
        body: { domain: 'não é domínio' },
      }),
      422,
    ),
  );
  capture(
    'removeBlockedEmailDomain',
    'sucesso',
    'Domínio removido',
    expectStatus(
      await call('DELETE', `/admin/blocked-email-domains/${added.body.id}`, auth()),
      204,
    ),
  );
  capture(
    'removeBlockedEmailDomain',
    'nao-encontrado',
    'Domínio inexistente',
    expectStatus(
      await call('DELETE', '/admin/blocked-email-domains/ffffffffffffffffffffffff', auth()),
      404,
    ),
  );
}

/** Consulta o perfil até a coleta e o índice terminarem (ou desistir). */
async function settledProfile(cnpj, token) {
  let res;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    res = expectStatus(await call('GET', `/companies/${cnpj}`, { token }), 200, 503);
    if (!isPending(res)) return res;
    await sleep(Math.max(res.body.provenance.retry_after_seconds ?? 0, 5) * 1_000);
  }
  console.log(`  aviso: ${cnpj} ainda pendente depois das tentativas; capturado como está`);
  return res;
}

/**
 * CNPJ com dígitos verificadores válidos a partir dos 12 primeiros: passa na validação da API e
 * chega à Receita. Os CNPJs "de exemplo" famosos existem de verdade, por isso a raiz inventada.
 */
function withCheckDigits(base) {
  const digit = (digits) => {
    const weights =
      digits.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const rest = [...digits].reduce((sum, d, i) => sum + Number(d) * weights[i], 0) % 11;
    return rest < 2 ? '0' : String(11 - rest);
  };
  const first = digit(base);
  return `${base}${first}${digit(base + first)}`;
}

const isPending = (res) =>
  res.status === 200 &&
  (res.body.provenance.scores_pending ||
    res.body.provenance.sources.some((s) => s.origin === 'PENDING'));

async function phaseCompanies() {
  const token = renewingToken();
  const auth = { token };
  let firstPendingCaptured = false;

  const ods = capture(
    'listOds',
    'sucesso',
    'ODS calculados pelo BIOS',
    expectStatus(await call('GET', '/ods', auth), 200),
  ).body.data;

  for (const company of COMPANIES) {
    const first = expectStatus(await call('GET', `/companies/${company.cnpj}`, auth), 200, 503);
    // Só uma resposta de fato pendente serve de exemplo; numa segunda execução o perfil já vem
    // do cache, e a captura anterior fica.
    if (!firstPendingCaptured && isPending(first)) {
      firstPendingCaptured = true;
      capture(
        'getCompanyProfile',
        'primeira-consulta',
        `Primeira consulta: coletas e índice ainda pendentes (UC07, regra 7) — ${company.slug}`,
        first,
      );
    }
    capture(
      'getCompanyProfile',
      company.slug,
      `Perfil completo: ${company.reason}`,
      await settledProfile(company.cnpj, token),
    );
  }
  for (const company of COMPANIES) {
    for (const { ods_number } of ods) {
      const res = expectStatus(
        await call('GET', `/companies/${company.cnpj}/scores/${ods_number}/explanation`, auth),
        200,
        409,
      );
      capture(
        'getScoreExplanation',
        `${company.slug}-ods-${ods_number}`,
        `Explicação do índice do ODS ${ods_number}`,
        res,
      );
    }
  }
  capture(
    'getScoreExplanation',
    'ods-nao-calculado',
    'ODS que o BIOS não calcula',
    expectStatus(
      await call('GET', `/companies/${COMPANIES[0].cnpj}/scores/7/explanation`, auth),
      404,
      422,
    ),
  );
  capture(
    'getCompanyProfile',
    'cnpj-invalido',
    'CNPJ com dígitos verificadores errados',
    expectStatus(await call('GET', '/companies/12345678000100', auth), 422),
  );
  // A cadeia cadastral só diz "não encontrada" quando todos os provedores dizem isso; se algum não
  // responde, a resposta é de indisponibilidade (UC06, regra 9). Grava o que a API devolver.
  const unknown = expectStatus(
    await call('GET', `/companies/${withCheckDigits('999999980001')}`, auth),
    404,
    503,
  );
  if (unknown.status === 404) {
    capture(
      'getCompanyProfile',
      'nao-encontrada',
      'CNPJ válido que a Receita não conhece (UC06, 3.3)',
      unknown,
    );
  } else {
    capture(
      'getCompanyProfile',
      'cadastro-indisponivel',
      'Provedores cadastrais sem resposta e sem cópia local (UC06, 3.2)',
      unknown,
    );
  }

  // Pesquisa (UC06 1.1, UC08).
  const search = async (scenario, description, query, ...status) =>
    capture(
      'searchCompanies',
      scenario,
      description,
      expectStatus(
        await call('GET', '/companies', { ...auth, query }),
        ...(status.length ? status : [200]),
      ),
    );
  await search('nome', 'Busca por nome', { name: 'gerdau' });
  await search('nome-sem-resultado', 'Nenhuma empresa da base casa o nome', {
    name: 'empresa inexistente demonstracao',
  });
  await search('nome-curto', 'Texto sem palavra de 3 letras', { name: 'ab' }, 422);
  await search('sem-criterio', 'Nenhum critério informado', {}, 422);
  await search('setor-ods-13-desc', 'Divisão 24, ODS 13, do maior para o menor', {
    cnae: '24',
    ods: 13,
    order: 'desc',
  });
  await search('setor-ods-13-asc', 'Divisão 24, ODS 13, do menor para o maior', {
    cnae: '24',
    ods: 13,
    order: 'asc',
  });
  await search('setor-ods-15-desc', 'Divisão 24, ODS 15, do maior para o menor', {
    cnae: '24',
    ods: 15,
    order: 'desc',
  });
  await search('setor-pagina-2', 'Segunda página com 5 por página', {
    cnae: '24',
    page: 2,
    page_size: 5,
  });
  await search('uf', 'Empresas de MG', { uf: 'MG' });
  await search('indice-minimo', 'ODS 13 com índice e confiança mínimos', {
    ods: 13,
    min_score: 0,
    min_confidence: 0.3,
  });
  await search(
    'ods-nao-calculado',
    'ODS fora dos calculados (UC08, 3.1)',
    { cnae: '24', ods: 7 },
    422,
  );
  await search('ordem-sem-ods', 'Ordenação sem ODS', { cnae: '24', order: 'desc' }, 422);

  // Exportação (UC09): arquivos reais da API.
  const exportXlsx = async (scenario, description, query, ...status) =>
    capture(
      'exportCompaniesXlsx',
      scenario,
      description,
      expectStatus(
        await call('GET', '/companies/export/xlsx', { ...auth, query }),
        ...(status.length ? status : [200]),
      ),
    );
  await exportXlsx('setor-ods-13-desc', 'Planilha da divisão 24 pelo ODS 13', {
    cnae: '24',
    ods: 13,
    order: 'desc',
  });
  await exportXlsx('nome', 'Planilha da busca por nome', { name: 'gerdau' });
  await exportXlsx(
    'sem-resultado',
    'Nada para exportar',
    { name: 'empresa inexistente demonstracao' },
    404,
  );

  capture(
    'listSectors',
    'sucesso',
    'Divisões CNAE com a descrição oficial',
    expectStatus(await call('GET', '/sectors', auth), 200),
  );
}

async function phaseSectors() {
  const auth = { token: (await login(DEMO.email, PASSWORD)).body.access_token };
  const evolution = async (scenario, description, cnae, ods, ...status) =>
    capture(
      'getSectorEvolution',
      scenario,
      description,
      expectStatus(
        await call('GET', `/sectors/${cnae}/evolution`, { ...auth, query: { ods } }),
        ...(status.length ? status : [200]),
      ),
    );
  // Todo setor da lista em todo ODS ativo: a tela escolhe o setor entre os de `listSectors`, e o
  // mock não inventa série para combinação que não foi capturada.
  const sectors = expectStatus(await call('GET', '/sectors', auth), 200).body.data;
  const ods = expectStatus(await call('GET', '/ods', auth), 200).body.data;
  for (const { cnae_division, description } of sectors) {
    for (const { ods_number } of ods) {
      await evolution(
        `setor-${cnae_division}-ods-${ods_number}`,
        `${description}, ODS ${ods_number}`,
        cnae_division,
        ods_number,
      );
    }
  }
  await evolution('setor-sem-empresas', 'Divisão válida sem empresa na base', '01', 13);
  await evolution('cnae-invalido', 'CNAE fora do formato', 'abc', 13, 422);
  await evolution('ods-nao-calculado', 'ODS fora dos calculados', '24', 7, 422);
}

async function phaseLimits() {
  const auth = { token: (await login(DEMO.email, PASSWORD)).body.access_token };

  // 429 da exportação (NFSE04): o limite próprio é de 10 por minuto.
  let res;
  for (let i = 0; i < 15; i += 1) {
    res = await call('GET', '/companies/export/xlsx', { ...auth, query: { name: 'gerdau' } });
    if (res.status === 429) break;
  }
  capture(
    'exportCompaniesXlsx',
    'limite-excedido',
    'Limite de exportações por minuto (Retry-After)',
    expectStatus(res, 429),
  );

  // Exclusão de conta (UC05, 1.2–1.3) numa conta descartável.
  const removable = 'exclusao@example.com';
  await createConfirmedAccount(removable, 'Conta Descartável de Demonstração');
  const removableToken = (await login(removable, PASSWORD)).body.access_token;
  capture(
    'deleteOwnAccount',
    'senha-incorreta',
    'Senha errada: a conta continua',
    expectStatus(
      await call('DELETE', '/accounts/me', {
        token: removableToken,
        body: { password: `${PASSWORD}-errada` },
      }),
      401,
      422,
    ),
  );
  capture(
    'deleteOwnAccount',
    'sucesso',
    'Conta e dados pessoais removidos',
    expectStatus(
      await call('DELETE', '/accounts/me', { token: removableToken, body: { password: PASSWORD } }),
      204,
    ),
  );

  // Bloqueio de login (RF20): bloqueia o IP por 15 minutos.
  const blocked = 'bloqueio@example.com';
  await createConfirmedAccount(blocked, 'Conta Bloqueada de Demonstração');
  for (let i = 0; i < 5; i += 1)
    await call('POST', '/auth/login', { body: { email: blocked, password: `${PASSWORD}-errada` } });
  capture(
    'login',
    'acesso-bloqueado',
    'Bloqueio temporário: nem a senha certa entra (RF20)',
    expectStatus(
      await call('POST', '/auth/login', { body: { email: blocked, password: PASSWORD } }),
      429,
    ),
  );
}

async function phaseCeiling() {
  const auth = { token: (await login(DEMO.email, PASSWORD)).body.access_token };
  capture(
    'exportCompaniesXlsx',
    'acima-do-teto',
    'Lista maior que o teto de empresas por arquivo',
    expectStatus(
      await call('GET', '/companies/export/xlsx', { ...auth, query: { cnae: '24' } }),
      422,
    ),
  );
}

// ---------------------------------------------------------------------------------------------

const PHASES = {
  contas: phaseAccounts,
  admin: phaseAdmin,
  empresas: phaseCompanies,
  setores: phaseSectors,
  limites: phaseLimits,
  teto: phaseCeiling,
};

const requested = process.argv.slice(2);
if (!requested.length || requested.some((phase) => !PHASES[phase])) {
  console.error(`Uso: node scripts/capture-api.mjs <${Object.keys(PHASES).join('|')}>...`);
  process.exit(2);
}
if (!PASSWORD) {
  console.error('Defina BIOS_CAPTURE_PASSWORD (senha da conta de demonstração).');
  process.exit(2);
}
secret(PASSWORD, '<senha>');
mkdirSync(FIXTURES, { recursive: true });

let failed = false;
for (const phase of requested) {
  console.log(`== ${phase}`);
  try {
    await PHASES[phase]();
  } catch (error) {
    console.error(`A fase ${phase} falhou: ${error.message}`);
    failed = true;
    break;
  }
}
// O que foi capturado até a falha é gravado: cada captura é válida por si.
writeCaptures();
writeManifest(failed ? [] : requested);
console.log(
  `${captures.length} captura(s) gravada(s); índice com ${writeIndex()} no total em ${relative(ROOT, FIXTURES)}.`,
);
if (failed) process.exit(1);
