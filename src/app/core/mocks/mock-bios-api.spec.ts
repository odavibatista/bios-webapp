import { TestBed } from '@angular/core/testing';
import { InMemoryApiCredentials } from '../api/api-credentials';
import { ApiError } from '../api/api-error';
import { BiosApi } from '../api/bios-api';
import type { MockApiConfig } from './mock-config';
import { MockFiles } from './mock-files';
import { MockMailbox } from './mock-mailbox';
import { provideMockBiosApi } from './provide-mock-bios-api';

const USER = 'apresentacao@example.com';
const ADMIN = 'administracao@example.com';
const PASSWORD = 'Apresentacao2026';
const START = Date.parse('2026-10-30T12:00:00Z');

let clock: number;
let api: BiosApi;
let credentials: InMemoryApiCredentials;
let mailbox: MockMailbox;
let files: { load: ReturnType<typeof vi.fn> };

function setup(config: Partial<MockApiConfig> = {}): void {
  clock = START;
  files = { load: vi.fn(() => Promise.resolve(new Blob(['planilha']))) };
  TestBed.configureTestingModule({
    providers: [
      provideMockBiosApi({ latencyMs: 0, now: () => clock, ...config }),
      { provide: MockFiles, useValue: files },
    ],
  });
  api = TestBed.inject(BiosApi);
  credentials = TestBed.inject(InMemoryApiCredentials);
  mailbox = TestBed.inject(MockMailbox);
}

/** Entra e passa a usar o token da sessão nas operações privadas. */
async function signIn(email = USER, password = PASSWORD) {
  const session = await api.login({ body: { email, password } });

  credentials.setAccessToken(session.access_token);

  return session;
}

/** Confere que a chamada falha com o status e o código da API. */
async function expectError(
  call: Promise<unknown>,
  status: number,
  code: string,
): Promise<ApiError> {
  const error = await call.then(
    () => null,
    (reason: unknown) => reason,
  );

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status, code });

  return error as ApiError;
}

/** Token do link mais recente que o "e-mail" levaria. */
function linkToken(
  to: string,
  kind: 'confirmar-email' | 'redefinir-senha' | 'confirmar-novo-email',
): string {
  return mailbox.latest(to, kind)?.link.split('/').pop() ?? '';
}

