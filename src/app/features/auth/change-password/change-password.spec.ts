import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { SessionStore } from '../../../core/session/session-store';
import { ChangePassword } from './change-password';

@Component({ template: '<h1>Destino</h1>' })
class Destination {}

const EMAIL = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';

/** Entra no mock e guarda a sessão, como o login faria. */
async function signIn() {
  const session = await TestBed.inject(BiosApi).login({
    body: { email: EMAIL, password: PASSWORD },
  });

  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  TestBed.inject(SessionStore).store(session);
}

async function renderChange() {
  const result = await render(ChangePassword, {
    providers: [
      provideRouter([{ path: '**', component: Destination }]),
      provideMockBiosApi({ latencyMs: 0 }),
    ],
  });
  await signIn();

  return { ...result, user: userEvent.setup() };
}

async function change(user: ReturnType<typeof userEvent.setup>, current: string, next: string) {
  if (current) await user.type(screen.getByLabelText('Senha atual'), current);
  if (next) await user.type(screen.getByLabelText('Nova senha'), next);
  await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
}

describe('ChangePassword', () => {
  it('valida antes de enviar: a senha atual só precisa existir; a nova segue a política', async () => {
    const { user, fixture } = await renderChange();
    const changeSpy = vi.spyOn(TestBed.inject(BiosApi), 'changePassword');

    expect(
      screen.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.'),
    ).toBeTruthy();
    await change(user, '', 'curta1');
    await fixture.whenStable();

    expect(changeSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Informe a senha.')).toBeTruthy();
    expect(screen.getByText('A senha deve ter ao menos 8 caracteres.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Senha atual'));
  });

  it('troca a senha, apaga a sessão local e leva ao login com o aviso', async () => {
    const { user } = await renderChange();

    await change(user, PASSWORD, 'novaSenha2026');

    await vi.waitFor(() => {
      expect(TestBed.inject(Router).url).toBe('/entrar?senha=alterada');
    });
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
    await expect(
      TestBed.inject(BiosApi).login({ body: { email: EMAIL, password: 'novaSenha2026' } }),
    ).resolves.toBeTruthy();
  });

  it('senha atual errada marca o campo da senha atual (fluxo 3.1)', async () => {
    const { user } = await renderChange();

    await change(user, 'senha-errada', 'novaSenha2026');

    const current = screen.getByLabelText('Senha atual');
    expect(await screen.findByText('A senha atual está incorreta.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(current.getAttribute('aria-invalid')).toBe('true');
    });
    expect(screen.getByLabelText('Nova senha').getAttribute('aria-invalid')).toBe('false');
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(true);
  });

  it('nova senha igual à atual é recusada no campo da nova senha (regra 3)', async () => {
    const { user } = await renderChange();

    await change(user, PASSWORD, PASSWORD);

    expect(await screen.findByText('A nova senha deve ser diferente da atual.')).toBeTruthy();
    await vi.waitFor(() => {
      expect(screen.getByLabelText('Nova senha').getAttribute('aria-invalid')).toBe('true');
    });
    expect(screen.getByLabelText('Senha atual').getAttribute('aria-invalid')).toBe('false');
  });
});
