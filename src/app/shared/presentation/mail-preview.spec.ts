import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { MockMailbox } from '../../core/mocks/mock-mailbox';
import { PRESENTATION_MODE } from '../../core/presentation-mode';
import { MailPreview } from './mail-preview';

async function renderPreview(presentation: boolean, to = 'Pessoa@Example.com ') {
  return render(MailPreview, {
    inputs: { to, kind: 'confirmar-email' },
    providers: [provideRouter([]), { provide: PRESENTATION_MODE, useValue: presentation }],
  });
}

function send(link: string, kind: 'confirmar-email' | 'redefinir-senha' = 'confirmar-email') {
  TestBed.inject(MockMailbox).send({
    to: 'pessoa@example.com',
    kind,
    link,
    sentAt: '2026-10-31T12:00:00.000Z',
  });
}

describe('MailPreview', () => {
  it('na apresentação, mostra como hiperlink o link mais recente que o e-mail traria', async () => {
    const { fixture } = await renderPreview(true);

    send('/confirmar-email/antigo');
    send('/redefinir-senha/outro-tipo', 'redefinir-senha');
    send('/confirmar-email/novo');
    await fixture.whenStable();

    const preview = screen.getByRole('complementary', { name: 'Modo apresentação' });
    expect(preview.textContent).toContain('pessoa@example.com');
    expect(screen.getByRole('link', { name: 'Confirmar o e-mail' }).getAttribute('href')).toBe(
      '/confirmar-email/novo',
    );
  });

  it('na apresentação, diz quando a caixa de entrada não recebeu nada', async () => {
    await renderPreview(true);

    expect(screen.getByRole('complementary').textContent).toContain(
      'pessoa@example.com não recebeu e-mail com link',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('com a API real, o aviso não existe', async () => {
    await renderPreview(false);
    send('/confirmar-email/qualquer');

    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.queryByText(/Modo apresentação/)).toBeNull();
  });
});
