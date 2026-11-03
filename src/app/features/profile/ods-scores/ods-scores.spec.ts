import { render, screen, within } from '@testing-library/angular';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import primeiraConsulta from '../../../core/mocks/fixtures/getCompanyProfile/primeira-consulta';
import { OdsScores } from './ods-scores';

const PROFILE = acoCearense.body as CompanyFullProfileResponse;
const PENDING = primeiraConsulta.body as CompanyFullProfileResponse;

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
});
