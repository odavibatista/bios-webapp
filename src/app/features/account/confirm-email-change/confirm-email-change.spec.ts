import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { OwnAccount } from '../../../core/account/own-account';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { MockMailbox } from '../../../core/mocks/mock-mailbox';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { SessionStore } from '../../../core/session/session-store';
import { ConfirmEmailChange } from './confirm-email-change';

const CURRENT = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';
const NEW_EMAIL = 'novo.endereco@example.com';

async function renderConfirm() {
  return render(ConfirmEmailChange, {
    inputs: { token: 'provisorio' },
    providers: [provideRouter([]), provideMockBiosApi({ latencyMs: 0 })],
  });
}

/** Entra no mock; com `keepSession`, guarda a sessão no app, como o login faria. */
async function signIn(keepSession: boolean) {
  const session = await TestBed.inject(BiosApi).login({
    body: { email: CURRENT, password: PASSWORD },
  });
  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  if (keepSession) TestBed.inject(SessionStore).store(session);
}

/** Pede a troca no mock e devolve o token do link que o e-mail ao novo endereço traria. */
async function requestedToken(newEmail = NEW_EMAIL): Promise<string> {
  await TestBed.inject(BiosApi).requestEmailChange({
    body: { new_email: newEmail, current_password: PASSWORD },
  });

  return (
    TestBed.inject(MockMailbox).latest(newEmail, 'confirmar-novo-email')?.link.split('/').pop() ??
    ''
  );
}

describe('ConfirmEmailChange', () => {
  it('com sessão, efetiva a troca e recarrega a conta, que passa a mostrar o novo e-mail', async () => {
    const { fixture } = await renderConfirm();
    await signIn(true);
    const token = await requestedToken();
    const account = TestBed.inject(OwnAccount).account;

    fixture.componentRef.setInput('token', token);

    expect(await screen.findByRole('heading', { name: 'E-mail atualizado' })).toBeTruthy();
    expect(screen.getByText(/E-mail atualizado\. Use o novo endereço para entrar\./)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver minha conta' }).getAttribute('href')).toBe(
      '/conta',
    );
    await vi.waitFor(() => {
      expect(account.hasValue() && account.value().email).toBe(NEW_EMAIL);
    });
  });

  it('sem sessão (o link aberto em outro aparelho), efetiva a troca e oferece entrar', async () => {
    const { fixture } = await renderConfirm();
    await signIn(false);
    const token = await requestedToken();

    fixture.componentRef.setInput('token', token);

    expect(await screen.findByRole('heading', { name: 'E-mail atualizado' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/entrar');
    // A troca valeu: o novo e-mail entra; o antigo, não.
    await expect(
      TestBed.inject(BiosApi).login({ body: { email: NEW_EMAIL, password: PASSWORD } }),
    ).resolves.toBeTruthy();
    await expect(
      TestBed.inject(BiosApi).login({ body: { email: CURRENT, password: PASSWORD } }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('link já usado: o erro da API e o caminho para pedir de novo', async () => {
    const { fixture } = await renderConfirm();
    await signIn(false);
    const token = await requestedToken();
    await TestBed.inject(BiosApi).confirmEmailChange({ body: { token } });

    fixture.componentRef.setInput('token', token);
    // O token provisório recusa com a mesma mensagem: espera a resposta do token certo.
    await fixture.whenStable();

    expect(
      await screen.findByText('O link é inválido, expirou ou já foi usado. Solicite um novo.'),
    ).toBeTruthy();
    expect(screen.getByText(/continua o mesmo\. Peça a troca de novo/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pedir a troca de novo' }).getAttribute('href')).toBe(
      '/conta',
    );
  });

  it('endereço que passou a ser de outra conta (409): explica e não troca', async () => {
    const { fixture } = await renderConfirm();
    await signIn(false);
    const token = await requestedToken();
    // Antes da confirmação, outra pessoa se cadastra com o endereço pedido.
    await TestBed.inject(BiosApi).registerAccount({
      body: { name: 'Outra Pessoa', email: NEW_EMAIL, password: 'senha123' },
    });

    fixture.componentRef.setInput('token', token);

    expect(await screen.findByText('Este e-mail já está em uso por outra conta.')).toBeTruthy();
    expect(
      screen.getByText(/passou a ser usado por outra conta antes da confirmação/),
    ).toBeTruthy();
    await expect(
      TestBed.inject(BiosApi).login({ body: { email: CURRENT, password: PASSWORD } }),
    ).resolves.toBeTruthy();
  });

  it('falha passageira oferece tentar de novo, e a nova tentativa confirma', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderConfirm();
    await signIn(false);
    const token = await requestedToken();
    const confirm = vi.spyOn(TestBed.inject(BiosApi), 'confirmEmailChange').mockRejectedValueOnce(
      new ApiError(503, {
        statusCode: 503,
        code: 'DEPENDENCY_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível.',
        timestamp: '2026-11-02T12:00:00.000Z',
        path: '/accounts/confirm-email-change',
      }),
    );

    fixture.componentRef.setInput('token', token);
    expect(await screen.findByText('Serviço temporariamente indisponível.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: 'E-mail atualizado' })).toBeTruthy();
    // A chamada com o token provisório veio antes do spy: aqui, a que falhou e a que confirmou.
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
