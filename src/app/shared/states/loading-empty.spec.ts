import { render, screen } from '@testing-library/angular';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  it('anuncia a espera ao leitor de tela, com texto visível', async () => {
    await render(LoadingState);

    expect(screen.getByRole('status').textContent).toContain('Carregando…');
  });

  it('aceita um texto próprio da tela', async () => {
    await render(LoadingState, { inputs: { label: 'Consultando as fontes…' } });

    expect(screen.getByRole('status').textContent).toContain('Consultando as fontes…');
  });
});

describe('EmptyState', () => {
  it('explica por que não há itens e mostra a ação da tela', async () => {
    await render(
      `<bios-empty-state message="Nenhuma empresa atende aos filtros.">
        <a href="/empresas">Buscar pelo CNPJ</a>
      </bios-empty-state>`,
      { imports: [EmptyState] },
    );

    expect(screen.getByText('Nenhuma empresa atende aos filtros.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Buscar pelo CNPJ' })).toBeTruthy();
  });
});
