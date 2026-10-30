import { inject, Injectable } from '@angular/core';
import { ApiCredentials } from '../api/api-credentials';
import type { ApiError } from '../api/api-error';
import { BiosApi, type ApiInput, type BiosOperation } from '../api/bios-api';
import type * as Api from '../api/generated';
import type { CaptureKey } from './fixtures';
import { MOCK_API_CONFIG } from './mock-config';
import type * as MockData from './mock-data';
import { MockFiles } from './mock-files';
import { MockMailbox, type MockEmail } from './mock-mailbox';

interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  address: Api.Address | null;
  role: 'USER' | 'ADMIN';
  confirmed: boolean;
  failedLogins: number;
  blockedUntil: number | null;
}

interface LinkToken {
  token: string;
  kind: MockEmail['kind'];
  accountId: string;
  newEmail?: string;
  used: boolean;
}

interface Session {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  previousRefreshTokens: string[];
  revoked: boolean;
}

interface ApiKey extends Api.ApiKeyResponse {
  accountId: string;
  revoked: boolean;
}

interface Detail {
  path: string;
  message: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];
const BLOCK_AFTER_FAILURES = 5;
const BLOCK_SECONDS = 15 * 60;
const EXPORT_NOT_CAPTURED =
  'A exportação desta pesquisa não está disponível na versão de apresentação: as planilhas são ' +
  'as reais da API, capturadas para as pesquisas de demonstração.';

/**
 * Implementação mockada do contrato (#14), usada na versão de apresentação.
 *
 * O que é leitura vem das respostas reais capturadas da API; o que o usuário altera na demo
 * (contas, sessões, links de e-mail, chaves, blacklist) vive em memória e recomeça ao recarregar.
 * Erros usam o texto e o código que a API real devolveu. Sem sorteio: latência e cenários de
 * falha vêm de `MOCK_API_CONFIG`.
 *
 * As capturas são carregadas na primeira chamada (`mock-data`, chunk separado do bundle inicial).
 */
@Injectable()
export class MockBiosApi extends BiosApi {
  private readonly config = inject(MOCK_API_CONFIG);
  private readonly credentials = inject(ApiCredentials);
  private readonly mailbox = inject(MockMailbox);
  private readonly files = inject(MockFiles);

  private data?: typeof MockData;
  private sequence = 0;
  private readonly accounts: Account[] = [];
  private readonly linkTokens: LinkToken[] = [];
  private readonly sessions: Session[] = [];
  private readonly apiKeys: ApiKey[] = [];
  private readonly domains: Api.BlockedEmailDomain[] = [];

  /** Os dados capturados; só existem depois da primeira chamada (`run` os carrega). */
  private get d(): typeof MockData {
    return this.data!;
  }

  /** Carrega as capturas e monta o estado inicial da demonstração, uma vez. */
  private async load(): Promise<void> {
    if (this.data) return;
    this.data = await import('./mock-data');

    const address = this.d.capturedBody<Api.AccountResponse>('updateOwnAccount/endereco').address;
    const [seedKey] = this.d.capturedBody<Api.ApiKeyListResponse>(
      'listApiKeys/apos-revogacao',
    ).data;

    for (const account of this.config.demoAccounts) {
      this.accounts.push({
        ...account,
        email: account.email.toLowerCase(),
        password: this.config.demoPassword,
        address: account.role === 'USER' ? address : null,
        confirmed: true,
        failedLogins: 0,
        blockedUntil: null,
      });
    }
    const user = this.accounts.find((account) => account.role === 'USER');

    if (seedKey && user) this.apiKeys.push({ ...seedKey, accountId: user.id, revoked: false });
    this.domains.push(
      ...this.d.capturedBody<Api.BlockedEmailDomainList>('listBlockedEmailDomains/primeira-pagina')
        .data,
    );
  }

  // ------------------------------------------------------------------------------------------
  // Cadastro e confirmação (UC01)
  // ------------------------------------------------------------------------------------------

