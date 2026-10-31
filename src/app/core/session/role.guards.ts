import { inject } from '@angular/core';
import { Router, type CanActivateChildFn, type CanMatchFn } from '@angular/router';
import type { SessionResponse } from '../api/generated';
import { SessionStore } from './session-store';

/** Papel de quem entrou (`USER` ou `ADMIN`; 11-Permissões). */
export type Role = SessionResponse['user']['role'];

/** Rota de quem entrou, mas não tem o papel pedido. */
export const ACCESS_DENIED_PATH = '/acesso-negado';

/**
 * Área de um papel (ex.: administração, [P12]): quem não o tem vai para "acesso negado". A
 * autorização de verdade continua na API, que responderia `403 INSUFFICIENT_ROLE`; o guard só
 * evita mostrar uma tela que a conta não pode usar.
 */
export function requireRole(role: Role): CanActivateChildFn {
  return () =>
    inject(SessionStore).user()?.role === role ||
    inject(Router).createUrlTree([ACCESS_DENIED_PATH]);
}

/**
 * A rota só casa com sessão aberta. Serve ao "não encontrado" de dentro do painel: quem entrou o vê
 * com o menu; o visitante cai no "não encontrado" público, em vez de ser mandado ao login.
 */
export const withSession: CanMatchFn = () => inject(SessionStore).isAuthenticated();
