// Gerado por scripts/capture-api.mjs. Não editar à mão.
import addBlockedEmailDomainDuplicado from './addBlockedEmailDomain/duplicado';
import addBlockedEmailDomainSucesso from './addBlockedEmailDomain/sucesso';
import addBlockedEmailDomainValidacao from './addBlockedEmailDomain/validacao';
import changePasswordSenhaAtualIncorreta from './changePassword/senha-atual-incorreta';
import changePasswordSenhaIgual from './changePassword/senha-igual';
import changePasswordSucesso from './changePassword/sucesso';
import changePasswordValidacao from './changePassword/validacao';
import confirmEmailSucesso from './confirmEmail/sucesso';
import confirmEmailTokenInvalido from './confirmEmail/token-invalido';
import confirmEmailValidacao from './confirmEmail/validacao';
import confirmEmailChangeEmailJaEmUso from './confirmEmailChange/email-ja-em-uso';
import confirmEmailChangeSucesso from './confirmEmailChange/sucesso';
import confirmEmailChangeTokenInvalido from './confirmEmailChange/token-invalido';
import createApiKeySucesso from './createApiKey/sucesso';
import createApiKeyValidacao from './createApiKey/validacao';
import deleteOwnAccountSenhaIncorreta from './deleteOwnAccount/senha-incorreta';
import deleteOwnAccountSucesso from './deleteOwnAccount/sucesso';
import exportCompaniesXlsxAcimaDoTeto from './exportCompaniesXlsx/acima-do-teto';
import exportCompaniesXlsxLimiteExcedido from './exportCompaniesXlsx/limite-excedido';
import exportCompaniesXlsxNome from './exportCompaniesXlsx/nome';
import exportCompaniesXlsxSemResultado from './exportCompaniesXlsx/sem-resultado';
import exportCompaniesXlsxSetorOds13Desc from './exportCompaniesXlsx/setor-ods-13-desc';
import forgotPasswordEmailDesconhecido from './forgotPassword/email-desconhecido';
import forgotPasswordSucesso from './forgotPassword/sucesso';
import getCompanyProfileAcoCearense from './getCompanyProfile/aco-cearense';
import getCompanyProfileAlcoa from './getCompanyProfile/alcoa';
import getCompanyProfileArcelormittal from './getCompanyProfile/arcelormittal';
import getCompanyProfileAtuante from './getCompanyProfile/atuante';
import getCompanyProfileCnpjInvalido from './getCompanyProfile/cnpj-invalido';
import getCompanyProfileCsn from './getCompanyProfile/csn';
import getCompanyProfileEccheli from './getCompanyProfile/eccheli';
import getCompanyProfileElectroAcoAltona from './getCompanyProfile/electro-aco-altona';
import getCompanyProfileFoxStore from './getCompanyProfile/fox-store';
import getCompanyProfileGerdauAcosLongos from './getCompanyProfile/gerdau-acos-longos';
import getCompanyProfileGerdau from './getCompanyProfile/gerdau';
import getCompanyProfileMagazineLuiza from './getCompanyProfile/magazine-luiza';
import getCompanyProfileNaoEncontrada from './getCompanyProfile/nao-encontrada';
import getCompanyProfilePrimeiraConsulta from './getCompanyProfile/primeira-consulta';
import getCompanyProfileSidermin from './getCompanyProfile/sidermin';
import getCompanyProfileTernium from './getCompanyProfile/ternium';
import getCompanyProfileUsiminas from './getCompanyProfile/usiminas';
import getOwnAccountSemSessao from './getOwnAccount/sem-sessao';
import getOwnAccountSessaoEncerrada from './getOwnAccount/sessao-encerrada';
import getOwnAccountSucesso from './getOwnAccount/sucesso';
import getScoreExplanationAcoCearenseOds13 from './getScoreExplanation/aco-cearense-ods-13';
import getScoreExplanationAcoCearenseOds15 from './getScoreExplanation/aco-cearense-ods-15';
import getScoreExplanationAlcoaOds13 from './getScoreExplanation/alcoa-ods-13';
import getScoreExplanationAlcoaOds15 from './getScoreExplanation/alcoa-ods-15';
import getScoreExplanationArcelormittalOds13 from './getScoreExplanation/arcelormittal-ods-13';
import getScoreExplanationArcelormittalOds15 from './getScoreExplanation/arcelormittal-ods-15';
import getScoreExplanationAtuanteOds13 from './getScoreExplanation/atuante-ods-13';
import getScoreExplanationAtuanteOds15 from './getScoreExplanation/atuante-ods-15';
import getScoreExplanationCsnOds13 from './getScoreExplanation/csn-ods-13';
import getScoreExplanationCsnOds15 from './getScoreExplanation/csn-ods-15';
import getScoreExplanationEccheliOds13 from './getScoreExplanation/eccheli-ods-13';
import getScoreExplanationEccheliOds15 from './getScoreExplanation/eccheli-ods-15';
import getScoreExplanationElectroAcoAltonaOds13 from './getScoreExplanation/electro-aco-altona-ods-13';
import getScoreExplanationElectroAcoAltonaOds15 from './getScoreExplanation/electro-aco-altona-ods-15';
import getScoreExplanationFoxStoreOds13 from './getScoreExplanation/fox-store-ods-13';
import getScoreExplanationFoxStoreOds15 from './getScoreExplanation/fox-store-ods-15';
import getScoreExplanationGerdauAcosLongosOds13 from './getScoreExplanation/gerdau-acos-longos-ods-13';
import getScoreExplanationGerdauAcosLongosOds15 from './getScoreExplanation/gerdau-acos-longos-ods-15';
import getScoreExplanationGerdauOds13 from './getScoreExplanation/gerdau-ods-13';
import getScoreExplanationGerdauOds15 from './getScoreExplanation/gerdau-ods-15';
import getScoreExplanationMagazineLuizaOds13 from './getScoreExplanation/magazine-luiza-ods-13';
import getScoreExplanationMagazineLuizaOds15 from './getScoreExplanation/magazine-luiza-ods-15';
import getScoreExplanationOdsNaoCalculado from './getScoreExplanation/ods-nao-calculado';
import getScoreExplanationSiderminOds13 from './getScoreExplanation/sidermin-ods-13';
import getScoreExplanationSiderminOds15 from './getScoreExplanation/sidermin-ods-15';
import getScoreExplanationTerniumOds13 from './getScoreExplanation/ternium-ods-13';
import getScoreExplanationTerniumOds15 from './getScoreExplanation/ternium-ods-15';
import getScoreExplanationUsiminasOds13 from './getScoreExplanation/usiminas-ods-13';
import getScoreExplanationUsiminasOds15 from './getScoreExplanation/usiminas-ods-15';
import getSectorEvolutionCnaeInvalido from './getSectorEvolution/cnae-invalido';
import getSectorEvolutionOdsNaoCalculado from './getSectorEvolution/ods-nao-calculado';
import getSectorEvolutionSetor24Ods13 from './getSectorEvolution/setor-24-ods-13';
import getSectorEvolutionSetor24Ods15 from './getSectorEvolution/setor-24-ods-15';
import getSectorEvolutionSetor47Ods13 from './getSectorEvolution/setor-47-ods-13';
import listApiKeysAposRevogacao from './listApiKeys/apos-revogacao';
import listApiKeysComChaves from './listApiKeys/com-chaves';
import listBlockedEmailDomainsPrimeiraPagina from './listBlockedEmailDomains/primeira-pagina';
import listBlockedEmailDomainsSemPermissao from './listBlockedEmailDomains/sem-permissao';
import listOdsSucesso from './listOds/sucesso';
import listSectorsSucesso from './listSectors/sucesso';
import loginAcessoBloqueado from './login/acesso-bloqueado';
import loginContaNaoConfirmada from './login/conta-nao-confirmada';
import loginCredenciaisInvalidas from './login/credenciais-invalidas';
import loginSucesso from './login/sucesso';
import loginValidacao from './login/validacao';
import logoutSemSessao from './logout/sem-sessao';
import logoutSucesso from './logout/sucesso';
import logoutAllDevicesSucesso from './logoutAllDevices/sucesso';
import refreshSessionSucesso from './refreshSession/sucesso';
import refreshSessionTokenInvalido from './refreshSession/token-invalido';
import registerAccountDominioBloqueado from './registerAccount/dominio-bloqueado';
import registerAccountEmailJaCadastrado from './registerAccount/email-ja-cadastrado';
import registerAccountSucesso from './registerAccount/sucesso';
import registerAccountValidacao from './registerAccount/validacao';
import removeBlockedEmailDomainNaoEncontrado from './removeBlockedEmailDomain/nao-encontrado';
import removeBlockedEmailDomainSucesso from './removeBlockedEmailDomain/sucesso';
import requestEmailChangeDominioBloqueado from './requestEmailChange/dominio-bloqueado';
import requestEmailChangeEmailDeOutraConta from './requestEmailChange/email-de-outra-conta';
import requestEmailChangeMesmoEmail from './requestEmailChange/mesmo-email';
import requestEmailChangeSenhaIncorreta from './requestEmailChange/senha-incorreta';
import requestEmailChangeSucesso from './requestEmailChange/sucesso';
import resendEmailConfirmationSucesso from './resendEmailConfirmation/sucesso';
import resetPasswordSenhaForaDaPolitica from './resetPassword/senha-fora-da-politica';
import resetPasswordSucesso from './resetPassword/sucesso';
import resetPasswordTokenInvalido from './resetPassword/token-invalido';
import revokeApiKeyNaoEncontrada from './revokeApiKey/nao-encontrada';
import revokeApiKeySucesso from './revokeApiKey/sucesso';
import searchCompaniesIndiceMinimo from './searchCompanies/indice-minimo';
import searchCompaniesNomeCurto from './searchCompanies/nome-curto';
import searchCompaniesNomeSemResultado from './searchCompanies/nome-sem-resultado';
import searchCompaniesNome from './searchCompanies/nome';
import searchCompaniesOdsNaoCalculado from './searchCompanies/ods-nao-calculado';
import searchCompaniesOrdemSemOds from './searchCompanies/ordem-sem-ods';
import searchCompaniesSemCriterio from './searchCompanies/sem-criterio';
import searchCompaniesSetorOds13Asc from './searchCompanies/setor-ods-13-asc';
import searchCompaniesSetorOds13Desc from './searchCompanies/setor-ods-13-desc';
import searchCompaniesSetorOds15Desc from './searchCompanies/setor-ods-15-desc';
import searchCompaniesSetorPagina2 from './searchCompanies/setor-pagina-2';
import searchCompaniesUf from './searchCompanies/uf';
import updateOwnAccountEndereco from './updateOwnAccount/endereco';
import updateOwnAccountNome from './updateOwnAccount/nome';
import updateOwnAccountRemoverEndereco from './updateOwnAccount/remover-endereco';
import updateOwnAccountValidacao from './updateOwnAccount/validacao';

