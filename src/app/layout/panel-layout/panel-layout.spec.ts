import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { of } from 'rxjs';
import type { Role } from '../../core/session/role.guards';
import { SessionStore } from '../../core/session/session-store';
import { PanelLayout } from './panel-layout';

@Component({ template: '<h1>Setores</h1>' })
class Screen {}

async function renderPanel(role: Role, narrow = false) {
  const result = await render(PanelLayout, {
    providers: [
      provideRouter([{ path: '**', component: Screen }]),
      {
        provide: BreakpointObserver,
        useValue: { observe: () => of({ matches: narrow, breakpoints: {} }) },
      },
    ],
    configureTestBed: () => {
      TestBed.inject(SessionStore).store({
        access_token: 'a',
        refresh_token: 'r',
        token_type: 'Bearer',
        expires_in: 900,
        user: { id: '1', name: 'Conta de Demonstração', role },
      });
    },
  });

  return result;
}

function menu(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Áreas do painel' });
}

describe('PanelLayout', () => {
  it('USER: menu com as áreas comuns, sem a administração', async () => {
    await renderPanel('USER');

    const links = within(menu()).getAllByRole('link');

    expect(links.map((link) => link.textContent.trim())).toEqual([
      'domain Empresas',
      'manage_search Pesquisa',
      'monitoring Setores',
      'key Chaves de API',
      'person Conta',
    ]);
  });

  it('ADMIN: o menu inclui a administração', async () => {
    await renderPanel('ADMIN');

    expect(
      within(menu())
        .getByRole('link', { name: /Administração/ })
        .getAttribute('href'),
    ).toBe('/admin/dominios-bloqueados');
  });

  it('marca o item da página atual com aria-current', async () => {
    const { fixture } = await renderPanel('USER');

    await TestBed.inject(Router).navigateByUrl('/setores');
    await fixture.whenStable();

    expect(
      within(menu())
        .getByRole('link', { name: /Setores/ })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      within(menu()).getByRole('link', { name: /Conta/ }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('tela larga: menu fixo, sem botão de abrir', async () => {
    await renderPanel('USER');

    expect(screen.queryByRole('button', { name: /Menu do painel/ })).toBeNull();
  });

  it('tela estreita: o menu abre como gaveta pelo botão, que diz se está aberto', async () => {
    const { fixture } = await renderPanel('USER', true);
    const toggle = screen.getByRole('button', { name: /Menu do painel/ });

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('menu-do-painel');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    within(menu())
      .getByRole('link', { name: /Setores/ })
      .click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
