import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { MockMailbox } from '../../../core/mocks/mock-mailbox';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { SessionStore } from '../../../core/session/session-store';
import { ResetPassword } from './reset-password';

@Component({ template: '<h1>Destino</h1>' })
class Destination {}

const EMAIL = 'apresentacao@example.com';
const INVALID_LINK = 'O link é inválido, expirou ou já foi usado. Solicite um novo.';

async function renderReset(token = 'provisorio') {
  const result = await render(ResetPassword, {
    inputs: { token },
    providers: [
      provideRouter([{ path: '**', component: Destination }]),
      provideMockBiosApi({ latencyMs: 0 }),
    ],
  });

  return { ...result, user: userEvent.setup() };
}

/** Pede a redefinição no mock e devolve o token do link que o e-mail traria. */
async function resetToken(): Promise<string> {
  await TestBed.inject(BiosApi).forgotPassword({ body: { email: EMAIL } });

  return TestBed.inject(MockMailbox).latest(EMAIL, 'redefinir-senha')?.link.split('/').pop() ?? '';
}

async function save(user: ReturnType<typeof userEvent.setup>, password: string) {
  await user.type(screen.getByLabelText('Nova senha'), password);
  await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
}

async function landedOn(url: string) {
  await vi.waitFor(() => {
    expect(TestBed.inject(Router).url).toBe(url);
  });
}

describe('ResetPassword', () => {
  it('a política de senha aparece antes do erro, e a senha fora dela não é enviada', async () => {
    const { user, fixture } = await renderReset();
    const reset = vi.spyOn(TestBed.inject(BiosApi), 'resetPassword');

    expect(
      screen.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.'),
    ).toBeTruthy();
    await save(user, 'semnumero');
    await fixture.whenStable();

    expect(reset).not.toHaveBeenCalled();
    expect(screen.getByText('A senha deve conter ao menos um número.')).toBeTruthy();
  });

  it('link válido: grava a senha, encerra a sessão local e leva ao login com o aviso', async () => {
    const { user, fixture } = await renderReset();
    const token = await resetToken();
    TestBed.inject(SessionStore).store({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 900,
      user: { id: '1', name: 'Conta de Demonstração', role: 'USER' },
    });
    fixture.componentRef.setInput('token', token);

    await save(user, 'novaSenha2026');

    await landedOn('/entrar?senha=redefinida');
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    await expect(
      TestBed.inject(BiosApi).login({ body: { email: EMAIL, password: 'novaSenha2026' } }),
    ).resolves.toBeTruthy();
  });

  it('senha nova recusada pela API não gasta o link: o mesmo link grava a senha depois (regra 6)', async () => {
    const { user, fixture } = await renderReset();
    const token = await resetToken();
    const api = TestBed.inject(BiosApi);
    // A política está no front também; aqui a recusa vem direto da API (mock).
    await expect(api.resetPassword({ body: { token, new_password: 'curta' } })).rejects.toThrow();
    fixture.componentRef.setInput('token', token);

    await save(user, 'novaSenha2026');

    await landedOn('/entrar?senha=redefinida');
  });

  it('erro de validação da API marca o campo e mantém o formulário', async () => {
    const { user, fixture } = await renderReset();
    vi.spyOn(TestBed.inject(BiosApi), 'resetPassword').mockRejectedValueOnce(
      new ApiError(422, {
        statusCode: 422,
        code: 'VALIDATION_FAILED',
        message: 'Os dados enviados são inválidos.',
        details: [{ path: 'new_password', message: 'A senha deve ter ao menos 8 caracteres.' }],
        timestamp: '2026-11-02T12:00:00.000Z',
        path: '/auth/reset-password',
      }),
    );

    await save(user, 'novaSenha2026');
    await fixture.whenStable();

    expect(await screen.findByText('A senha deve ter ao menos 8 caracteres.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeTruthy();
  });

  it('link já usado mostra o erro da API e oferece pedir outro', async () => {
    const { user, fixture } = await renderReset();
    const token = await resetToken();
    await TestBed.inject(BiosApi).resetPassword({ body: { token, new_password: 'outraSenha1' } });
    fixture.componentRef.setInput('token', token);

    await save(user, 'novaSenha2026');

    expect((await screen.findByRole('alert')).textContent).toContain(INVALID_LINK);
    expect(screen.getByRole('link', { name: 'Pedir outro link' }).getAttribute('href')).toBe(
      '/esqueci-senha',
    );
    expect(screen.queryByRole('button', { name: 'Salvar nova senha' })).toBeNull();
  });
});
