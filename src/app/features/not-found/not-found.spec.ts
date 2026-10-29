import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('avisa que a página não existe e leva de volta ao início', async () => {
    await render(NotFound, { providers: [provideRouter([])] });

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar ao início' }).getAttribute('href')).toBe('/');
  });
});
