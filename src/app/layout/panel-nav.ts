import type { Role } from '../core/session/role.guards';

/** Um item do menu do painel. */
export interface PanelNavItem {
  label: string;
  icon: string;
  path: string;
  /** Papéis que veem o item (11-Permissões). */
  roles: readonly Role[];
  /** Só fica marcado como atual na rota exata (`/conta` não marca em `/conta/chaves`). */
  exact?: boolean;
}

const EVERYONE: readonly Role[] = ['USER', 'ADMIN'];

/** Áreas do painel, na ordem do menu. */
export const PANEL_NAV: readonly PanelNavItem[] = [
  { label: 'Empresas', icon: 'domain', path: '/empresas', roles: EVERYONE },
  { label: 'Pesquisa', icon: 'manage_search', path: '/pesquisa', roles: EVERYONE },
  { label: 'Setores', icon: 'monitoring', path: '/setores', roles: EVERYONE },
  { label: 'Chaves de API', icon: 'key', path: '/conta/chaves', roles: EVERYONE },
  { label: 'Conta', icon: 'person', path: '/conta', roles: EVERYONE, exact: true },
  {
    label: 'Administração',
    icon: 'admin_panel_settings',
    path: '/admin/dominios-bloqueados',
    roles: ['ADMIN'],
  },
];

/** O que o menu mostra para um papel: o `USER` não vê a administração ([P12]). */
export function navItemsFor(role: Role | null | undefined): PanelNavItem[] {
  return role ? PANEL_NAV.filter((item) => item.roles.includes(role)) : [];
}

/** Como o papel aparece para a pessoa. */
export function roleLabel(role: Role): string {
  return role === 'ADMIN' ? 'Administrador' : 'Usuário';
}
