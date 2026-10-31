import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { ApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../../../core/presentation-mode';
import { SessionService } from '../../../core/session/session.service';
import { SessionStore } from '../../../core/session/session-store';
import { Login } from './login';

@Component({ template: '<h1>Destino</h1>' })
class Destination {}

const USER_EMAIL = 'apresentacao@example.com';
const PASSWORD = 'Apresentacao2026';

async function renderLogin(inputs: { voltar?: string; sessao?: string } = {}) {
  const result = await render(Login, {
    inputs,
    providers: [
      provideRouter([{ path: '**', component: Destination }]),
      provideMockBiosApi({ latencyMs: 0 }),
      { provide: PRESENTATION_MODE, useValue: true },
    ],
  });

  return { ...result, user: userEvent.setup() };
}

async function signIn(user: ReturnType<typeof userEvent.setup>, email: string, password: string) {
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

/**
 * Espera a navegação depois do login. A primeira chamada ao mock carrega as capturas sob demanda
 * (`mock-data`), e o `whenStable` não espera essa carga.
 */
async function landedOn(url: string) {
  await vi.waitFor(() => {
    expect(TestBed.inject(Router).url).toBe(url);
  });
}

function blocked(seconds: number): ApiError {
  return new ApiError(429, {
    statusCode: 429,
    code: 'ACCESS_TEMPORARILY_BLOCKED',
    message: 'Acesso temporariamente bloqueado. Tente novamente mais tarde.',
    details: { retry_after_seconds: seconds },
    timestamp: '2026-10-31T12:00:00.000Z',
    path: '/auth/login',
  });
}

describe('Login', () => {
  it('sem e-mail válido ou sem senha, não envia e marca os campos', async () => {
    const { user, fixture } = await renderLogin();
    const signInSpy = vi.spyOn(TestBed.inject(SessionService), 'signIn');

    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await fixture.whenStable();

    expect(signInSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
    expect(screen.getByText('Informe a senha.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('E-mail'));
  });

  it('entra, guarda a sessão e vai para o painel sem destino guardado', async () => {
    const { user } = await renderLogin();

    await signIn(user, `  ${USER_EMAIL}  `, PASSWORD);
    await landedOn('/painel');

    expect(TestBed.inject(SessionStore).user()?.role).toBe('USER');
  });

  it('volta ao destino guardado em `voltar`', async () => {
    const { user } = await renderLogin({ voltar: '/setores?ods=13' });

    await signIn(user, USER_EMAIL, PASSWORD);

    await landedOn('/setores?ods=13');
  });

  it('destino que sai do app é trocado pelo painel', async () => {
    const { user } = await renderLogin({ voltar: '//outro-site.example' });

    await signIn(user, USER_EMAIL, PASSWORD);

    await landedOn('/painel');
  });

  it('credenciais inválidas: a mensagem genérica da API, anunciada, sem apontar um campo', async () => {
    const { user, fixture } = await renderLogin();

    await signIn(user, USER_EMAIL, 'senha-errada');
    await fixture.whenStable();

    expect((await screen.findByRole('alert')).textContent).toContain('E-mail ou senha incorretos.');
    expect(screen.getByLabelText('E-mail').getAttribute('aria-invalid')).toBe('false');
    expect(screen.getByLabelText('Senha').getAttribute('aria-invalid')).toBe('false');
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
  });

  it('conta não confirmada: o aviso da API e o reenvio do link, com o link no modo apresentação', async () => {
    const { user, fixture } = await renderLogin();
    await TestBed.inject(BiosApi).registerAccount({
      body: { name: 'Nova Pessoa', email: 'nova.pessoa@example.com', password: 'senha123' },
    });

    await signIn(user, 'nova.pessoa@example.com', 'senha123');
    await fixture.whenStable();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Confirme seu e-mail para acessar. Se precisar, solicite um novo link.',
    );
    await user.click(screen.getByRole('button', { name: 'Reenviar o link de confirmação' }));
    await fixture.whenStable();

    expect((await screen.findByRole('status')).textContent).toContain(
      'Se houver uma conta aguardando confirmação para este e-mail, enviamos um novo link.',
    );
    expect(screen.getByRole('link', { name: 'Confirmar o e-mail' })).toBeTruthy();
  });

  it('bloqueio: mostra o tempo restante, atualizado, e reabilita o botão ao fim', async () => {
    const { user, fixture } = await renderLogin();
    vi.spyOn(TestBed.inject(SessionService), 'signIn').mockRejectedValueOnce(blocked(2));

    await signIn(user, USER_EMAIL, PASSWORD);
    await fixture.whenStable();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Acesso temporariamente bloqueado.',
    );
    expect(screen.getByText('Você poderá tentar de novo em 2 s.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Entrar' }).hasAttribute('disabled')).toBe(true);

    expect(await screen.findByText('Você poderá tentar de novo em 1 s.')).toBeTruthy();
    await vi.waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Entrar' }).hasAttribute('disabled')).toBe(false);
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText(/Você poderá tentar de novo/)).toBeNull();
  });

  it('um novo bloqueio com o mesmo tempo recomeça a contagem', async () => {
    const { user } = await renderLogin();
    vi.spyOn(TestBed.inject(SessionService), 'signIn')
      .mockRejectedValueOnce(blocked(1))
      .mockRejectedValueOnce(blocked(1));
    const button = () => screen.getByRole('button', { name: 'Entrar' });

    await signIn(user, USER_EMAIL, PASSWORD);
    await vi.waitFor(
      () => {
        expect(button().hasAttribute('disabled')).toBe(false);
      },
      { timeout: 3000 },
    );
    await user.click(button());

    expect(await screen.findByText('Você poderá tentar de novo em 1 s.')).toBeTruthy();
    expect(button().hasAttribute('disabled')).toBe(true);
  });

  it('o bloqueio do mock real chega depois de 5 senhas erradas, e nem a senha certa entra', async () => {
    const { user, fixture } = await renderLogin();

    for (let attempt = 0; attempt < 5; attempt++) {
      await TestBed.inject(SessionService)
        .signIn(USER_EMAIL, 'senha-errada')
        .catch(() => undefined);
    }
    await signIn(user, USER_EMAIL, PASSWORD);
    await fixture.whenStable();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Acesso temporariamente bloqueado.',
    );
    expect(screen.getByText('Você poderá tentar de novo em 15 min.')).toBeTruthy();
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBe(false);
  });

  it('sessão encerrada: avisa por que pede o login de novo', async () => {
    await renderLogin({ sessao: 'encerrada', voltar: '/setores' });

    expect(screen.getByRole('status').textContent).toBe(
      'Sua sessão terminou. Entre de novo para continuar.',
    );
  });

  it('leva ao cadastro e ao "esqueci a senha"', async () => {
    await renderLogin();

    expect(screen.getByRole('link', { name: 'Criar conta' }).getAttribute('href')).toBe(
      '/cadastro',
    );
    expect(screen.getByRole('link', { name: 'Esqueci a senha' }).getAttribute('href')).toBe(
      '/esqueci-senha',
    );
  });
});
