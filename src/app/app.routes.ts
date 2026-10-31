import { Route, Routes } from '@angular/router';
import { privateByDefault } from './core/session/private-by-default.guard';
import { requireRole, withSession } from './core/session/role.guards';

const notFound: Route = {
  path: '**',
  title: 'Página não encontrada — BIOS',
  loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
};

/**
 * Todas as rotas ficam sob `privateByDefault` (#15): uma rota nova nasce privada, e as públicas
 * se declaram com `data: { public: true }`. As privadas moram na casca do painel (#18); as da
 * administração pedem o papel `ADMIN` ([P12]).
 */
export const routes: Routes = [
  {
    path: '',
    canActivateChild: [privateByDefault],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'BIOS',
        data: { public: true },
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        // `LOGIN_PATH`: para onde o guard e a renovação da sessão mandam quem não tem sessão.
        path: 'entrar',
        title: 'Entrar — BIOS',
        data: { public: true },
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'cadastro',
        title: 'Criar conta — BIOS',
        data: { public: true },
        loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
      },
      {
        // O caminho do link do e-mail de confirmação da API (template `EMAIL_CONFIRMATION`).
        path: 'confirmar-email/:token',
        title: 'Confirmar e-mail — BIOS',
        data: { public: true },
        loadComponent: () =>
          import('./features/auth/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
      },
      {
        path: 'reenviar-confirmacao',
        title: 'Novo link de confirmação — BIOS',
        data: { public: true },
        loadComponent: () =>
          import('./features/auth/resend-confirmation/resend-confirmation').then(
            (m) => m.ResendConfirmation,
          ),
      },
      {
        path: '',
        // Sob demanda: quem só vê a página inicial não baixa a casca do painel.
        loadComponent: () =>
          import('./layout/panel-layout/panel-layout').then((m) => m.PanelLayout),
        children: [
          {
            path: 'painel',
            title: 'Painel — BIOS',
            loadComponent: () =>
              import('./features/panel-home/panel-home').then((m) => m.PanelHome),
          },
          {
            path: 'acesso-negado',
            title: 'Acesso negado — BIOS',
            loadComponent: () =>
              import('./features/access-denied/access-denied').then((m) => m.AccessDenied),
          },
          {
            path: 'admin',
            canActivateChild: [requireRole('ADMIN')],
            children: [notFound],
          },
          // Endereço desconhecido com sessão: o "não encontrado" fica dentro do painel.
          { ...notFound, canMatch: [withSession] },
        ],
      },
      // Sem sessão, o endereço desconhecido cai aqui, fora do painel, sem pedir login.
      { ...notFound, data: { public: true } },
    ],
  },
];
