import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { MockMailbox } from '../../../core/mocks/mock-mailbox';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { ConfirmEmail } from './confirm-email';

async function renderConfirm(token: string) {
  return render(ConfirmEmail, {
    inputs: { token },
    providers: [provideRouter([]), provideMockBiosApi({ latencyMs: 0 })],
  });
}

/** Cadastra no mock e devolve o token do link que o e-mail traria. */
async function registeredToken(email = 'nova.pessoa@example.com'): Promise<string> {
  await TestBed.inject(BiosApi).registerAccount({
    body: { name: 'Nova Pessoa', email, password: 'senha123' },
  });

  return TestBed.inject(MockMailbox).latest(email, 'confirmar-email')?.link.split('/').pop() ?? '';
}

describe('ConfirmEmail', () => {
  it('ao abrir, confirma a conta e oferece o login', async () => {
    const { fixture } = await renderConfirm('provisorio');
    const token = await registeredToken();

    fixture.componentRef.setInput('token', token);
    await fixture.whenStable();

    expect(await screen.findByRole('heading', { name: 'E-mail confirmado' })).toBeTruthy();
    expect(screen.getByText('E-mail confirmado. Sua conta está ativa.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/entrar');
  });

  it('link já usado mostra o erro da API e o pedido de novo link (fluxo 6.1)', async () => {
    const { fixture } = await renderConfirm('provisorio');
    const token = await registeredToken();
    await TestBed.inject(BiosApi).confirmEmail({ body: { token } });

    fixture.componentRef.setInput('token', token);
    await fixture.whenStable();

    expect(
      await screen.findByText('O link é inválido, expirou ou já foi usado. Solicite um novo.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pedir um novo link' }).getAttribute('href')).toBe(
      '/reenviar-confirmacao',
    );
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull();
  });

  it('token desconhecido também leva ao pedido de novo link', async () => {
    const { fixture } = await renderConfirm('token-que-nao-existe');
    await fixture.whenStable();

    expect(await screen.findByRole('link', { name: 'Pedir um novo link' })).toBeTruthy();
  });

  it('falha passageira oferece tentar de novo, e a nova tentativa confirma', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderConfirm('provisorio');
    const token = await registeredToken();
    const api = TestBed.inject(BiosApi);
    const confirm = vi.spyOn(api, 'confirmEmail').mockRejectedValueOnce(
      new ApiError(503, {
        statusCode: 503,
        code: 'DEPENDENCY_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível.',
        timestamp: '2026-10-31T12:00:00.000Z',
        path: '/accounts/confirm-email',
      }),
    );

    fixture.componentRef.setInput('token', token);
    await fixture.whenStable();
    expect(await screen.findByText('Serviço temporariamente indisponível.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    await fixture.whenStable();

    expect(await screen.findByRole('heading', { name: 'E-mail confirmado' })).toBeTruthy();
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
