import type { SectorScoreWindow } from '../../../core/api/generated';
import {
  CONFIDENCE_SERIES,
  SCORE_SERIES,
  scoreBounds,
  sectorChartOptions,
  windowTooltip,
  type SectorMetric,
} from './sector-chart-options';

const COLORS = { score: '#2c5f2d', confidence: '#5b6b5b', text: '#1a1a1a', grid: '#cccccc' };

const OCTOBER: SectorScoreWindow = {
  window_start: '2026-10-01T00:00:00.000Z',
  window_end: '2026-11-01T00:00:00.000Z',
  average_score: 60,
  average_confidence: 0.05,
  company_count: 10,
  scored_company_count: 6,
  rules_version: 'rf10-rf11-v3',
};

const NOVEMBER: SectorScoreWindow = {
  ...OCTOBER,
  window_start: '2026-11-01T00:00:00.000Z',
  window_end: '2026-12-01T00:00:00.000Z',
  average_score: null,
  average_confidence: 0.1,
  company_count: 6,
  scored_company_count: 4,
};

function options(metric: SectorMetric) {
  return sectorChartOptions([OCTOBER, NOVEMBER], COLORS, metric) as {
    xAxis: { data: string[] };
    yAxis: {
      name: string;
      min: number;
      max: number;
      axisLabel: { formatter: (value: number) => string };
    };
    series: { name: string; connectNulls: boolean; data: (number | null)[] }[];
    tooltip: { formatter: (params: { dataIndex: number }[]) => string };
    aria: { enabled: boolean };
  };
}

describe('sectorChartOptions', () => {
  it('cada medida tem seu gráfico, eixo e lacunas próprias', () => {
    const score = options('score');
    const confidence = options('confidence');

    expect(score.xAxis.data).toEqual(['outubro de 2026', 'novembro de 2026']);
    expect(score.yAxis).toMatchObject({ name: SCORE_SERIES, min: 50, max: 70 });
    expect(confidence.yAxis).toMatchObject({ name: CONFIDENCE_SERIES, min: 0, max: 1 });
    expect(score.series[0]?.data).toEqual([60, null]);
    expect(confidence.series[0]?.data).toEqual([0.05, 0.1]);
    expect(score.series[0]?.connectNulls).toBe(false);
    expect(confidence.series[0]?.connectNulls).toBe(false);
  });

  it('os eixos escrevem os números em português', () => {
    expect(options('confidence').yAxis.axisLabel.formatter(0.2)).toBe('0,2');
    expect(options('score').yAxis.axisLabel.formatter(-50)).toBe('-50');
  });

  it('o eixo do índice respeita os limites da escala e a margem da série', () => {
    expect(scoreBounds([{ ...OCTOBER, average_score: -100 }])).toEqual({ min: -100, max: -90 });
    expect(scoreBounds([{ ...OCTOBER, average_score: 100 }])).toEqual({ min: 90, max: 100 });
    expect(scoreBounds([{ ...OCTOBER, average_score: null }])).toEqual({ min: -100, max: 100 });
  });

  it('a dica mostra apenas a medida do gráfico, com as contagens', () => {
    expect(options('score').tooltip.formatter([{ dataIndex: 1 }])).toBe(
      windowTooltip(NOVEMBER, 'score'),
    );
    expect(windowTooltip(NOVEMBER, 'confidence')).toBe(
      '<strong>novembro de 2026</strong><br>Confiança média: 0,10<br>' +
        'Empresas avaliadas: 6<br>Com índice: 4',
    );
    expect(options('score').tooltip.formatter([])).toBe('');
  });

  it('usa rótulo acessível próprio no componente e deixa os números na tabela', () => {
    expect(options('score').aria.enabled).toBe(false);
    expect(options('confidence').aria.enabled).toBe(false);
  });
});
