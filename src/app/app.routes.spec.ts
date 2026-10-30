import { Route } from '@angular/router';
import { routes } from './app.routes';
import { privateByDefault } from './core/session/private-by-default.guard';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';

const [root] = routes;
const children = root?.children ?? [];

function routeAt(path: string): Route {
  const route = children.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`rota "${path}" não declarada`);
  return route;
}

describe('routes', () => {
  it('toda rota fica sob o guard de rotas privadas por padrão', () => {
    expect(routes).toHaveLength(1);
    expect(root?.canActivateChild).toEqual([privateByDefault]);
  });

  it.each([
    ['', Home, 'BIOS'],
    ['**', NotFound, 'Página não encontrada — BIOS'],
  ])(
    'a rota pública "%s" carrega o componente certo com o título da aba',
    async (path, component, title) => {
      const route = routeAt(path);

      expect(await route.loadComponent?.()).toBe(component);
      expect(route.title).toBe(title);
      expect(route.data?.['public']).toBe(true);
    },
  );

  it('a rota de não encontrado é a última, para não esconder as demais', () => {
    expect(children.at(-1)?.path).toBe('**');
  });
});