  registerAccount({ body }: ApiInput<Api.RegisterAccountData>) {
    return this.run('registerAccount', () => {
      const path = '/accounts';
      const email = body.email.trim().toLowerCase();
      const details = [
        ...this.nameDetails(body.name, 'name'),
        ...this.emailDetails(email, 'email'),
        ...this.passwordDetails(body.password, 'password'),
      ];

      if (details.length)
        throw this.d.validationError('registerAccount/validacao', path, this.now(), details);
      if (this.isBlocked(email)) throw this.error('registerAccount/dominio-bloqueado', path);

      // E-mail já cadastrado: a mesma resposta do sucesso, sem enviar nada (RF01 b).
      if (!this.accountByEmail(email)) {
        const account: Account = {
          id: this.id(),
          name: body.name.trim(),
          email,
          password: body.password,
          address: null,
          role: 'USER',
          confirmed: false,
          failedLogins: 0,
          blockedUntil: null,
        };

        this.accounts.push(account);
        this.sendLink(account, 'confirmar-email', email);
      }

      return this.d.capturedBody<Api.RegisterAccountResponse>('registerAccount/sucesso');
    });
  }

  confirmEmail({ body }: ApiInput<Api.ConfirmEmailData>) {
    return this.run('confirmEmail', () => {
      const path = '/accounts/confirm-email';
      const link = this.useLink(body.token, 'confirmar-email', path, 'confirmEmail');
      const account = this.accountById(link.accountId);

      if (account) account.confirmed = true;

      return this.d.capturedBody<Api.ConfirmEmailResponse>('confirmEmail/sucesso');
    });
  }

  resendEmailConfirmation({ body }: ApiInput<Api.ResendEmailConfirmationData>) {
    return this.run('resendEmailConfirmation', () => {
      const account = this.accountByEmail(body.email);

      // Mesma resposta exista ou não a conta (UC01, 6.1).
      if (account && !account.confirmed) this.sendLink(account, 'confirmar-email', account.email);

      return this.d.capturedBody<Api.ResendEmailConfirmationResponse>(
        'resendEmailConfirmation/sucesso',
      );
    });
  }

  // ------------------------------------------------------------------------------------------
  // Sessão (UC02, UC03, UC17)
  // ------------------------------------------------------------------------------------------

  login({ body }: ApiInput<Api.LoginData>) {
    return this.run('login', () => {
      const path = '/auth/login';
      const email = body.email.trim().toLowerCase();
      const details: Detail[] = [
        ...(EMAIL.test(email) ? [] : [this.field('login/validacao', 'email')]),
        ...(body.password ? [] : [this.field('login/validacao', 'password')]),
      ];

      if (details.length)
        throw this.d.validationError('login/validacao', path, this.now(), details);

      const account = this.accountByEmail(email);

      if (account?.blockedUntil && account.blockedUntil > this.now()) {
        throw this.error('login/acesso-bloqueado', path, {
          details: { retry_after_seconds: Math.ceil((account.blockedUntil - this.now()) / 1000) },
        });
      }
      if (account?.password !== body.password) {
        if (account) this.countFailure(account);
        throw this.error('login/credenciais-invalidas', path);
      }
      if (!account.confirmed) throw this.error('login/conta-nao-confirmada', path);

      account.failedLogins = 0;
      account.blockedUntil = null;

      return this.openSession(account);
    });
  }

  refreshSession({ body }: ApiInput<Api.RefreshSessionData>) {
    return this.run('refreshSession', () => {
      const path = '/auth/refresh';
      const session = this.sessions.find(
        (item) => !item.revoked && item.refreshToken === body.refresh_token,
      );

      if (!session) {
        // Reuso de um refresh token já trocado: encerra todas as sessões da conta (UC17, 4.1).
        const reused = this.sessions.find((item) =>
          item.previousRefreshTokens.includes(body.refresh_token),
        );

        if (reused) this.revokeAll(reused.accountId);
        throw this.error('refreshSession/token-invalido', path);
      }

      const account = this.accountById(session.accountId)!;
      const renewed = this.issueTokens(account);

      session.previousRefreshTokens.push(session.refreshToken);
      session.accessToken = renewed.access_token;
      session.refreshToken = renewed.refresh_token;
      session.accessExpiresAt = this.now() + this.config.accessTokenTtlSeconds * 1000;

      return renewed;
    });
  }