describe('MockBiosApi', () => {
  beforeEach(() => {
    setup();
  });

  describe('cadastro e confirmação (UC01)', () => {
    it('cadastra, manda o link e confirma a conta pelo link', async () => {
      await expect(
        api.registerAccount({
          body: { name: 'Pessoa Nova', email: 'Nova@Example.com', password: 'senha1234' },
        }),
      ).resolves.toEqual({
        message:
          'Se o e-mail puder ser cadastrado, enviamos um link de confirmação. Verifique sua caixa de entrada.',
      });
      await expectError(
        api.login({ body: { email: 'nova@example.com', password: 'senha1234' } }),
        403,
        'ACCOUNT_NOT_CONFIRMED',
      );

      const token = linkToken('nova@example.com', 'confirmar-email');

      await expect(api.confirmEmail({ body: { token } })).resolves.toEqual({
        message: 'E-mail confirmado. Sua conta está ativa.',
      });
      await expect(
        api.login({ body: { email: 'nova@example.com', password: 'senha1234' } }),
      ).resolves.toMatchObject({
        user: { name: 'Pessoa Nova', role: 'USER' },
      });
      await expectError(api.confirmEmail({ body: { token } }), 400, 'USER_TOKEN_INVALID');
    });

    it('e-mail já cadastrado recebe a mesma resposta, sem e-mail (RF01 b)', async () => {
      const response = await api.registerAccount({
        body: { name: 'Outra', email: USER, password: 'senha1234' },
      });

      expect(response.message).toContain('Se o e-mail puder ser cadastrado');
      expect(mailbox.emails()).toEqual([]);
    });

    it('domínio da blacklist é recusado (RF22)', async () => {
      await expectError(
        api.registerAccount({
          body: { name: 'Teste', email: 'x@0-mail.com', password: 'senha1234' },
        }),
        422,
        'EMAIL_DOMAIN_NOT_ALLOWED',
      );
    });

    it('campos fora das regras dão 422 com os campos e as mensagens da API', async () => {
      const error = await expectError(
        api.registerAccount({ body: { name: 'A', email: 'nao-e-email', password: 'curta' } }),
        422,
        'VALIDATION_FAILED',
      );

      expect(error.details).toEqual([
        { path: 'name', message: 'O nome deve ter ao menos 2 caracteres.' },
        { path: 'email', message: 'Informe um e-mail válido.' },
        { path: 'password', message: 'A senha deve ter ao menos 8 caracteres.' },
        { path: 'password', message: 'A senha deve conter ao menos um número.' },
      ]);
    });

    it('link vazio é 422; reenvio manda novo link só para conta pendente', async () => {
      await expectError(api.confirmEmail({ body: { token: ' ' } }), 422, 'VALIDATION_FAILED');
      await api.registerAccount({
        body: { name: 'Pendente', email: 'p@example.com', password: 'senha1234' },
      });
      await api.resendEmailConfirmation({ body: { email: 'p@example.com' } });
      await api.resendEmailConfirmation({ body: { email: USER } });
      await api.resendEmailConfirmation({ body: { email: 'ninguem@example.com' } });

      expect(mailbox.emails().map((email) => email.to)).toEqual(['p@example.com', 'p@example.com']);
    });
  });

  describe('sessão (UC02, UC03, UC17)', () => {
    it('login abre a sessão com o papel da conta', async () => {
      await expect(signIn()).resolves.toMatchObject({
        token_type: 'Bearer',
        expires_in: 900,
        user: { id: '6ae498260f3f8176322d018e', name: 'Conta de Demonstração', role: 'USER' },
      });
      await expect(signIn(ADMIN)).resolves.toMatchObject({ user: { role: 'ADMIN' } });
    });

    it('senha errada é 401 com a mesma mensagem de e-mail inexistente', async () => {
      const wrong = await expectError(
        api.login({ body: { email: USER, password: 'errada123' } }),
        401,
        'INVALID_CREDENTIALS',
      );
      const unknown = await expectError(
        api.login({ body: { email: 'ninguem@example.com', password: 'errada123' } }),
        401,
        'INVALID_CREDENTIALS',
      );

      expect(wrong.message).toBe(unknown.message);
    });

    it('corpo fora das regras é 422', async () => {
      const error = await expectError(
        api.login({ body: { email: 'x', password: '' } }),
        422,
        'VALIDATION_FAILED',
      );

      expect(error.details).toEqual([
        { path: 'email', message: 'Informe um e-mail válido.' },
        { path: 'password', message: 'Informe a senha.' },
      ]);
    });

    it('cinco senhas erradas bloqueiam a conta por 15 minutos (RF20)', async () => {
      for (let i = 0; i < 5; i += 1) {
        await expectError(
          api.login({ body: { email: USER, password: 'errada123' } }),
          401,
          'INVALID_CREDENTIALS',
        );
      }
      const blocked = await expectError(
        api.login({ body: { email: USER, password: PASSWORD } }),
        429,
        'ACCESS_TEMPORARILY_BLOCKED',
      );

      expect(blocked.details).toEqual({ retry_after_seconds: 900 });
      clock += 15 * 60 * 1000;
      await expect(signIn()).resolves.toMatchObject({ user: { role: 'USER' } });
    });

    it('operação privada sem sessão, ou com o token vencido, é 401', async () => {
      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
      await signIn();
      clock += 900 * 1000;
      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
    });

    it('renovação troca o par de tokens; reusar o refresh antigo encerra todas as sessões', async () => {
      const first = await signIn();
      const renewed = await api.refreshSession({ body: { refresh_token: first.refresh_token } });

      expect(renewed.access_token).not.toBe(first.access_token);
      credentials.setAccessToken(renewed.access_token);
      await expect(api.getOwnAccount()).resolves.toMatchObject({ email: USER });

      await expectError(
        api.refreshSession({ body: { refresh_token: first.refresh_token } }),
        401,
        'SESSION_INVALID',
      );
      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
      await expectError(
        api.refreshSession({ body: { refresh_token: 'desconhecido' } }),
        401,
        'SESSION_INVALID',
      );
    });

    it('sair encerra esta sessão; sair de todos encerra as outras', async () => {
      const other = await signIn();

      await signIn();
      await api.logout();
      await expectError(api.logout(), 401, 'NOT_AUTHENTICATED');

      credentials.setAccessToken(other.access_token);
      await expect(api.getOwnAccount()).resolves.toMatchObject({ email: USER });
      await api.logoutAllDevices();
      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
    });
  });

  describe('senha (UC04)', () => {
    beforeEach(async () => {
      await signIn();
    });

    it('troca a senha e encerra as sessões', async () => {
      await api.changePassword({
        body: { current_password: PASSWORD, new_password: 'novaSenha99' },
      });

      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
      await expect(signIn(USER, 'novaSenha99')).resolves.toBeDefined();
    });

    it('recusa senha atual errada, senha igual e senha fora da política', async () => {
      await expectError(
        api.changePassword({
          body: { current_password: 'errada123', new_password: 'novaSenha99' },
        }),
        422,
        'INVALID_CURRENT_PASSWORD',
      );
      await expectError(
        api.changePassword({ body: { current_password: PASSWORD, new_password: PASSWORD } }),
        422,
        'PASSWORD_UNCHANGED',
      );
      await expectError(
        api.changePassword({ body: { current_password: PASSWORD, new_password: 'curta' } }),
        422,
        'VALIDATION_FAILED',
      );
    });

    it('redefine pelo link; senha fora da política não gasta o link (UC04, regra 6)', async () => {
      await api.forgotPassword({ body: { email: USER } });
      await api.forgotPassword({ body: { email: 'ninguem@example.com' } });
      const token = linkToken(USER, 'redefinir-senha');

      expect(mailbox.emails()).toHaveLength(1);
      await expectError(
        api.resetPassword({ body: { token, new_password: 'curta' } }),
        422,
        'VALIDATION_FAILED',
      );
      await api.resetPassword({ body: { token, new_password: 'redefinida1' } });
      await expectError(
        api.resetPassword({ body: { token, new_password: 'redefinida1' } }),
        400,
        'USER_TOKEN_INVALID',
      );
      await expect(signIn(USER, 'redefinida1')).resolves.toBeDefined();
    });
  });

  describe('conta (UC05)', () => {
    beforeEach(async () => {
      await signIn();
    });

    it('consulta e edita nome e endereço; null remove o endereço', async () => {
      await expect(api.getOwnAccount()).resolves.toMatchObject({
        name: 'Conta de Demonstração',
        address: { city: 'São Paulo', state: 'SP' },
      });
      await expect(
        api.updateOwnAccount({
          body: {
            name: 'Nome Novo',
            address: {
              postal_code: '20040-020',
              street: 'Avenida Rio Branco',
              number: '1',
              neighborhood: 'Centro',
              city: 'Rio de Janeiro',
              state: 'RJ',
            },
          },
        }),
      ).resolves.toMatchObject({ name: 'Nome Novo', address: { postal_code: '20040020' } });
      await expect(api.updateOwnAccount({ body: { address: null } })).resolves.toMatchObject({
        address: null,
      });
    });

    it('CEP e UF inválidos dão 422 nos campos do endereço', async () => {
      const error = await expectError(
        api.updateOwnAccount({
          body: {
            address: {
              postal_code: '123',
              street: 'Rua',
              number: '1',
              neighborhood: 'Bairro',
              city: 'Cidade',
              state: 'XX' as 'SP',
            },
          },
        }),
        422,
        'VALIDATION_FAILED',
      );

      expect((error.details as { path: string }[]).map((detail) => detail.path)).toEqual([
        'address.postal_code',
        'address.state',
      ]);
    });

    it('troca o e-mail pelo link do novo endereço; outro pedido invalida o link anterior', async () => {
      const body = { new_email: 'novo@example.com', current_password: PASSWORD };

      await api.requestEmailChange({ body });
      const first = linkToken('novo@example.com', 'confirmar-novo-email');

      await api.requestEmailChange({ body });
      await expectError(
        api.confirmEmailChange({ body: { token: first } }),
        400,
        'USER_TOKEN_INVALID',
      );
      await api.confirmEmailChange({
        body: { token: linkToken('novo@example.com', 'confirmar-novo-email') },
      });

      await expect(api.getOwnAccount()).resolves.toMatchObject({ email: 'novo@example.com' });
    });

    it('recusa senha errada, mesmo e-mail e domínio bloqueado; e-mail de outra conta não dá pista', async () => {
      await expectError(
        api.requestEmailChange({
          body: { new_email: 'novo@example.com', current_password: 'errada123' },
        }),
        422,
        'INVALID_CURRENT_PASSWORD',
      );
      await expectError(
        api.requestEmailChange({ body: { new_email: USER, current_password: PASSWORD } }),
        422,
        'EMAIL_UNCHANGED',
      );
      await expectError(
        api.requestEmailChange({ body: { new_email: 'x@0-mail.com', current_password: PASSWORD } }),
        422,
        'EMAIL_DOMAIN_NOT_ALLOWED',
      );
      const sameAsSuccess = await api.requestEmailChange({
        body: { new_email: ADMIN, current_password: PASSWORD },
      });

      expect(sameAsSuccess.message).toContain('Se o e-mail puder ser usado');
      expect(mailbox.emails()).toEqual([]);
      await expectError(
        api.requestEmailChange({ body: { new_email: 'x', current_password: PASSWORD } }),
        422,
        'VALIDATION_FAILED',
      );
    });

    it('409 quando o novo endereço passa a ser de outra conta antes da confirmação', async () => {
      await api.requestEmailChange({
        body: { new_email: 'disputa@example.com', current_password: PASSWORD },
      });
      const token = linkToken('disputa@example.com', 'confirmar-novo-email');

      await api.registerAccount({
        body: { name: 'Concorrente', email: 'disputa@example.com', password: 'senha1234' },
      });
      await expectError(api.confirmEmailChange({ body: { token } }), 409, 'EMAIL_ALREADY_IN_USE');
    });

    it('exclui a conta com a senha; senha errada mantém a conta', async () => {
      await expectError(
        api.deleteOwnAccount({ body: { password: 'errada123' } }),
        422,
        'INVALID_CURRENT_PASSWORD',
      );
      await api.deleteOwnAccount({ body: { password: PASSWORD } });

      await expectError(api.getOwnAccount(), 401, 'NOT_AUTHENTICATED');
      await expectError(
        api.login({ body: { email: USER, password: PASSWORD } }),
        401,
        'INVALID_CREDENTIALS',
      );
    });
  });

  describe('chaves de API (UC11)', () => {
    beforeEach(async () => {
      await signIn();
    });

    it('cria (o segredo só nesta resposta), lista da mais nova para a mais antiga e revoga', async () => {
      // A chave semeada é de 30/10/2026 às 13:14; a nova é criada depois dela.
      clock = Date.parse('2026-11-01T12:00:00Z');
      credentials.setAccessToken((await signIn()).access_token);

      const created = await api.createApiKey({ body: { name: ' Integração ' } });

      expect(created).toMatchObject({ name: 'Integração', last_used_at: null });
      expect(created.key.startsWith(`${created.prefix}_`)).toBe(true);

      const listed = await api.listApiKeys();

      expect(listed.data.map((key) => key.name)).toEqual([
        'Integração',
        'Planilha de fornecedores',
      ]);
      expect(listed.data[0]).not.toHaveProperty('key');

      await api.revokeApiKey({ path: { id: created.id } });
      await expect(api.listApiKeys()).resolves.toMatchObject({
        data: [{ name: 'Planilha de fornecedores' }],
      });
      await expectError(api.revokeApiKey({ path: { id: created.id } }), 404, 'API_KEY_NOT_FOUND');
    });

    it('nome curto é 422', async () => {
      await expectError(api.createApiKey({ body: { name: 'a' } }), 422, 'VALIDATION_FAILED');
    });
  });

  describe('blacklist de domínios (UC13)', () => {
    it('USER não acessa: 403 INSUFFICIENT_ROLE', async () => {
      await signIn();
      await expectError(api.listBlockedEmailDomains(), 403, 'INSUFFICIENT_ROLE');
      await expectError(
        api.addBlockedEmailDomain({ body: { domain: 'x.com' } }),
        403,
        'INSUFFICIENT_ROLE',
      );
    });

    it('ADMIN lista paginado, inclui, recusa duplicado e inválido, e remove', async () => {
      await signIn(ADMIN);
      await expect(
        api.listBlockedEmailDomains({ query: { page: 2, page_size: 5 } }),
      ).resolves.toMatchObject({
        pagination: { page: 2, page_size: 5, total: 20, total_pages: 4 },
      });

      const added = await api.addBlockedEmailDomain({ body: { domain: ' Descartavel.Example ' } });

      expect(added).toMatchObject({ domain: 'descartavel.example', origin: 'ADMIN' });
      await expectError(
        api.addBlockedEmailDomain({ body: { domain: 'descartavel.example' } }),
        409,
        'BLOCKED_EMAIL_DOMAIN_ALREADY_EXISTS',
      );
      await expectError(
        api.addBlockedEmailDomain({ body: { domain: 'não é domínio' } }),
        422,
        'VALIDATION_FAILED',
      );
      await api.removeBlockedEmailDomain({ path: { id: added.id } });
      await expectError(
        api.removeBlockedEmailDomain({ path: { id: added.id } }),
        404,
        'BLOCKED_EMAIL_DOMAIN_NOT_FOUND',
      );
    });

    it('o domínio incluído passa a barrar o cadastro', async () => {
      await signIn(ADMIN);
      await api.addBlockedEmailDomain({ body: { domain: 'novo-bloqueio.example' } });
      await expectError(
        api.registerAccount({
          body: { name: 'Teste', email: 'a@novo-bloqueio.example', password: 'senha1234' },
        }),
        422,
        'EMAIL_DOMAIN_NOT_ALLOWED',
      );
    });
  });

  describe('empresas (UC06 a UC09)', () => {
    beforeEach(async () => {
      await signIn();
    });

    it('perfil capturado; CNPJ inválido e fora da base', async () => {
      await expect(
        api.getCompanyProfile({ path: { cnpj: '60894730000105' } }),
      ).resolves.toMatchObject({
        legal_name: 'USINAS SIDERURGICAS DE MINAS GERAIS S/A. USIMINAS',
      });
      await expectError(
        api.getCompanyProfile({ path: { cnpj: '12345678000100' } }),
        422,
        'INVALID_CNPJ',
      );
      await expectError(
        api.getCompanyProfile({ path: { cnpj: '12ABC34501DE35' } }),
        404,
        'COMPANY_NOT_FOUND',
      );
    });

    it('explicação do índice capturada; ODS não calculado e CNPJ fora da base', async () => {
      await expect(
        api.getScoreExplanation({ path: { cnpj: '60894730000105', odsNumber: 15 } }),
      ).resolves.toMatchObject({ ods_number: 15, index_status: 'AVAILABLE' });
      await expectError(
        api.getScoreExplanation({ path: { cnpj: '60894730000105', odsNumber: 7 } }),
        404,
        'SCORE_NOT_FOUND',
      );
      await expectError(
        api.getScoreExplanation({ path: { cnpj: '123', odsNumber: 13 } }),
        422,
        'INVALID_CNPJ',
      );
      await expectError(
        api.getScoreExplanation({ path: { cnpj: '12ABC34501DE35', odsNumber: 13 } }),
        404,
        'COMPANY_NOT_FOUND',
      );
    });

    it('pesquisa: capturada, refeita e com os erros da API', async () => {
      await expect(api.searchCompanies({ query: { name: 'gerdau' } })).resolves.toMatchObject({
        pagination: { total: 2 },
      });
      await expect(
        api.searchCompanies({ query: { uf: 'RJ', ods: 15, order: 'asc' } }),
      ).resolves.toMatchObject({
        data: [{ uf: 'RJ' }, { uf: 'RJ' }],
        pagination: { total: 2 },
      });
      await expectError(api.searchCompanies(), 422, 'VALIDATION_FAILED');
      await expectError(api.searchCompanies({ query: { name: 'ab' } }), 422, 'VALIDATION_FAILED');
      await expectError(
        api.searchCompanies({ query: { cnae: '24', ods: 7 } }),
        422,
        'ODS_NOT_AVAILABLE',
      );
    });

    it('exportação: a planilha real capturada', async () => {
      const blob = await api.exportCompaniesXlsx({ query: { cnae: '24', ods: 13, order: 'desc' } });

      expect(blob).toBeInstanceOf(Blob);
      expect(files.load).toHaveBeenCalledWith(
        'exportCompaniesXlsx',
        'setor-ods-13-desc.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('exportação: sem resultado, critério inválido e pesquisa não capturada', async () => {
      await expectError(
        api.exportCompaniesXlsx({ query: { name: 'nada parecido' } }),
        404,
        'NO_RESULTS_TO_EXPORT',
      );
      await expectError(api.exportCompaniesXlsx(), 422, 'VALIDATION_FAILED');

      const error = await expectError(
        api.exportCompaniesXlsx({ query: { uf: 'MG' } }),
        422,
        'NOT_AVAILABLE_IN_PRESENTATION',
      );

      expect(error.body.path).toBe('/companies/export/xlsx?uf=MG');
    });

    it('ODS e setores', async () => {
      await expect(api.listOds()).resolves.toMatchObject({
        data: [{ ods_number: 13 }, { ods_number: 15 }],
      });
      expect((await api.listSectors()).data).toContainEqual({
        cnae_division: '24',
        description: 'METALURGIA',
      });
      await expect(
        api.getSectorEvolution({ path: { cnae: '24' }, query: { ods: 13 } }),
      ).resolves.toMatchObject({
        cnae_division: '24',
        ods_number: 13,
      });
    });
  });

  it('exportação acima do teto configurado: 422 com o total e o máximo', async () => {
    TestBed.resetTestingModule();
    setup({ exportMaxCompanies: 1 });
    await signIn();

    const error = await expectError(
      api.exportCompaniesXlsx({ query: { uf: 'MG' } }),
      422,
      'EXPORT_TOO_LARGE',
    );

    expect(error.details).toEqual({ total: 4, max: 1 });
    expect(error.message).toBe(
      'A pesquisa tem 4 empresas e uma exportação aceita até 1. Refine os critérios.',
    );
  });

  describe('configuração (determinismo)', () => {
    it('cenário forçado: a operação falha sempre com a resposta capturada', async () => {
      TestBed.resetTestingModule();
      setup({ forcedErrors: { exportCompaniesXlsx: 'exportCompaniesXlsx/limite-excedido' } });
      await signIn();

      for (let i = 0; i < 2; i += 1) {
        await expectError(
          api.exportCompaniesXlsx({ query: { name: 'gerdau' } }),
          429,
          'RATE_LIMIT_EXCEEDED',
        );
      }
    });

    it('a mesma chamada, com a mesma configuração, dá a mesma resposta', async () => {
      await signIn();

      const first = await api.searchCompanies({ query: { cnae: '24', ods: 15, order: 'desc' } });
      const second = await api.searchCompanies({ query: { cnae: '24', ods: 15, order: 'desc' } });

      expect(second).toEqual(first);
      expect(second).not.toBe(first);
    });

    it('a latência simulada atrasa a resposta', async () => {
      TestBed.resetTestingModule();
      setup({ latencyMs: 30 });
      await api.listOds().catch(() => undefined);

      const started = performance.now();

      await expectError(api.listOds(), 401, 'NOT_AUTHENTICATED');
      expect(performance.now() - started).toBeGreaterThanOrEqual(25);
    });
  });
});
