import { render, screen } from '@testing-library/angular';
import { ApiError } from '../../core/api/api-error';
import { AsyncState } from './async-state';

const TEMPLATE = `
  <bios-async-state [loading]="loading" [error]="error" [empty]="empty"
    emptyMessage="Nenhuma chave de API ativa." (retry)="retry()">
    <ul><li>Planilha de fornecedores</li></ul>
  </bios-async-state>
`;

const unavailable = new ApiError(503, {
  statusCode: 503,
  code: 'DEPENDENCY_UNAVAILABLE',
  message: 'Serviço temporariamente indisponível.',
  timestamp: '2026-10-30T12:00:00.000Z',
  path: '/api-keys',
});

async function renderState(props: { loading?: boolean; error?: unknown; empty?: boolean }) {
  const retry = vi.fn();
  const result = await render(TEMPLATE, {
    imports: [AsyncState],
    componentProperties: { loading: false, error: null, empty: false, retry, ...props },
  });

  return { ...result, retry };
}

describe('AsyncState', () => {
  it('carregando: indicador anunciado e região ocupada (aria-busy)', async () => {
    const { container } = await renderState({ loading: true });

    expect(screen.getByRole('status')).toBeTruthy();
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByText('Planilha de fornecedores')).toBeNull();
  });

  it('erro: a mensagem da API e "Tentar de novo" levam ao recarregamento da tela', async () => {
    const { retry } = await renderState({ error: unavailable });

    expect(screen.getByRole('alert').textContent).toContain(
      'Serviço temporariamente indisponível.',
    );
    screen.getByRole('button', { name: 'Tentar de novo' }).click();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('vazio: a explicação própria da lista, e não uma lista vazia', async () => {
    await renderState({ empty: true });

    expect(screen.getByText('Nenhuma chave de API ativa.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('pronto: o conteúdo da tela, sem indicador nem alerta', async () => {
    const { container } = await renderState({});

    expect(screen.getByText('Planilha de fornecedores')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(container.querySelector('[aria-busy="false"]')).toBeTruthy();
  });
});