  logout() {
    return this.run('logout', () => {
      this.authenticated('/auth/logout').session.revoked = true;
    });
  }

  logoutAllDevices() {
    return this.run('logoutAllDevices', () => {
      this.revokeAll(this.authenticated('/auth/logout-all').account.id);
    });
  }

  // ------------------------------------------------------------------------------------------
  // Senha (UC04)
  // ------------------------------------------------------------------------------------------

  changePassword({ body }: ApiInput<Api.ChangePasswordData>) {
    return this.run('changePassword', () => {
      const path = '/auth/change-password';
      const { account } = this.authenticated(path);
      const details = this.passwordDetails(body.new_password, 'new_password');

      if (details.length)
        throw this.d.validationError('changePassword/validacao', path, this.now(), details);
      if (body.current_password !== account.password) {
        throw this.error('changePassword/senha-atual-incorreta', path);
      }
      if (body.new_password === account.password)
        throw this.error('changePassword/senha-igual', path);

      account.password = body.new_password;
      this.revokeAll(account.id);
    });
  }

  forgotPassword({ body }: ApiInput<Api.ForgotPasswordData>) {
    return this.run('forgotPassword', () => {
      const account = this.accountByEmail(body.email);

      // Mesma mensagem exista ou não a conta (RF25 b).
      if (account?.confirmed) this.sendLink(account, 'redefinir-senha', account.email);

      return this.d.capturedBody<Api.ForgotPasswordResponse>('forgotPassword/sucesso');
    });
  }

  resetPassword({ body }: ApiInput<Api.ResetPasswordData>) {
    return this.run('resetPassword', () => {
      const path = '/auth/reset-password';
      const details = this.passwordDetails(body.new_password, 'new_password');

      // Senha nova inválida não gasta o link (UC04, regra 6).
      if (details.length) {
        throw this.d.validationError(
          'resetPassword/senha-fora-da-politica',
          path,
          this.now(),
          details,
        );
      }

      const link = this.useLink(body.token, 'redefinir-senha', path, 'resetPassword');
      const account = this.accountById(link.accountId);

      if (account) {
        account.password = body.new_password;
        this.revokeAll(account.id);
      }
    });
  }

  // ------------------------------------------------------------------------------------------
  // Conta (UC05)
  // ------------------------------------------------------------------------------------------

  getOwnAccount() {
    return this.run('getOwnAccount', () => this.view(this.authenticated('/accounts/me').account));
  }

  updateOwnAccount({ body }: ApiInput<Api.UpdateOwnAccountData>) {
    return this.run('updateOwnAccount', () => {
      const path = '/accounts/me';
      const { account } = this.authenticated(path);
      const address = body.address;
      const details = [
        ...(body.name === undefined ? [] : this.nameDetails(body.name, 'name')),
        ...(address && !/^\d{5}-?\d{3}$/.test(address.postal_code)
          ? [this.field('updateOwnAccount/validacao', 'address.postal_code')]
          : []),
        ...(address && !STATES.includes(address.state)
          ? [this.field('updateOwnAccount/validacao', 'address.state')]
          : []),
      ];

      if (details.length)
        throw this.d.validationError('updateOwnAccount/validacao', path, this.now(), details);
      if (body.name !== undefined) account.name = body.name.trim();
      if (address !== undefined) {
        account.address = address && {
          ...address,
          postal_code: address.postal_code.replace('-', ''),
        };
      }

      return this.view(account);
    });
  }

