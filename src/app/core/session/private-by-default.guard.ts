import { inject } from '@angular/core';
import { Router, type CanActivateChildFn } from '@angular/router';
import { LOGIN_PATH } from './session.service';
import { SessionStore } from './session-store';

/**
 * Rotas privadas por padrão, como o guard global da API (RF02 c; 11-Permissões, regra 1): uma
 * rota nova nasce protegida, e as públicas (início, cadastro, confirmação, login, recuperação de
 * senha) se declaram com `data: { public: true }`. Sem sessão, a rota privada leva ao login,
 * guardando o destino em `voltar`.
 */
export const privateByDefault: CanActivateChildFn = (route, state) => {
  if (route.data['public'] === true || inject(SessionStore).isAuthenticated()) return true;

  return inject(Router).createUrlTree([LOGIN_PATH], { queryParams: { voltar: state.url } });
};