/** Todas as respostas capturadas, pela chave `<operationId>/<cenário>`. */
export const CAPTURES = {
  'addBlockedEmailDomain/duplicado': addBlockedEmailDomainDuplicado,
  'addBlockedEmailDomain/sucesso': addBlockedEmailDomainSucesso,
  'addBlockedEmailDomain/validacao': addBlockedEmailDomainValidacao,
  'changePassword/senha-atual-incorreta': changePasswordSenhaAtualIncorreta,
  'changePassword/senha-igual': changePasswordSenhaIgual,
  'changePassword/sucesso': changePasswordSucesso,
  'changePassword/validacao': changePasswordValidacao,
  'confirmEmail/sucesso': confirmEmailSucesso,
  'confirmEmail/token-invalido': confirmEmailTokenInvalido,
  'confirmEmail/validacao': confirmEmailValidacao,
  'confirmEmailChange/email-ja-em-uso': confirmEmailChangeEmailJaEmUso,
  'confirmEmailChange/sucesso': confirmEmailChangeSucesso,
  'confirmEmailChange/token-invalido': confirmEmailChangeTokenInvalido,
  'createApiKey/sucesso': createApiKeySucesso,
  'createApiKey/validacao': createApiKeyValidacao,
  'deleteOwnAccount/senha-incorreta': deleteOwnAccountSenhaIncorreta,
  'deleteOwnAccount/sucesso': deleteOwnAccountSucesso,
  'exportCompaniesXlsx/acima-do-teto': exportCompaniesXlsxAcimaDoTeto,
  'exportCompaniesXlsx/limite-excedido': exportCompaniesXlsxLimiteExcedido,
  'exportCompaniesXlsx/nome': exportCompaniesXlsxNome,
  'exportCompaniesXlsx/sem-resultado': exportCompaniesXlsxSemResultado,
  'exportCompaniesXlsx/setor-ods-13-desc': exportCompaniesXlsxSetorOds13Desc,
  'forgotPassword/email-desconhecido': forgotPasswordEmailDesconhecido,
  'forgotPassword/sucesso': forgotPasswordSucesso,
  'getCompanyProfile/aco-cearense': getCompanyProfileAcoCearense,
  'getCompanyProfile/alcoa': getCompanyProfileAlcoa,
  'getCompanyProfile/arcelormittal': getCompanyProfileArcelormittal,
  'getCompanyProfile/atuante': getCompanyProfileAtuante,
  'getCompanyProfile/cnpj-invalido': getCompanyProfileCnpjInvalido,
  'getCompanyProfile/csn': getCompanyProfileCsn,
  'getCompanyProfile/eccheli': getCompanyProfileEccheli,
  'getCompanyProfile/electro-aco-altona': getCompanyProfileElectroAcoAltona,
  'getCompanyProfile/fox-store': getCompanyProfileFoxStore,
  'getCompanyProfile/gerdau-acos-longos': getCompanyProfileGerdauAcosLongos,
  'getCompanyProfile/gerdau': getCompanyProfileGerdau,
  'getCompanyProfile/magazine-luiza': getCompanyProfileMagazineLuiza,
  'getCompanyProfile/nao-encontrada': getCompanyProfileNaoEncontrada,
  'getCompanyProfile/primeira-consulta': getCompanyProfilePrimeiraConsulta,
  'getCompanyProfile/sidermin': getCompanyProfileSidermin,
  'getCompanyProfile/ternium': getCompanyProfileTernium,
  'getCompanyProfile/usiminas': getCompanyProfileUsiminas,
  'getOwnAccount/sem-sessao': getOwnAccountSemSessao,
  'getOwnAccount/sessao-encerrada': getOwnAccountSessaoEncerrada,
  'getOwnAccount/sucesso': getOwnAccountSucesso,
  'getScoreExplanation/aco-cearense-ods-13': getScoreExplanationAcoCearenseOds13,
  'getScoreExplanation/aco-cearense-ods-15': getScoreExplanationAcoCearenseOds15,
  'getScoreExplanation/alcoa-ods-13': getScoreExplanationAlcoaOds13,
  'getScoreExplanation/alcoa-ods-15': getScoreExplanationAlcoaOds15,
  'getScoreExplanation/arcelormittal-ods-13': getScoreExplanationArcelormittalOds13,
  'getScoreExplanation/arcelormittal-ods-15': getScoreExplanationArcelormittalOds15,
  'getScoreExplanation/atuante-ods-13': getScoreExplanationAtuanteOds13,
  'getScoreExplanation/atuante-ods-15': getScoreExplanationAtuanteOds15,
  'getScoreExplanation/csn-ods-13': getScoreExplanationCsnOds13,
  'getScoreExplanation/csn-ods-15': getScoreExplanationCsnOds15,
  'getScoreExplanation/eccheli-ods-13': getScoreExplanationEccheliOds13,
  'getScoreExplanation/eccheli-ods-15': getScoreExplanationEccheliOds15,
  'getScoreExplanation/electro-aco-altona-ods-13': getScoreExplanationElectroAcoAltonaOds13,
  'getScoreExplanation/electro-aco-altona-ods-15': getScoreExplanationElectroAcoAltonaOds15,
  'getScoreExplanation/fox-store-ods-13': getScoreExplanationFoxStoreOds13,
  'getScoreExplanation/fox-store-ods-15': getScoreExplanationFoxStoreOds15,
  'getScoreExplanation/gerdau-acos-longos-ods-13': getScoreExplanationGerdauAcosLongosOds13,
  'getScoreExplanation/gerdau-acos-longos-ods-15': getScoreExplanationGerdauAcosLongosOds15,
  'getScoreExplanation/gerdau-ods-13': getScoreExplanationGerdauOds13,
  'getScoreExplanation/gerdau-ods-15': getScoreExplanationGerdauOds15,
  'getScoreExplanation/magazine-luiza-ods-13': getScoreExplanationMagazineLuizaOds13,
  'getScoreExplanation/magazine-luiza-ods-15': getScoreExplanationMagazineLuizaOds15,
  'getScoreExplanation/ods-nao-calculado': getScoreExplanationOdsNaoCalculado,
  'getScoreExplanation/sidermin-ods-13': getScoreExplanationSiderminOds13,
  'getScoreExplanation/sidermin-ods-15': getScoreExplanationSiderminOds15,
  'getScoreExplanation/ternium-ods-13': getScoreExplanationTerniumOds13,
  'getScoreExplanation/ternium-ods-15': getScoreExplanationTerniumOds15,
  'getScoreExplanation/usiminas-ods-13': getScoreExplanationUsiminasOds13,
  'getScoreExplanation/usiminas-ods-15': getScoreExplanationUsiminasOds15,
  'getSectorEvolution/cnae-invalido': getSectorEvolutionCnaeInvalido,
  'getSectorEvolution/ods-nao-calculado': getSectorEvolutionOdsNaoCalculado,
  'getSectorEvolution/setor-24-ods-13': getSectorEvolutionSetor24Ods13,
  'getSectorEvolution/setor-24-ods-15': getSectorEvolutionSetor24Ods15,
  'getSectorEvolution/setor-47-ods-13': getSectorEvolutionSetor47Ods13,
  'listApiKeys/apos-revogacao': listApiKeysAposRevogacao,
  'listApiKeys/com-chaves': listApiKeysComChaves,
  'listBlockedEmailDomains/primeira-pagina': listBlockedEmailDomainsPrimeiraPagina,
  'listBlockedEmailDomains/sem-permissao': listBlockedEmailDomainsSemPermissao,
  'listOds/sucesso': listOdsSucesso,
  'listSectors/sucesso': listSectorsSucesso,
  'login/acesso-bloqueado': loginAcessoBloqueado,
  'login/conta-nao-confirmada': loginContaNaoConfirmada,
  'login/credenciais-invalidas': loginCredenciaisInvalidas,
  'login/sucesso': loginSucesso,
  'login/validacao': loginValidacao,
  'logout/sem-sessao': logoutSemSessao,
  'logout/sucesso': logoutSucesso,
  'logoutAllDevices/sucesso': logoutAllDevicesSucesso,
  'refreshSession/sucesso': refreshSessionSucesso,
  'refreshSession/token-invalido': refreshSessionTokenInvalido,
  'registerAccount/dominio-bloqueado': registerAccountDominioBloqueado,
  'registerAccount/email-ja-cadastrado': registerAccountEmailJaCadastrado,
  'registerAccount/sucesso': registerAccountSucesso,
  'registerAccount/validacao': registerAccountValidacao,
  'removeBlockedEmailDomain/nao-encontrado': removeBlockedEmailDomainNaoEncontrado,
  'removeBlockedEmailDomain/sucesso': removeBlockedEmailDomainSucesso,
  'requestEmailChange/dominio-bloqueado': requestEmailChangeDominioBloqueado,
  'requestEmailChange/email-de-outra-conta': requestEmailChangeEmailDeOutraConta,
  'requestEmailChange/mesmo-email': requestEmailChangeMesmoEmail,
  'requestEmailChange/senha-incorreta': requestEmailChangeSenhaIncorreta,
  'requestEmailChange/sucesso': requestEmailChangeSucesso,
  'resendEmailConfirmation/sucesso': resendEmailConfirmationSucesso,
  'resetPassword/senha-fora-da-politica': resetPasswordSenhaForaDaPolitica,
  'resetPassword/sucesso': resetPasswordSucesso,
  'resetPassword/token-invalido': resetPasswordTokenInvalido,
  'revokeApiKey/nao-encontrada': revokeApiKeyNaoEncontrada,
  'revokeApiKey/sucesso': revokeApiKeySucesso,
  'searchCompanies/indice-minimo': searchCompaniesIndiceMinimo,
  'searchCompanies/nome-curto': searchCompaniesNomeCurto,
  'searchCompanies/nome-sem-resultado': searchCompaniesNomeSemResultado,
  'searchCompanies/nome': searchCompaniesNome,
  'searchCompanies/ods-nao-calculado': searchCompaniesOdsNaoCalculado,
  'searchCompanies/ordem-sem-ods': searchCompaniesOrdemSemOds,
  'searchCompanies/sem-criterio': searchCompaniesSemCriterio,
  'searchCompanies/setor-ods-13-asc': searchCompaniesSetorOds13Asc,
  'searchCompanies/setor-ods-13-desc': searchCompaniesSetorOds13Desc,
  'searchCompanies/setor-ods-15-desc': searchCompaniesSetorOds15Desc,
  'searchCompanies/setor-pagina-2': searchCompaniesSetorPagina2,
  'searchCompanies/uf': searchCompaniesUf,
  'updateOwnAccount/endereco': updateOwnAccountEndereco,
  'updateOwnAccount/nome': updateOwnAccountNome,
  'updateOwnAccount/remover-endereco': updateOwnAccountRemoverEndereco,
  'updateOwnAccount/validacao': updateOwnAccountValidacao,
} as const;

export type CaptureKey = keyof typeof CAPTURES;
