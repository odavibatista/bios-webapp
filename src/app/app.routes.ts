import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'BIOS',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    title: 'Página não encontrada — BIOS',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
