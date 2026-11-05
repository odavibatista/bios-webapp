import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { PRIVACY_CONTACT } from './privacy-contact';
import { PrivacyPage } from './privacy-page';

describe('PrivacyPage', () => {
  beforeEach(async () => {
    await render(PrivacyPage, { providers: [provideRouter([])] });
  });

  it('explica como pedir a remoção, com o contato e a comprovação da titularidade', () => {
    expect(screen.getByRole('heading', { name: 'Pedir a remoção de um cadastro' })).toBeTruthy();
    expect(screen.getByText(/comprovação de que você é o titular/)).toBeTruthy();

    for (const link of screen.getAllByRole('link', { name: PRIVACY_CONTACT })) {
      expect(link.getAttribute('href')).toContain(`mailto:${PRIVACY_CONTACT}`);
    }
  });

  it('diz que o nome e o endereço do empresário individual são dados pessoais', () => {
    expect(screen.getByText(/continuam sendo dados pessoais/)).toBeTruthy();
  });

  it('limita o uso: sem decisão automática sobre uma pessoa', () => {
    expect(
      screen.getByText('Não use o índice como decisão automática sobre uma pessoa.'),
    ).toBeTruthy();
  });

  it('informa que outros sites e a Receita precisam de pedidos próprios', () => {
    expect(screen.getByText(/O pedido vale para o BIOS/)).toBeTruthy();
  });
});
