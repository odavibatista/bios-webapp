import { CAPTURES } from './fixtures';

/**
 * Operações que as telas usam (campo "Contrato da API" das issues do front). Cada uma precisa de
 * ao menos uma resposta capturada, senão a versão de apresentação teria tela sem dado.
 */
const SCREEN_OPERATIONS = [
  'addBlockedEmailDomain',
  'changePassword',
  'confirmEmail',
  'confirmEmailChange',
  'createApiKey',
  'deleteOwnAccount',
  'exportCompaniesXlsx',
  'forgotPassword',
  'getCompanyProfile',
  'getOwnAccount',
  'getScoreExplanation',
  'getSectorEvolution',
  'listApiKeys',
  'listBlockedEmailDomains',
  'listOds',
  'listSectors',
  'login',
  'logout',
  'logoutAllDevices',
  'refreshSession',
  'registerAccount',
  'removeBlockedEmailDomain',
  'requestEmailChange',
  'resendEmailConfirmation',
  'resetPassword',
  'revokeApiKey',
  'searchCompanies',
  'updateOwnAccount',
];

/** Domínios de e-mail aceitos nas capturas: o reservado para exemplos e o da blacklist usado. */
const ALLOWED_EMAIL_DOMAINS = ['example.com', '0-mail.com'];

const captures = Object.entries(CAPTURES);
const text = JSON.stringify(CAPTURES);

describe('respostas capturadas da API', () => {
  it('cobrem todas as operações usadas pelas telas', () => {
    const captured = new Set(captures.map(([, capture]) => capture.operationId));

    expect(SCREEN_OPERATIONS.filter((operation) => !captured.has(operation))).toEqual([]);
  });

  it('têm a chave igual a operação/cenário', () => {
    for (const [key, capture] of captures) {
      expect(key).toBe(`${capture.operationId}/${capture.scenario}`);
    }
  });

  it('não contêm CPF (INL02)', () => {
    expect(text).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(text).not.toMatch(/(?<![\w])\d{11}(?![\w])/);
  });

  it('não contêm e-mail fora dos domínios de demonstração', () => {
    const domains = [...text.matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g)].map(([, domain]) =>
      domain.toLowerCase(),
    );

    expect(domains.filter((domain) => !ALLOWED_EMAIL_DOMAINS.includes(domain))).toEqual([]);
  });

  it('não contêm token de sessão, segredo de chave de API nem senha', () => {
    expect(text).not.toMatch(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
    // Chave real: `bios_<prefixo de 8>_<segredo>`; nas capturas o segredo vira marcador.
    expect(text).not.toMatch(/bios_[A-Za-z0-9]{8}_(?!segredo-de-demonstracao)[\w-]{16,}/);
    expect(text).not.toMatch(/"(?:current_|new_)?password":"(?!<senha>)/);
  });
});
