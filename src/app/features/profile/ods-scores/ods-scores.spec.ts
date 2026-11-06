import { render, screen, waitFor, within } from '@testing-library/angular';
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
    const fill = cards[1].querySelector<HTMLElement>('.fill');
    expect(fill?.style.left).toBe('10%');
    expect(fill?.style.width).toBe('40%');
    expect(region.textContent).not.toMatch(/índice geral|é sustentável|não é sustentável/i);
  });

  it('marca a média do setor no medidor, sem comparar nem julgar', async () => {
    const odsNumber = PROFILE.ods_scores.find((item) => item.score_value !== null)?.ods_number ?? 0;
    const { container } = await render(OdsScores, {
      inputs: { profile: PROFILE, sectorAverages: { [odsNumber]: -37.5 } },
    });

    expect(container.querySelectorAll('.sector-mark')).toHaveLength(1);
    expect(screen.getByText('Média do setor: -37,5')).toBeTruthy();
    expect(container.textContent).not.toMatch(/acima|abaixo|melhor|pior/i);
  });

  it('setor sem média publicada não tem marca', async () => {
    const { container } = await render(OdsScores, { inputs: { profile: PROFILE } });

    expect(container.querySelector('.sector-mark')).toBeNull();
    expect(screen.queryByText(/Média do setor/)).toBeNull();
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

    await waitFor(() => expect(within(card).getAllByText('Pontos: -40')).toHaveLength(2));

    expect(within(card).getByText('Soma dos pontos:').textContent).toContain('-80');
    expect(within(card).getAllByRole('button', { name: 'Ver evidência no perfil' })).toHaveLength(
      2,
    );
    expect(within(card).getAllByRole('link', { name: 'Consultar na fonte original' })).toHaveLength(
      2,
    );
  });

  it('só cria 20 contribuições ao abrir e conserva o trecho ao reabrir', async () => {
    const user = userEvent.setup();
    const score = PROFILE.ods_scores.find((item) => item.ods_number === 15)!;
    const contributions = Array.from({ length: 2535 }, (_, index) => ({
      ...score.contributions[0],
      evidence: { ...score.contributions[0].evidence, id: `teste-${index}` },
    }));
    const evidence = PROFILE.evidences[0].evidences[0];
    const profile = {
      ...PROFILE,
      ods_scores: [{ ...score, contributions }],
      evidences: [
        {
          ...PROFILE.evidences[0],
          evidences: contributions.map((item) => ({ ...evidence, id: item.evidence.id })),
        },
      ],
    } satisfies CompanyFullProfileResponse;
    const { container, fixture } = await render(OdsScores, { inputs: { profile } });
    const detail = container.querySelector<HTMLDetailsElement>('.explanation')!;
    const entries = () => detail.querySelectorAll('.contributions li');

    expect(entries()).toHaveLength(0);
    await user.click(within(detail).getByText('Como o índice foi calculado para o ODS 15'));
    await waitFor(() => expect(entries()).toHaveLength(20));
    expect(detail.textContent).toContain('Mostrando 20 de 2.535 contribuições');
    expect(detail.textContent).toContain('Soma dos pontos: -101.400');

    await user.click(within(detail).getByRole('button', { name: 'Mostrar mais' }));
    await waitFor(() => expect(entries()).toHaveLength(40));
    const requested = vi.fn();
    fixture.componentInstance.evidenceRequested.subscribe(requested);
    await user.click(
      within(entries()[20] as HTMLElement).getByRole('button', { name: 'Ver evidência no perfil' }),
    );
    expect(requested).toHaveBeenCalledWith('evidencia-teste-20');
    await user.click(within(detail).getByText('Como o índice foi calculado para o ODS 15'));
    await waitFor(() => expect(entries()).toHaveLength(0));
    await user.click(within(detail).getByText('Como o índice foi calculado para o ODS 15'));
    await waitFor(() => expect(entries()).toHaveLength(40));
  });

  it('explica ODS sem contribuição e exibe os centésimos do índice calculado', async () => {
    const user = userEvent.setup();
    await render(OdsScores, { inputs: { profile: FOX } });
    const unavailable = screen.getByRole('article', { name: 'ODS 13' });
    const calculated = screen.getByRole('article', { name: 'ODS 15' });

    await user.click(within(unavailable).getByText('Como o índice foi calculado para o ODS 13'));
    await user.click(within(calculated).getByText('Como o índice foi calculado para o ODS 15'));
    await waitFor(() => expect(calculated.textContent).toContain('Peso reduzido'));
    expect(unavailable.textContent).toContain('Não houve evidência conclusiva');
    expect(calculated.textContent).toContain('-6,25');
  });
});
