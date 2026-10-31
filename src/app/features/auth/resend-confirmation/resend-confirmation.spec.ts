import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { BiosApi } from '../../../core/api/bios-api';
import { MockMailbox } from '../../../core/mocks/mock-mailbox';
import { provideMockBiosApi } from '../../../core/mocks/provide-mock-bios-api';
import { PRESENTATION_MODE } from '../../../core/presentation-mode';
import { ResendConfirmation } from './resend-confirmation';

const SENT_MESSAGE =
  'Se houver uma conta aguardando confirmação para este e-mail, enviamos um novo link.';

async function renderResend(presentation = false) {
  const result = await render(ResendConfirmation, {
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
  await user.click(screen.getByRole('button', { name: 'Enviar novo link' }));
}

describe('ResendConfirmation', () => {
  it('e-mail inválido não é enviado e recebe o erro da regra', async () => {
    const { user, fixture } = await renderResend();
    const resend = vi.spyOn(TestBed.inject(BiosApi), 'resendEmailConfirmation');

    await submit(user, 'nao-e-email');
    await fixture.whenStable();

    expect(resend).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('E-mail'));
  });

  it('mostra a resposta da API, a mesma exista ou não a conta, com o foco no título', async () => {
    const { user, fixture } = await renderResend();
    const resend = vi.spyOn(TestBed.inject(BiosApi), 'resendEmailConfirmation');

    await submit(user, '  ninguem@example.com  ');
    await fixture.whenStable();

    expect(resend).toHaveBeenCalledWith({ body: { email: 'ninguem@example.com' } });
    const heading = await screen.findByRole('heading', { name: 'Confira seu e-mail' });
    expect(screen.getByRole('status').textContent).toBe(SENT_MESSAGE);
    expect(document.activeElement).toBe(heading);
  });

  it('na apresentação, o aviso mostra o novo link, e o anterior deixa de ser o mais recente', async () => {
    const { user, fixture } = await renderResend(true);
    const email = 'nova.pessoa@example.com';
    await TestBed.inject(BiosApi).registerAccount({
      body: { name: 'Nova Pessoa', email, password: 'senha123' },
    });
    const first = TestBed.inject(MockMailbox).latest(email, 'confirmar-email')?.link;

    await submit(user, email);
    await fixture.whenStable();

    const link = await screen.findByRole('link', { name: 'Confirmar o e-mail' });
    expect(link.getAttribute('href')).toMatch(/^\/confirmar-email\//);
    expect(link.getAttribute('href')).not.toBe(first);
  });
});