  requestEmailChange({ body }: ApiInput<Api.RequestEmailChangeData>) {
    return this.run('requestEmailChange', () => {
      const path = '/accounts/me/email-change';
      const { account } = this.authenticated(path);
      const email = body.new_email.trim().toLowerCase();
      const details = this.emailDetails(email, 'new_email');

      if (details.length)
        throw this.d.validationError('registerAccount/validacao', path, this.now(), details);
      if (body.current_password !== account.password) {
        throw this.error('requestEmailChange/senha-incorreta', path);
      }
      if (email === account.email) throw this.error('requestEmailChange/mesmo-email', path);
      if (this.isBlocked(email)) throw this.error('requestEmailChange/dominio-bloqueado', path);

      // E-mail de outra conta: a mesma resposta, sem enviar nada (UC05, regra 5).
      if (!this.accountByEmail(email)) {
        // Pedir outra troca invalida o link anterior (UC05, regra 4).
        this.linkTokens
          .filter((link) => link.accountId === account.id && link.kind === 'confirmar-novo-email')
          .forEach((link) => (link.used = true));
        this.sendLink(account, 'confirmar-novo-email', email);
      }

      return this.d.capturedBody<Api.RequestEmailChangeResponse>('requestEmailChange/sucesso');
    });
  }

  confirmEmailChange({ body }: ApiInput<Api.ConfirmEmailChangeData>) {
    return this.run('confirmEmailChange', () => {
      const path = '/accounts/confirm-email-change';
      const link = this.useLink(body.token, 'confirmar-novo-email', path, 'confirmEmailChange');
      const account = this.accountById(link.accountId);
      const email = link.newEmail!;

      if (!account) throw this.error('confirmEmailChange/token-invalido', path);
      if (this.accountByEmail(email)) throw this.error('confirmEmailChange/email-ja-em-uso', path);

      account.email = email;

      return this.d.capturedBody<Api.ConfirmEmailChangeResponse>('confirmEmailChange/sucesso');
    });
  }

  deleteOwnAccount({ body }: ApiInput<Api.DeleteOwnAccountData>) {
    return this.run('deleteOwnAccount', () => {
      const path = '/accounts/me';
      const { account } = this.authenticated(path);

      if (body.password !== account.password)
        throw this.error('deleteOwnAccount/senha-incorreta', path);

      // Remove a conta e tudo o que é do titular, sem remoção lógica (UC05, regra 6).
      this.revokeAll(account.id);
      this.accounts.splice(this.accounts.indexOf(account), 1);
      this.apiKeys
        .filter((key) => key.accountId === account.id)
        .forEach((key) => this.apiKeys.splice(this.apiKeys.indexOf(key), 1));
    });
  }

  // ------------------------------------------------------------------------------------------
  // Chaves de API (UC11)
  // ------------------------------------------------------------------------------------------

  createApiKey({ body }: ApiInput<Api.CreateApiKeyData>) {
    return this.run('createApiKey', () => {
      const path = '/api-keys';
      const { account } = this.authenticated(path);
      const name = body.name.trim();

      if (name.length < 2) {
        throw this.d.validationError('createApiKey/validacao', path, this.now(), [
          this.field('createApiKey/validacao', 'name'),
        ]);
      }

      const sequence = this.next();
      const key: ApiKey = {
        id: this.id(sequence),
        name,
        prefix: `bios_D${String(sequence).padStart(7, '0')}`,
        created_at: this.isoNow(),
        last_used_at: null,
        accountId: account.id,
        revoked: false,
      };

      this.apiKeys.push(key);

      return { ...this.keyView(key), key: `${key.prefix}_segredo-de-demonstracao-${sequence}` };
    });
  }

  listApiKeys() {
    return this.run('listApiKeys', () => {
      const { account } = this.authenticated('/api-keys');

      return {
        data: this.apiKeys
          .filter((key) => key.accountId === account.id && !key.revoked)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((key) => this.keyView(key)),
      };
    });
  }

  revokeApiKey({ path: params }: ApiInput<Api.RevokeApiKeyData>) {
    return this.run('revokeApiKey', () => {
      const path = `/api-keys/${params.id}`;
      const { account } = this.authenticated(path);
      const key = this.apiKeys.find(
        (item) => item.id === params.id && item.accountId === account.id && !item.revoked,
      );

      if (!key) throw this.error('revokeApiKey/nao-encontrada', path);
      key.revoked = true;
    });
  }

