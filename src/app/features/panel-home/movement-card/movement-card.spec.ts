import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import type { CompanyMovementItem } from '../../../core/api/generated';
import { MovementCard } from './movement-card';

const ITEM: CompanyMovementItem = {
  cnpj: '33592510000154',
  legal_name: 'Empresa de Exemplo S.A.',
  trade_name: 'Exemplo',
  city: 'SÃO PAULO',
  uf: 'SP',
  moved_at: '2026-11-03T00:00:00.000Z',
  ods: [
    { ods_number: 13, score_value: null, confidence_value: 0, movement: null },
    {
      ods_number: 15,
      score_value: -40,
      confidence_value: 0.33,
      movement: {
        direction: 'DECREASED',
        cause: 'EVIDENCE_ADDED',
        evidence_category: 'CONDUTA_ADMINISTRATIVA',
        moved_at: '2026-11-03T00:00:00.000Z',
      },
    },
  ],
};

describe('MovementCard', () => {
  async function renderCard(item = ITEM) {
    return render(MovementCard, { inputs: { item }, providers: [provideRouter([])] });
  }

  it('identifica a empresa e leva ao perfil', async () => {
    await renderCard();

    expect(screen.getByRole('link', { name: 'Empresa de Exemplo S.A.' }).getAttribute('href')).toBe(
      '/empresas/33592510000154',
    );
    expect(screen.getByText('Exemplo')).toBeTruthy();
    expect(screen.getByText('SÃO PAULO/SP · CNPJ 33.592.510/0001-54')).toBeTruthy();
  });

  it('sem nome fantasia, não deixa linha vazia', async () => {
    const { container } = await renderCard({ ...ITEM, trade_name: null });

    expect(container.querySelector('.trade-name')).toBeNull();
  });

  it('mostra índice e confiança separados, com sentido, causa e data', async () => {
    await renderCard();

    expect(screen.getByText('Índice -40')).toBeTruthy();
    expect(screen.getByText('Confiança 0,33')).toBeTruthy();
    expect(screen.getByText('Índice desceu')).toBeTruthy();
    expect(screen.getByText('Sanção administrativa registrada, em 03/11/2026')).toBeTruthy();
  });

  it('ODS sem índice aparece como sem índice, nunca zero (IND02)', async () => {
    await renderCard();

    expect(screen.getByText('Sem índice')).toBeTruthy();
    expect(screen.queryByText(/Índice 0/)).toBeNull();
  });

  it('o ícone é decorativo: o sentido está no texto', async () => {
    const { container } = await renderCard();

    expect(container.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('não mostra variação nem julga a empresa (IND01, IND03)', async () => {
    const { container } = await renderCard();

    expect(container.textContent).not.toMatch(/anterior|variação|melhor|pior|sustent/i);
  });
});
