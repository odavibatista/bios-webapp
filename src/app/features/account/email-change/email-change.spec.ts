import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { InMemoryApiCredentials } from '../../../core/api/api-credentials';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../../../core/presentation-mode';
import { EmailChange } from './email-change';

const CURRENT = 'apresentacao@example.com';
/** A outra conta de demonstração: o pedido para ela tem a mesma resposta (regra 5). */
const OTHER_ACCOUNT = 'administracao@example.com';
const PASSWORD = 'Apresentacao2026';
const REQUESTED_MESSAGE =
  'Se o e-mail puder ser usado, enviamos um link de confirmação para ele. A troca só vale depois que você abrir o link.';

/** A seção com uma sessão aberta no mock real. */
async function renderSection(presentation = false) {
  await render(EmailChange, {
    inputs: { currentEmail: CURRENT },
    providers: [
      provideRouter([]),
      provideMockBiosApi({ latencyMs: 0 }),
      { provide: PRESENTATION_MODE, useValue: presentation },
    ],
  });
  const session = await TestBed.inject(BiosApi).login({
    body: { email: CURRENT, password: PASSWORD },
  });
  TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);

  return { api: TestBed.inject(BiosApi), user: userEvent.setup() };
}

async function request(
  user: ReturnType<typeof userEvent.setup>,
  newEmail: string,
  password = PASSWORD,
) {
  if (newEmail) await user.type(screen.getByLabelText('Novo e-mail'), newEmail);
  if (password) await user.type(screen.getByLabelText('Senha atual'), password);
  await user.click(screen.getByRole('button', { name: 'Enviar link de confirmação' }));
}

describe('EmailChange', () => {
  it('valida antes de enviar, com as mensagens da API', async () => {
    const { api, user } = await renderSection();
    const requestSpy = vi.spyOn(api, 'requestEmailChange');

    await request(user, 'nao-e-email', '');

    expect(requestSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
    expect(screen.getByText('Informe a senha atual.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Novo e-mail'));
  });

  it('pedido aceito: a mensagem da API, e o e-mail da conta continua o atual', async () => {
    const { api, user } = await renderSection();
    const requestSpy = vi.spyOn(api, 'requestEmailChange');

    await request(user, '  novo.endereco@example.com  ');

    expect(requestSpy).toHaveBeenCalledWith({
      body: { new_email: 'novo.endereco@example.com', current_password: PASSWORD },
    });
    expect((await screen.findByRole('status')).textContent).toBe(REQUESTED_MESSAGE);
    expect(screen.getByText(CURRENT).closest('p')?.textContent).toContain(
      'o e-mail da conta continua sendo',
    );
  });

  it('e-mail de outra conta recebe exatamente a mesma tela (regra 5)', async () => {
    async function requestedScreen(newEmail: string): Promise<string> {
      const { user } = await renderSection();

      await request(user, newEmail);
      await screen.findByRole('status');
      const html = document.querySelector('.requested')?.outerHTML ?? '';

      // Destrói a tela e o mock, para a segunda renderização começar do zero.
      TestBed.resetTestingModule();

      return html;
    }

    const free = await requestedScreen('livre@example.com');
    const taken = await requestedScreen(OTHER_ACCOUNT);

    expect(free).toContain(REQUESTED_MESSAGE);
    expect(taken).toBe(free);
  });

  it.each([
    [
      'senha errada',
      'novo@example.com',
      'senha-errada',
      'Senha atual',
      'A senha atual está incorreta.',
    ],
    ['o mesmo e-mail', CURRENT, PASSWORD, 'Novo e-mail', 'O novo e-mail é igual ao atual.'],
    [
      'domínio bloqueado',
      'alguem@0-mail.com',
      PASSWORD,
      'Novo e-mail',
      'Não é possível usar este endereço de e-mail. Informe outro.',
    ],
  ])('%s marca o campo com a mensagem da API', async (_, newEmail, password, field, message) => {
    const { user } = await renderSection();

    await request(user, newEmail, password);

    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.getByLabelText(field).getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('na apresentação, o aviso mostra o link de confirmação do novo e-mail', async () => {
    const { user } = await renderSection(true);

    await request(user, 'novo.endereco@example.com');

    const link = await screen.findByRole('link', { name: 'Confirmar o novo e-mail' });
    expect(link.getAttribute('href')).toMatch(/^\/confirmar-novo-email\/[^/]+$/);
  });

  it('"Trocar por outro endereço" volta ao formulário', async () => {
    const { user } = await renderSection();

    await request(user, 'novo.endereco@example.com');
    await user.click(await screen.findByRole('button', { name: 'Trocar por outro endereço' }));

    expect(screen.getByLabelText<HTMLInputElement>('Novo e-mail').value).toBe('');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
