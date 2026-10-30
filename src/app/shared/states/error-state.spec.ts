import { render, screen } from '@testing-library/angular';
import { ApiError } from '../../core/api/api-error';
import { UNEXPECTED_ERROR_MESSAGE } from '../errors/describe-error';
import { ErrorState } from './error-state';

function apiError(status: number, code: string, message: string, details?: unknown): ApiError {
  return new ApiError(status, {
    statusCode: status,
    code,
    message,
    details,
    timestamp: '2026-10-30T12:00:00.000Z',
    path: '/x',
  });
}

function retryButton(): HTMLButtonElement | null {
  return screen.queryByRole('button', { name: 'Tentar de novo' });
}

describe('ErrorState', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('503: mostra a indisponibilidade temporária e repete ao clicar', async () => {
    const retry = vi.fn();

    await render(ErrorState, {
      inputs: {
        error: apiError(503, 'COMPANY_DATA_UNAVAILABLE', 'Dados temporariamente indisponíveis.'),
      },
      on: { retry },
    });

    expect(screen.getByRole('alert').textContent).toContain('Dados temporariamente indisponíveis.');
    retryButton()?.click();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('429: diz quando poderá repetir e bloqueia o botão até lá', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const { fixture } = await render(ErrorState, {
      inputs: {
        error: apiError(429, 'RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido.', {
          retry_after_seconds: 61,
        }),
      },
    });

    expect(screen.getByText('Você poderá tentar de novo em 1 min 1 s.')).toBeTruthy();
    expect(retryButton()?.disabled).toBe(true);

    vi.advanceTimersByTime(61_000);
    await fixture.whenStable();

    expect(screen.queryByText(/Você poderá tentar de novo/)).toBeNull();
    expect(retryButton()?.disabled).toBe(false);
  });

  it('falha inesperada: mensagem genérica em português, com "Tentar de novo"', async () => {
    await render(ErrorState, { inputs: { error: new Error('falha de rede') } });

    expect(screen.getByRole('alert').textContent).toContain(UNEXPECTED_ERROR_MESSAGE);
    expect(retryButton()).toBeTruthy();
  });

  it('erro que não se resolve repetindo, ou com o botão desligado pela tela, fica sem botão', async () => {
    const { rerender } = await render(ErrorState, {
      inputs: { error: apiError(404, 'COMPANY_NOT_FOUND', 'Empresa não encontrada.') },
    });

    expect(screen.getByRole('alert').textContent).toContain('Empresa não encontrada.');
    expect(retryButton()).toBeNull();

    await rerender({ inputs: { error: new Error('x'), retryable: false } });
    expect(retryButton()).toBeNull();
  });
});
