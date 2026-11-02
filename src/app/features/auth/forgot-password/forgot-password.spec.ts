import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { BiosApi } from '../../../core/api/bios-api';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../../../core/presentation-mode';
import { ForgotPassword } from './forgot-password';

const SENT_MESSAGE =
  'Se houver uma conta ativa com este e-mail, enviamos um link para redefinir a senha.';
/** Conta de demonstração, ativa no mock. */
const EXISTING_EMAIL = 'apresentacao@example.com';

async function renderForgot(presentation = false) {
  const result = await render(ForgotPassword, {
    providers: [
      provideRouter([]),
      provideMockBiosApi({ latencyMs: 0 }),
      { provide: PRESENTATION_MODE, useValue: presentation },
    ],
  });

  return { ...result, user: userEvent.setup() };
}

async function submit(user: ReturnType<typeof userEvent.setup>, email: string) {
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  await user.click(screen.getByRole('button', { name: 'Enviar link' }));
}

describe('ForgotPassword', () => {
  it('e-mail inválido não é enviado e recebe o erro da regra', async () => {
    const { user, fixture } = await renderForgot();
    const forgot = vi.spyOn(TestBed.inject(BiosApi), 'forgotPassword');

    await submit(user, 'nao-e-email');
    await fixture.whenStable();

    expect(forgot).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('E-mail'));
  });

  it('envia o e-mail sem espaços e mostra a resposta da API, com o foco no título', async () => {
    const { user } = await renderForgot();
    const forgot = vi.spyOn(TestBed.inject(BiosApi), 'forgotPassword');

    await submit(user, `  ${EXISTING_EMAIL}  `);

    const heading = await screen.findByRole('heading', { name: 'Confira seu e-mail' });
    expect(forgot).toHaveBeenCalledWith({ body: { email: EXISTING_EMAIL } });
    expect(screen.getByRole('status').textContent).toBe(SENT_MESSAGE);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });
  });

  it('e-mail com e sem conta recebem exatamente a mesma tela (RF25 b)', async () => {
    async function sentScreen(email: string): Promise<string> {
      const { user } = await renderForgot();

      await submit(user, email);
      const section = (await screen.findByRole('heading', { name: 'Confira seu e-mail' })).closest(
        'section',
      );
      const html = section?.outerHTML ?? '';

      // Destrói a tela e o mock, para a segunda renderização começar do zero.
      TestBed.resetTestingModule();

      return html;
    }

    const existing = await sentScreen(EXISTING_EMAIL);
    const unknown = await sentScreen('ninguem@example.com');

    expect(existing).toContain(SENT_MESSAGE);
    expect(unknown).toBe(existing);
  });

  it('na apresentação, o aviso mostra o link de redefinição que o e-mail traria', async () => {
    const { user } = await renderForgot(true);

    await submit(user, EXISTING_EMAIL);

    const link = await screen.findByRole('link', { name: 'Redefinir a senha' });
    expect(link.getAttribute('href')).toMatch(/^\/redefinir-senha\/[^/]+$/);
  });

  it('com a API real, não há aviso de apresentação', async () => {
    const { user } = await renderForgot(false);

    await submit(user, EXISTING_EMAIL);

    await screen.findByRole('heading', { name: 'Confira seu e-mail' });
    expect(screen.queryByText('Modo apresentação')).toBeNull();
  });
});
