import { navItemsFor, roleLabel } from './panel-nav';

describe('menu do painel por papel', () => {
  it('USER vê as áreas comuns, sem a administração', () => {
    expect(navItemsFor('USER').map((item) => item.label)).toEqual([
      'Empresas',
      'Pesquisa',
      'Setores',
      'Chaves de API',
      'Conta',
    ]);
  });

  it('ADMIN vê também a administração da blacklist', () => {
    expect(navItemsFor('ADMIN').at(-1)).toMatchObject({
      label: 'Administração',
      path: '/admin/dominios-bloqueados',
    });
  });

  it('sem sessão, o menu fica vazio', () => {
    expect(navItemsFor(null)).toEqual([]);
  });

  it('o papel aparece em português', () => {
    expect(roleLabel('USER')).toBe('Usuário');
    expect(roleLabel('ADMIN')).toBe('Administrador');
  });
});
