import { FormControl } from '@angular/forms';
import { RULES_ERROR_KEY } from './account-rules';
import { EMAIL_DOMAIN_MESSAGE, emailDomainRules, normalizeEmailDomain } from './domain-rules';

function accepts(value: string): boolean {
  return emailDomainRules(new FormControl(value)) === null;
}

describe('regra do domínio da blacklist (igual à da API)', () => {
  it.each([
    'mailinator.com',
    '10minutemail.co.uk',
    'caixa-temporaria.example',
    ' Descartavel.Example ',
    'sub.dominio.com.br',
    'xn--maana-pta.com',
    'exemplo.xn--p1ai',
  ])('aceita %j', (value) => {
    expect(accepts(value)).toBe(true);
  });

  it.each([
    '',
    '@mailinator.com',
    'pessoa@mailinator.com',
    'mailinator',
    'não é domínio',
    '-inicio.com',
    'fim-.com',
    'dominio.c',
    'dominio.123',
    'dois..pontos.com',
    `${'a'.repeat(64)}.com`,
    `${'a.'.repeat(126)}com`,
  ])('recusa %j com a mensagem da API', (value) => {
    expect(emailDomainRules(new FormControl(value))).toEqual({
      [RULES_ERROR_KEY]: [EMAIL_DOMAIN_MESSAGE],
    });
  });

  it('normaliza como a API grava: sem espaços nas pontas e em minúsculas', () => {
    expect(normalizeEmailDomain('  Mailinator.COM ')).toBe('mailinator.com');
  });
});
