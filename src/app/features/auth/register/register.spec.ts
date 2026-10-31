import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../../../core/presentation-mode';
import { Register } from './register';

const NEW_EMAIL = 'nova.pessoa@example.com';
/** Conta de demonstração, já cadastrada no mock. */
const EXISTING_EMAIL = 'apresentacao@example.com';
const BLOCKED_EMAIL = 'demonstracao@0-mail.com';
const SUCCESS_MESSAGE =
  'Se o e-mail puder ser cadastrado, enviamos um link de confirmação. Verifique sua caixa de entrada.';

async function renderRegister(presentation = false) {
  const result = await render(Register, {
    providers: [
      provideRouter([]),
      provideMockBiosApi({ latencyMs: 0 }),
      { provide: PRESENTATION_MODE, useValue: presentation },
    ],
  });

  return { ...result, user: userEvent.setup() };
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  { name = 'Nova Pessoa', email = NEW_EMAIL, password = 'senha123' } = {},
) {
  if (name) await user.type(screen.getByLabelText('Nome'), name);
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('Register', () => {
  it('a política de senha aparece antes de qualquer erro', async () => {
    await renderRegister();

    expect(
      screen.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.'),
    ).toBeTruthy();
    expect(screen.queryByText(/A senha deve/)).toBeNull();
  });

  it('valida antes de enviar, com as regras da API, e leva o foco ao primeiro campo com erro', async () => {
    const { user, fixture } = await renderRegister();
    const register = vi.spyOn(TestBed.inject(BiosApi), 'registerAccount');

    await fillAndSubmit(user, { name: 'A', email: 'nao-e-email', password: 'semnumero' });
    await fixture.whenStable();

    expect(register).not.toHaveBeenCalled();
    const name = screen.getByLabelText('Nome');
    const nameError = screen.getByText('O nome deve ter ao menos 2 caracteres.');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toContain(nameError.closest('mat-error')?.id);
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
    expect(screen.getByText('A senha deve conter ao menos um número.')).toBeTruthy();
    expect(document.activeElement).toBe(name);
  });

  it('envia os dados sem os espaços das bordas e mostra a resposta da API, com o foco no título', async () => {
    const { user, fixture } = await renderRegister();
    const register = vi.spyOn(TestBed.inject(BiosApi), 'registerAccount');

    await fillAndSubmit(user, { name: '  Nova Pessoa  ', email: `  ${NEW_EMAIL}  ` });
    await fixture.whenStable();

    expect(register).toHaveBeenCalledWith({
      body: { name: 'Nova Pessoa', email: NEW_EMAIL, password: 'senha123' },
    });
    const heading = await screen.findByRole('heading', { name: 'Confira seu e-mail' });
    expect(screen.getByRole('status').textContent).toBe(SUCCESS_MESSAGE);
    expect(document.activeElement).toBe(heading);
    expect(screen.getByRole('link', { name: 'Pedir um novo link' }).getAttribute('href')).toBe(
      '/reenviar-confirmacao',
    );
  });

  it('e-mail já cadastrado recebe exatamente a mesma tela do e-mail novo (RF01 b)', async () => {
    async function sentScreen(email: string): Promise<string> {
      const { user, fixture } = await renderRegister();

      await fillAndSubmit(user, { email });
      await fixture.whenStable();
      const section = (await screen.findByRole('heading', { name: 'Confira seu e-mail' })).closest(
        'section',
      );
      const html = section?.outerHTML ?? '';

      // Destrói a tela e o mock, para a segunda renderização começar do zero.
      TestBed.resetTestingModule();

      return html;
    }

    const fresh = await sentScreen(NEW_EMAIL);
    const existing = await sentScreen(EXISTING_EMAIL);

    expect(fresh).toContain(SUCCESS_MESSAGE);
    expect(existing).toBe(fresh);
  });

  it('domínio bloqueado mostra a mensagem genérica da API e mantém o formulário', async () => {
    const { user, fixture } = await renderRegister();

    await fillAndSubmit(user, { email: BLOCKED_EMAIL });
    await fixture.whenStable();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Não é possível usar este endereço de e-mail. Informe outro.',
    );
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeTruthy();
  });

  it('na apresentação, o aviso mostra o link de confirmação que o e-mail traria', async () => {
    const { user, fixture } = await renderRegister(true);

    await fillAndSubmit(user);
    await fixture.whenStable();

    const link = await screen.findByRole('link', { name: 'Confirmar o e-mail' });
    expect(link.getAttribute('href')).toMatch(/^\/confirmar-email\/[^/]+$/);
  });

  it('com a API real, não há aviso de apresentação', async () => {
    const { user, fixture } = await renderRegister(false);

    await fillAndSubmit(user);
    await fixture.whenStable();

    await screen.findByRole('heading', { name: 'Confira seu e-mail' });
    expect(screen.queryByText('Modo apresentação')).toBeNull();
  });
});
