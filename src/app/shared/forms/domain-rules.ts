import { rules } from './account-rules';

/**
 * Domínio de e-mail como a API o aceita na blacklist (`AddBlockedEmailDomainRequestSchema`):
 * rótulos de letras, dígitos e hífen (sem hífen nas pontas), separados por ponto, terminando num
 * domínio de topo de letras ou em punycode (`xn--`), até 253 caracteres. Já em minúsculas e sem
 * `@`: a API apara e baixa a caixa antes de conferir.
 */
export const EMAIL_DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

export const EMAIL_DOMAIN_MESSAGE =
  'Domínio inválido: informe só o domínio, sem @ (ex.: mailinator.com).';

/** O domínio como a API o grava: sem os espaços das pontas e em minúsculas. */
export function normalizeEmailDomain(value: string): string {
  return value.trim().toLowerCase();
}

/** Domínio a bloquear (UC13, fluxo 4.1), com a mensagem da API. */
export const emailDomainRules = rules((value) =>
  EMAIL_DOMAIN_PATTERN.test(normalizeEmailDomain(value)) ? [] : [EMAIL_DOMAIN_MESSAGE],
);
