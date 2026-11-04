import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { MOCK_API_CONFIG } from '../mocks/mock-config';
import { PRESENTATION_MODE } from '../presentation-mode';
import { PANEL_PATH } from './return-url';
import { LOGIN_PATH, SessionService } from './session.service';
import { SessionStore } from './session-store';

/** Rota do QR Code da apresentação: abre o painel já com a conta de demonstração. */
export const DEMO_ENTRY_PATH = 'demonstracao';

/**
 * Entra com a conta de demonstração e leva ao painel, para quem abre o app por um QR Code não
 * digitar nada. A senha não vai na URL, que ficaria no histórico do navegador. Só existe na versão
 * de apresentação, em que a conta é do mock: com a API real, a rota leva ao login.
 */
export const enterDemo: CanActivateFn = async () => {
  const router = inject(Router);
  const store = inject(SessionStore);
  const session = inject(SessionService);
  const presentation = inject(PRESENTATION_MODE);
  const config = inject(MOCK_API_CONFIG, { optional: true });
  const account = config?.demoAccounts.find(({ role }) => role === 'USER');

  if (!presentation || !config || !account) return router.parseUrl(LOGIN_PATH);
  if (store.isAuthenticated()) return router.parseUrl(PANEL_PATH);

  try {
    await session.signIn(account.email, config.demoPassword);

    return router.parseUrl(PANEL_PATH);
  } catch {
    return router.parseUrl(LOGIN_PATH);
  }
};
