import type * as Api from './generated';

/** Entrada de uma operação: o corpo, o caminho e a busca do tipo gerado, sem a URL. */
export type ApiInput<TData> = Omit<TData, 'url'>;

/**
 * Contrato único da camada de dados (#14): um método por operação do OpenAPI usada pelas telas,
 * com entrada e saída dos tipos gerados. As telas dependem só desta classe, que é também o token
 * de injeção; o provedor (mockado na versão de apresentação, HTTP na integração real) é escolhido
 * em `app.config.ts`.
 *
 * Falhas da API chegam como `ApiError`. As operações privadas usam o token de `ApiCredentials`.
 * Nada aqui pode depender do provedor: o que só o mock sabe fazer fica no mock.
 */
export abstract class BiosApi {
  // Cadastro e confirmação (UC01).
  abstract registerAccount(
    input: ApiInput<Api.RegisterAccountData>,
  ): Promise<Api.RegisterAccountResponse>;
  abstract confirmEmail(input: ApiInput<Api.ConfirmEmailData>): Promise<Api.ConfirmEmailResponse>;
  abstract resendEmailConfirmation(
    input: ApiInput<Api.ResendEmailConfirmationData>,
  ): Promise<Api.ResendEmailConfirmationResponse>;

  // Sessão (UC02, UC03, UC17).
  abstract login(input: ApiInput<Api.LoginData>): Promise<Api.LoginResponse>;
  abstract refreshSession(
    input: ApiInput<Api.RefreshSessionData>,
  ): Promise<Api.RefreshSessionResponse>;
  abstract logout(input?: ApiInput<Api.LogoutData>): Promise<Api.LogoutResponse>;
  abstract logoutAllDevices(
    input?: ApiInput<Api.LogoutAllDevicesData>,
  ): Promise<Api.LogoutAllDevicesResponse>;

  // Senha (UC04).
  abstract changePassword(
    input: ApiInput<Api.ChangePasswordData>,
  ): Promise<Api.ChangePasswordResponse>;
  abstract forgotPassword(
    input: ApiInput<Api.ForgotPasswordData>,
  ): Promise<Api.ForgotPasswordResponse>;
  abstract resetPassword(
    input: ApiInput<Api.ResetPasswordData>,
  ): Promise<Api.ResetPasswordResponse>;

  // Conta (UC05).
  abstract getOwnAccount(
    input?: ApiInput<Api.GetOwnAccountData>,
  ): Promise<Api.GetOwnAccountResponse>;
  abstract updateOwnAccount(
    input: ApiInput<Api.UpdateOwnAccountData>,
  ): Promise<Api.UpdateOwnAccountResponse>;
  abstract requestEmailChange(
    input: ApiInput<Api.RequestEmailChangeData>,
  ): Promise<Api.RequestEmailChangeResponse>;
  abstract confirmEmailChange(
    input: ApiInput<Api.ConfirmEmailChangeData>,
  ): Promise<Api.ConfirmEmailChangeResponse>;
  abstract deleteOwnAccount(
    input: ApiInput<Api.DeleteOwnAccountData>,
  ): Promise<Api.DeleteOwnAccountResponse>;

  // Chaves de API (UC11).
  abstract createApiKey(input: ApiInput<Api.CreateApiKeyData>): Promise<Api.CreateApiKeyResponse>;
  abstract listApiKeys(input?: ApiInput<Api.ListApiKeysData>): Promise<Api.ListApiKeysResponse>;
  abstract revokeApiKey(input: ApiInput<Api.RevokeApiKeyData>): Promise<Api.RevokeApiKeyResponse>;

  // Blacklist de domínios (UC13).
  abstract listBlockedEmailDomains(
    input?: ApiInput<Api.ListBlockedEmailDomainsData>,
  ): Promise<Api.ListBlockedEmailDomainsResponse>;
  abstract addBlockedEmailDomain(
    input: ApiInput<Api.AddBlockedEmailDomainData>,
  ): Promise<Api.AddBlockedEmailDomainResponse>;
  abstract removeBlockedEmailDomain(
    input: ApiInput<Api.RemoveBlockedEmailDomainData>,
  ): Promise<Api.RemoveBlockedEmailDomainResponse>;

  // Empresas (UC06 a UC09).
  abstract getCompanyProfile(
    input: ApiInput<Api.GetCompanyProfileData>,
  ): Promise<Api.GetCompanyProfileResponse>;
  abstract getScoreExplanation(
    input: ApiInput<Api.GetScoreExplanationData>,
  ): Promise<Api.GetScoreExplanationResponse>;
  abstract searchCompanies(
    input?: ApiInput<Api.SearchCompaniesData>,
  ): Promise<Api.SearchCompaniesResponse>;
  abstract exportCompaniesXlsx(
    input?: ApiInput<Api.ExportCompaniesXlsxData>,
  ): Promise<Api.ExportCompaniesXlsxResponse>;

  // ODS e setores (UC07, UC10).
  abstract listOds(input?: ApiInput<Api.ListOdsData>): Promise<Api.ListOdsResponse>;
  abstract listSectors(input?: ApiInput<Api.ListSectorsData>): Promise<Api.ListSectorsResponse>;
  abstract getSectorEvolution(
    input: ApiInput<Api.GetSectorEvolutionData>,
  ): Promise<Api.GetSectorEvolutionResponse>;
}

/** Nome de uma operação do contrato (`login`, `getCompanyProfile`...). */
export type BiosOperation = {
  [K in keyof BiosApi]: BiosApi[K] extends (...args: never[]) => unknown ? K : never;
}[keyof BiosApi];
