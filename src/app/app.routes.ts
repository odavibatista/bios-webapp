import { Routes } from '@angular/router';
import { privateByDefault } from './core/session/private-by-default.guard';

/**
 * Todas as rotas ficam sob `privateByDefault` (#15): uma rota nova nasce privada, e as públicas
 * se declaram com `data: { public: true }`.
 */
export const routes: Routes = [
  {
    path: '',
    canActivateChild: [privateByDefault],
    children: [
      {
        path: '',
        title: 'BIOS',
        data: { public: true },
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: '**',
        title: 'Página não encontrada — BIOS',
        data: { public: true },
        loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
