import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { privateByDefault } from './core/session/private-by-default.guard';
import type { Role } from './core/session/role.guards';
import { SessionStore } from './core/session/session-store';

/** Navega pelas rotas reais, com ou sem sessão, e diz onde a pessoa foi parar. */
async function navigate(url: string, role: Role | null = null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      {
        provide: BreakpointObserver,
        useValue: { observe: () => of({ matches: false, breakpoints: {} }) },
      },
    ],
  });
  if (role) {
    TestBed.inject(SessionStore).store({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 900,
      user: { id: '1', name: 'Conta de Demonstração', role },
    });
  }
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  const root = harness.fixture.nativeElement as HTMLElement;

  return {
    url: TestBed.inject(Router).url,
    title: document.title,
    heading: root.querySelector('h1')?.textContent.trim(),
    inPanel: root.querySelector('bios-panel-layout') !== null,
  };
}

describe('routes', () => {
  it('toda rota fica sob o guard de rotas privadas por padrão', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0]?.canActivateChild).toEqual([privateByDefault]);
  });

  it('a página inicial é pública e fica fora do painel', async () => {
    const page = await navigate('/');

    expect(page.url).toBe('/');
    expect(page.title).toBe('BIOS');
    expect(page.inPanel).toBe(false);
  });

  it('sem sessão, o painel leva ao login guardando o destino', async () => {
    const page = await navigate('/painel');

    expect(page.url).toBe('/entrar?voltar=%2Fpainel');
  });

  it('com sessão, o painel abre dentro da casca, com o título da aba', async () => {
    const page = await navigate('/painel', 'USER');

    expect(page.url).toBe('/painel');
    expect(page.title).toBe('Painel — BIOS');
    expect(page.inPanel).toBe(true);
  });

  it('USER na administração vai para o acesso negado', async () => {
    const page = await navigate('/admin/dominios-bloqueados', 'USER');

    expect(page.url).toBe('/acesso-negado');
    expect(page.heading).toBe('Acesso negado');
  });

  it('ADMIN entra na administração', async () => {
    const page = await navigate('/admin/dominios-bloqueados', 'ADMIN');

    expect(page.url).toBe('/admin/dominios-bloqueados');
  });

  it('sem sessão, a administração leva ao login', async () => {
    const page = await navigate('/admin/dominios-bloqueados');

    expect(page.url).toBe('/entrar?voltar=%2Fadmin%2Fdominios-bloqueados');
  });

  it('sem sessão, endereço desconhecido é "não encontrado", fora do painel e sem pedir login', async () => {
    const page = await navigate('/nao-existe');

    expect(page.url).toBe('/nao-existe');
    expect(page.title).toBe('Página não encontrada — BIOS');
    expect(page.inPanel).toBe(false);
  });

  it('com sessão, endereço desconhecido é "não encontrado" dentro do painel', async () => {
    const page = await navigate('/nao-existe', 'USER');

    expect(page.title).toBe('Página não encontrada — BIOS');
    expect(page.inPanel).toBe(true);
  });
});
