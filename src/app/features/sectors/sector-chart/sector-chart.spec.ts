import { render, screen } from '@testing-library/angular';
import type { SectorScoreWindow } from '../../../core/api/generated';
import { SectorChart } from './sector-chart';

const WINDOWS: SectorScoreWindow[] = [
  {
    window_start: '2026-10-01T00:00:00.000Z',
    window_end: '2026-11-01T00:00:00.000Z',
    average_score: 60,
    average_confidence: 0.05,
    company_count: 10,
    scored_company_count: 6,
    rules_version: 'rf10-rf11-v3',
  },
  {
    window_start: '2026-11-01T00:00:00.000Z',
    window_end: '2026-12-01T00:00:00.000Z',
    average_score: 55,
    average_confidence: 0.1,
    company_count: 11,
    scored_company_count: 7,
    rules_version: 'rf10-rf11-v3',
  },
];

/** O jsdom não tem `ResizeObserver`, que o `ngx-echarts` usa para redesenhar ao mudar o tamanho. */
class NoopResizeObserver {
  observe(): void {
    // nada a observar no jsdom
  }
  unobserve(): void {
    // idem
  }
  disconnect(): void {
    // idem
  }
}

describe('SectorChart', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', NoopResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('é uma imagem com resumo, que aponta para a tabela com os mesmos números', async () => {
    await render(SectorChart, {
      inputs: { windows: WINDOWS, subject: 'METALURGIA no ODS 13' },
    });

    const chart = screen.getByRole('img', { name: /Gráfico da evolução de METALURGIA no ODS 13/ });

    expect(chart.getAttribute('aria-label')).toContain('Os mesmos números estão na tabela.');
  });
});
