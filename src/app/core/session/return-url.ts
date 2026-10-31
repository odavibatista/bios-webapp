import { LOGIN_PATH } from './session.service';

/** Para onde o login leva sem destino guardado (UC02, passo 5). */
export const PANEL_PATH = '/painel';

/**
 * O destino guardado em `?voltar=` (#15), se for um caminho do próprio app. O valor vem da URL,
 * que qualquer um pode montar: aceitar `//outro-site` ou `https://...` faria do login um
 * redirecionamento para fora. Destino inválido, ausente ou o próprio login leva ao painel.
 */
export function safeReturnUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return PANEL_PATH;
  // `//host` e `/\host` são lidos pelo navegador como outro endereço.
  if (/^\/[/\\]/.test(value)) return PANEL_PATH;
  if (value === LOGIN_PATH || value.startsWith(`${LOGIN_PATH}?`)) return PANEL_PATH;

  return value;
}
