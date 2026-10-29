import { Route } from '@angular/router';
import { routes } from './app.routes';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';

function routeAt(path: string): Route {
  const route = routes.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`rota "${path}" não declarada`);
  return route;
}

describe('routes', () => {
  it.each([
    ['', Home, 'BIOS'],
    ['**', NotFound, 'Página não encontrada — BIOS'],
  ])(
    'a rota "%s" carrega o componente certo com o título da aba',
    async (path, component, title) => {
      const route = routeAt(path);

      expect(await route.loadComponent?.()).toBe(component);
      expect(route.title).toBe(title);
    },
  );

  it('a rota de não encontrado é a última, para não esconder as demais', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });
});
