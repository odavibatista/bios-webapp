import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { SessionStore } from '../../core/session/session-store';
import { PANEL_SHORTCUTS, PanelHome } from './panel-home';

describe('PanelHome', () => {
  async function renderHome() {
    return render(PanelHome, {
      providers: [provideRouter([])],
      configureTestBed: () => {
        TestBed.inject(SessionStore).store({
          access_token: 'a',
          refresh_token: 'r',
          token_type: 'Bearer',
          expires_in: 900,
          user: { id: '1', name: 'Conta de Demonstração', role: 'USER' },
        });
      },
    });
  }

  it('cumprimenta pelo primeiro nome', async () => {
    await renderHome();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Olá, Conta');
  });

  it('leva à consulta, à pesquisa e aos setores', async () => {
    await renderHome();

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/empresas',
      '/pesquisa',
      '/setores',
    ]);
    for (const shortcut of PANEL_SHORTCUTS) {
      expect(screen.getByRole('link', { name: new RegExp(shortcut.title) })).toBeTruthy();
    }
  });
});