  // ------------------------------------------------------------------------------------------
  // Blacklist de domínios (UC13)
  // ------------------------------------------------------------------------------------------

  listBlockedEmailDomains(input?: ApiInput<Api.ListBlockedEmailDomainsData>) {
    return this.run('listBlockedEmailDomains', () => {
      this.administrator('/admin/blocked-email-domains');

      const page = input?.query?.page ?? 1;
      const pageSize = input?.query?.page_size ?? 20;
      const sorted = [...this.domains].sort((a, b) => a.domain.localeCompare(b.domain));

      return {
        data: sorted.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
          page,
          page_size: pageSize,
          total: sorted.length,
          total_pages: Math.ceil(sorted.length / pageSize),
        },
      };
    });
  }

  addBlockedEmailDomain({ body }: ApiInput<Api.AddBlockedEmailDomainData>) {
    return this.run('addBlockedEmailDomain', () => {
      const path = '/admin/blocked-email-domains';
      this.administrator(path);
      const domain = body.domain.trim().toLowerCase();

      if (!DOMAIN.test(domain)) {
        throw this.d.validationError('addBlockedEmailDomain/validacao', path, this.now(), [
          this.field('addBlockedEmailDomain/validacao', 'domain'),
        ]);
      }
      if (this.domains.some((item) => item.domain === domain)) {
        throw this.error('addBlockedEmailDomain/duplicado', path);
      }

      const created: Api.BlockedEmailDomain = {
        id: this.id(),
        domain,
        origin: 'ADMIN',
        created_at: this.isoNow(),
      };

      this.domains.push(created);

      return created;
    });
  }

  removeBlockedEmailDomain({ path: params }: ApiInput<Api.RemoveBlockedEmailDomainData>) {
    return this.run('removeBlockedEmailDomain', () => {
      const path = `/admin/blocked-email-domains/${params.id}`;
      this.administrator(path);
      const index = this.domains.findIndex((item) => item.id === params.id);

      if (index < 0) throw this.error('removeBlockedEmailDomain/nao-encontrado', path);
      this.domains.splice(index, 1);
    });
  }

  // ------------------------------------------------------------------------------------------
  // Empresas (UC06 a UC09)
  // ------------------------------------------------------------------------------------------

  getCompanyProfile({ path: params }: ApiInput<Api.GetCompanyProfileData>) {
    return this.run('getCompanyProfile', () => {
      this.authenticated(`/companies/${params.cnpj}`);

      return this.d.companyProfile(params.cnpj, this.now());
    });
  }

  getScoreExplanation({ path: params }: ApiInput<Api.GetScoreExplanationData>) {
    return this.run('getScoreExplanation', () => {
      const path = `/companies/${params.cnpj}/scores/${params.odsNumber}/explanation`;
      this.authenticated(path);
      const cnpj = this.d.normalizeCnpj(params.cnpj);

      if (!this.d.isValidCnpj(cnpj)) throw this.error('getCompanyProfile/cnpj-invalido', path);
      if (!this.d.activeOds().includes(Number(params.odsNumber))) {
        throw this.error('getScoreExplanation/ods-nao-calculado', path);
      }

      const found = this.d
        .capturesOf('getScoreExplanation')
        .find(
          (item) =>
            item.request.path === `/companies/${cnpj}/scores/${params.odsNumber}/explanation`,
        );

      if (!found) throw this.error('getCompanyProfile/nao-encontrada', path);
      if (found.status >= 400) {
        throw this.d.capturedError(
          `getScoreExplanation/${found.scenario}` as CaptureKey,
          path,
          this.now(),
        );
      }

      return JSON.parse(JSON.stringify(found.body)) as Api.ScoreExplanationResponse;
    });
  }

  searchCompanies(input?: ApiInput<Api.SearchCompaniesData>) {
    return this.run('searchCompanies', () => {
      const path = this.d.pathWithQuery('/companies', input?.query);
      this.authenticated(path);
      const error = this.d.searchCriteriaError(input?.query, path, this.now());

      if (error) throw error;

      return this.d.capturedSearch(input?.query) ?? this.d.searchProfiles(input?.query);
    });
  }

  exportCompaniesXlsx(input?: ApiInput<Api.ExportCompaniesXlsxData>) {
    return this.run('exportCompaniesXlsx', async () => {
      const path = this.d.pathWithQuery('/companies/export/xlsx', input?.query);
      this.authenticated(path);
      const error = this.d.searchCriteriaError(input?.query, path, this.now());

      if (error) throw error;

      const file = this.d.capturedExportFile(input?.query);

      if (file) return this.files.load('exportCompaniesXlsx', file.file, file.contentType);

      const { total } = this.d.searchProfiles({
        ...input?.query,
        page: 1,
        page_size: 1,
      }).pagination;
      const max = this.config.exportMaxCompanies;

      if (total === 0) throw this.error('exportCompaniesXlsx/sem-resultado', path);
      if (total > max) {
        throw this.error('exportCompaniesXlsx/acima-do-teto', path, {
          message: `A pesquisa tem ${total} empresas e uma exportação aceita até ${max}. Refine os critérios.`,
          details: { total, max },
        });
      }
      throw this.d.notInPresentation(path, this.now(), EXPORT_NOT_CAPTURED);
    });
  }

  // ------------------------------------------------------------------------------------------
  // ODS e setores (UC07, UC10)
  // ------------------------------------------------------------------------------------------

  listOds() {
    return this.run('listOds', () => {
      this.authenticated('/ods');

      return this.d.capturedBody<Api.ListOdsResponse>('listOds/sucesso');
    });
  }

  listSectors() {
    return this.run('listSectors', () => {
      this.authenticated('/sectors');

      return this.d.capturedBody<Api.ListSectorsResponse>('listSectors/sucesso');
    });
  }

  getSectorEvolution({ path: params, query }: ApiInput<Api.GetSectorEvolutionData>) {
    return this.run('getSectorEvolution', () => {
      this.authenticated(`/sectors/${params.cnae}/evolution?ods=${query.ods}`);

      return this.d.sectorEvolution(params.cnae, query.ods, this.now());
    });
  }

  // ------------------------------------------------------------------------------------------
  // Apoio
  // ------------------------------------------------------------------------------------------

  /** Espera simulada, cenário forçado e a operação em si, sempre assíncrona. */
  private async run<T>(operation: BiosOperation, handler: () => T | Promise<T>): Promise<T> {
    await this.load();
    if (this.config.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.latencyMs));
    }

    const forced = this.config.forcedErrors[operation];

    if (forced) throw this.d.capturedError(forced, `/${operation}`, this.now());

    return handler();
  }

  private now(): number {
    return this.config.now();
  }

  private isoNow(): string {
    return new Date(this.now()).toISOString();
  }

  private next(): number {
    this.sequence += 1;

    return this.sequence;
  }

  /** Identificador no formato dos da API (24 dígitos hexadecimais), determinístico. */
  private id(sequence = this.next()): string {
    return `6ae4ffff${sequence.toString(16).padStart(16, '0')}`;
  }

  private error(key: CaptureKey, path: string, patch?: Partial<Api.ErrorResponse>): ApiError {
    return this.d.capturedError(key, path, this.now(), patch);
  }

  private field(key: CaptureKey, field: string, index = 0): Detail {
    return { path: field, message: this.d.capturedFieldMessage(key, field, index) };
  }

  private nameDetails(name: string, path: string): Detail[] {
    return name.trim().length >= 2
      ? []
      : [{ path, message: this.d.capturedFieldMessage('registerAccount/validacao', 'name') }];
  }

  private emailDetails(email: string, path: string): Detail[] {
    return EMAIL.test(email)
      ? []
      : [{ path, message: this.d.capturedFieldMessage('registerAccount/validacao', 'email') }];
  }

  /** Política de senha (UC01, regra 4), com as mensagens que a API devolve. */
  private passwordDetails(password: string, path: string): Detail[] {
    return [
      ...(password.length >= 8
        ? []
        : [
            {
              path,
              message: this.d.capturedFieldMessage('registerAccount/validacao', 'password', 0),
            },
          ]),
      ...(/\d/.test(password)
        ? []
        : [
            {
              path,
              message: this.d.capturedFieldMessage('registerAccount/validacao', 'password', 1),
            },
          ]),
    ];
  }

  private isBlocked(email: string): boolean {
    const domain = email.split('@')[1] ?? '';

    return this.domains.some((item) => item.domain === domain);
  }

  private accountByEmail(email: string): Account | undefined {
    const normalized = email.trim().toLowerCase();

    return this.accounts.find((account) => account.email === normalized);
  }

  private accountById(id: string): Account | undefined {
    return this.accounts.find((account) => account.id === id);
  }

  private view(account: Account): Api.AccountResponse {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      address: account.address && { ...account.address },
      role: account.role,
    };
  }

  private keyView(key: ApiKey): Api.ApiKeyResponse {
    return {
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
    };
  }

  /** Conta e sessão do access token atual, ou o 401 que a API daria. */
  private authenticated(path: string): { account: Account; session: Session } {
    const token = this.credentials.accessToken();
    const session = this.sessions.find(
      (item) => !item.revoked && item.accessToken === token && item.accessExpiresAt > this.now(),
    );
    const account = session && this.accountById(session.accountId);

    if (!session || !account) throw this.error('getOwnAccount/sem-sessao', path);

    return { account, session };
  }

  private administrator(path: string): Account {
    const { account } = this.authenticated(path);

    if (account.role !== 'ADMIN') throw this.error('listBlockedEmailDomains/sem-permissao', path);

    return account;
  }

  private issueTokens(account: Account): Api.SessionResponse {
    const sequence = this.next();

    return {
      access_token: `mock-access-${sequence}`,
      refresh_token: `mock-refresh-${sequence}`,
      token_type: 'Bearer',
      expires_in: this.config.accessTokenTtlSeconds,
      user: { id: account.id, name: account.name, role: account.role },
    };
  }

  private openSession(account: Account): Api.SessionResponse {
    const tokens = this.issueTokens(account);

    this.sessions.push({
      accountId: account.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessExpiresAt: this.now() + this.config.accessTokenTtlSeconds * 1000,
      previousRefreshTokens: [],
      revoked: false,
    });

    return tokens;
  }

  private revokeAll(accountId: string): void {
    this.sessions
      .filter((session) => session.accountId === accountId)
      .forEach((session) => (session.revoked = true));
  }

  /** Cinco senhas erradas seguidas bloqueiam a conta por 15 minutos (RF20). */
  private countFailure(account: Account): void {
    account.failedLogins += 1;
    if (account.failedLogins >= BLOCK_AFTER_FAILURES) {
      account.failedLogins = 0;
      account.blockedUntil = this.now() + BLOCK_SECONDS * 1000;
    }
  }

  private sendLink(account: Account, kind: MockEmail['kind'], to: string): void {
    const token = `mock-link-${this.next()}`;

    this.linkTokens.push({
      token,
      kind,
      accountId: account.id,
      used: false,
      ...(kind === 'confirmar-novo-email' ? { newEmail: to } : {}),
    });
    this.mailbox.send({ to, kind, link: `/${kind}/${token}`, sentAt: this.isoNow() });
  }

  /** Link de uso único (RF28): vazio é 422, usado ou inexistente é 400. */
  private useLink(
    token: string,
    kind: MockEmail['kind'],
    path: string,
    operation: 'confirmEmail' | 'resetPassword' | 'confirmEmailChange',
  ): LinkToken {
    if (!token.trim()) {
      throw this.d.validationError('confirmEmail/validacao', path, this.now(), [
        this.field('confirmEmail/validacao', 'token'),
      ]);
    }

    const link = this.linkTokens.find((item) => item.token === token && item.kind === kind);

    if (!link || link.used) throw this.error(`${operation}/token-invalido` as CaptureKey, path);
    link.used = true;

    return link;
  }
}
