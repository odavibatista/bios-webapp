import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { AccessDenied } from './access-denied';

describe('AccessDenied', () => {
  it('diz que o perfil não abre a área e leva de volta ao painel', async () => {
    await render(AccessDenied, { providers: [provideRouter([])] });

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeTruthy();
    expect(screen.getByText('Seu perfil não permite acessar esta área.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar ao painel' }).getAttribute('href')).toBe(
      '/painel',
    );
  });
});
