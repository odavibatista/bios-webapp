import { render, screen, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import primeiraConsulta from '../../../core/mocks/fixtures/getCompanyProfile/primeira-consulta';
import foxStore from '../../../core/mocks/fixtures/getCompanyProfile/fox-store';
import { OdsScores } from './ods-scores';

const PROFILE = acoCearense.body as CompanyFullProfileResponse;
const PENDING = primeiraConsulta.body as CompanyFullProfileResponse;
const FOX = foxStore.body as CompanyFullProfileResponse;

describe('OdsScores', () => {
  it('cria cartões independentes em ordem numérica, com índice e confiança lado a lado', async () => {
    await render(OdsScores, {
      inputs: { profile: { ...PROFILE, ods_scores: [...PROFILE.ods_scores].reverse() } },
    });

    const region = screen.getByRole('region', { name: 'Índices por ODS' });
    const cards = within(region).getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole('heading', { name: 'ODS 13' })).toBeTruthy();
    expect(within(cards[1]).getByRole('heading', { name: 'ODS 15' })).toBeTruthy();
    expect(cards[0].textContent).toContain('Sem evidência conclusiva');
    expect(cards[0].textContent).toContain('0,00');
    expect(cards[1].textContent).toContain('-80');
    expect(cards[1].textContent).toContain('0,50');
    expect(
      within(cards[1]).getByRole('img', {
        name: /Índice do ODS 15: -80 numa escala de −100 a 100/,
      }),
    ).toBeTruthy();
    expect(region.textContent).not.toMatch(/índice geral|é sustentável|não é sustentável/i);
  });

  it('índice pendente não exibe número nem escala e explica o prazo de recálculo', async () => {
    await render(OdsScores, { inputs: { profile: PENDING } });

    const region = screen.getByRole('region', { name: 'Índices por ODS' });
    expect(within(region).getAllByText('Índice pendente')).toHaveLength(2);
    expect(within(region).queryByRole('img')).toBeNull();
    expect(within(region).getByRole('status').textContent).toContain(
      'Recarregue o perfil em cerca de 30 segundos',
    );
    expect(region.textContent).not.toContain('0,00');
  });

  it('abre a explicação do ODS com pontos, soma e links rastreáveis', async () => {
    const user = userEvent.setup();
    await render(OdsScores, { inputs: { profile: PROFILE } });
    const card = screen.getByRole('article', { name: 'ODS 15' });

    await user.click(within(card).getByText('Como o índice foi calculado para o ODS 15'));

    expect(within(card).getAllByText('Pontos: -40')).toHaveLength(2);
    expect(within(card).getByText('Soma dos pontos:').textContent).toContain('-80');
    expect(within(card).getAllByRole('button', { name: 'Ver evidência no perfil' })).toHaveLength(
      2,
    );
    expect(within(card).getAllByRole('link', { name: 'Consultar na fonte original' })).toHaveLength(
      2,
    );
  });

  it('explica ODS sem contribuição e exibe os centésimos do índice calculado', async () => {
    await render(OdsScores, { inputs: { profile: FOX } });
    const unavailable = screen.getByRole('article', { name: 'ODS 13' });
    const calculated = screen.getByRole('article', { name: 'ODS 15' });

    expect(unavailable.textContent).toContain('Não houve evidência conclusiva');
    expect(calculated.textContent).toContain('-6,25');
    expect(calculated.textContent).toContain('Peso reduzido');
  });
});
