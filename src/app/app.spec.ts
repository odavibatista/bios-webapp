import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  async function renderApp() {
    return render(App, { providers: [provideRouter([])] });
  }

  it('mostra a marca com link para a página inicial', async () => {
    await renderApp();

    const brand = screen.getByRole('link', { name: 'BIOS, página inicial' });
    expect(brand.getAttribute('href')).toBe('/');
  });

  it('oferece o atalho para pular direto ao conteúdo', async () => {
    await renderApp();

    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' });
    expect(skip.getAttribute('href')).toBe('#conteudo');
    expect(screen.getByRole('main').id).toBe('conteudo');
  });

  it('lembra no rodapé que ausência de dado não é evidência negativa', async () => {
    await renderApp();

    expect(screen.getByRole('contentinfo').textContent).toContain(
      'Ausência de dado não é evidência negativa',
    );
  });
});
