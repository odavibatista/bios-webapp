import { render, screen } from '@testing-library/angular';
import type { CompanyAnalytics } from '../../../core/api/generated';
import { OverviewTotals } from './overview-totals';

const ANALYTICS = {
  companies: 110372,
  totals: {
    confirmed_evidences: 246401,
    fine_notices: 211048,
    fine_amount: 44590682920.21,
    area_hectares: 7572531.7,
  },
  ods: [{ ods_number: 13, companies_with_index: 972 }],
} as CompanyAnalytics;

const valueOf = (label: string) => screen.getByText(label).nextElementSibling?.textContent;

describe('OverviewTotals', () => {
  it('sem área nos autos, diz que falta o dado, e não que é zero', async () => {
    await render(OverviewTotals, {
      inputs: {
        analytics: { ...ANALYTICS, totals: { ...ANALYTICS.totals, area_hectares: 0 } },
      },
    });

    expect(screen.getByText('Hectares nos autos').parentElement?.textContent).toContain('Sem dado');
  });

  it('mostra os totais, com a multa como valor lançado', async () => {
    await render(OverviewTotals, { inputs: { analytics: ANALYTICS } });

    expect(valueOf('Empresas na base')).toBe('110.372');
    expect(valueOf('Autos com multa')).toBe('211.048');
    expect(valueOf('Valor lançado em multas')).toMatch(/^R\$\s44,6\sbi$/);
    expect(valueOf('Com índice no ODS 13')).toBe('972');
    expect(screen.queryByText(/valor pago/i)).toBeNull();
  });

  it('avisa que a base não representa todas as empresas do Brasil', async () => {
    await render(OverviewTotals, { inputs: { analytics: ANALYTICS } });

    expect(
      screen.getByText(
        /Números das empresas na base, formada por empresas com registros\. Não representam todas as empresas do Brasil\./,
      ),
    ).toBeTruthy();
  });

  it('sem dados, reserva o espaço e avisa o leitor de tela', async () => {
    await render(OverviewTotals, { inputs: { analytics: null } });

    expect(
      screen.getByRole('group', { name: 'Calculando os totais…' }).getAttribute('aria-busy'),
    ).toBe('true');
  });

  it('recarregando, segura os números anteriores', async () => {
    const { container } = await render(OverviewTotals, {
      inputs: { analytics: ANALYTICS, loading: true },
    });

    expect(container.querySelector('.stale')).not.toBeNull();
    expect(screen.getByText('110.372')).toBeTruthy();
  });
});
