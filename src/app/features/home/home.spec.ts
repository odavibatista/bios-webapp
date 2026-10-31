import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { SessionStore } from '../../core/session/session-store';
import { CALCULATED_ODS, Home } from './home';

describe('Home', () => {
  async function renderHome(signedIn = false) {
    return render(Home, {
      providers: [provideRouter([])],
      configureTestBed: () => {
        if (!signedIn) return;
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

  it('apresenta o BIOS num título de primeiro nível', async () => {
    await renderHome();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'evidência por evidência',
    );
  });

  it('sem sessão, convida a entrar ou a criar uma conta', async () => {
    await renderHome();

    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/entrar');
    expect(screen.getByRole('link', { name: 'Criar conta' }).getAttribute('href')).toBe(
      '/cadastro',
    );
    expect(screen.queryByRole('link', { name: 'Ir para o painel' })).toBeNull();
  });

  it('com sessão, leva direto ao painel', async () => {
    await renderHome(true);

    expect(screen.getByRole('link', { name: 'Ir para o painel' }).getAttribute('href')).toBe(
      '/painel',
    );
    expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
  });

  it('lista os ODS calculados, cada um com as suas fontes', async () => {
    await renderHome();

    const list = screen.getByRole('region', { name: 'O que o BIOS calcula' });
    for (const ods of CALCULATED_ODS) {
      expect(within(list).getByText(`ODS ${ods.number}`)).toBeTruthy();
      for (const source of ods.sources) {
        expect(within(list).getByText(source)).toBeTruthy();
      }
    }
  });

  it('explica que índice e confiança ficam lado a lado, nunca combinados', async () => {
    await renderHome();

    const reading = screen.getByRole('region', { name: 'Como ler o índice' });
    expect(within(reading).getByText('Confiança')).toBeTruthy();
    expect(reading.textContent).toContain('nunca combinada com ele');
  });
});
