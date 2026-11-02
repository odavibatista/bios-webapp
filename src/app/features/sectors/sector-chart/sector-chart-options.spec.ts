import type { SectorScoreWindow } from '../../../core/api/generated';
import {
  CONFIDENCE_SERIES,
  SCORE_SERIES,
  sectorChartOptions,
  windowTooltip,
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

interface Axis {
  min: number;
  max: number;
  name: string;
}
interface Series {
  name: string;
  yAxisIndex: number;
  connectNulls: boolean;
  data: (number | null)[];
}

function options(windows: SectorScoreWindow[]) {
  return sectorChartOptions(windows, COLORS) as {
    xAxis: { data: string[] };
    yAxis: Axis[];
    series: Series[];
    tooltip: { formatter: (params: { dataIndex: number }[]) => string };
    aria: { enabled: boolean };
  };
}

describe('sectorChartOptions', () => {
  it('um ponto por mês, na ordem das janelas da API, sem gerar mês nenhum', () => {
    expect(options([OCTOBER, NOVEMBER]).xAxis.data).toEqual([
      'outubro de 2026',
      'novembro de 2026',
    ]);
  });

  it('índice e confiança em eixos separados, nas faixas de cada um, nunca combinados', () => {
    const { yAxis, series } = options([OCTOBER, NOVEMBER]);

    expect(yAxis.map((axis) => [axis.name, axis.min, axis.max])).toEqual([
      [SCORE_SERIES, -100, 100],
      [CONFIDENCE_SERIES, 0, 1],
    ]);
    expect(series.map((item) => [item.name, item.yAxisIndex])).toEqual([
      [SCORE_SERIES, 0],
      [CONFIDENCE_SERIES, 1],
    ]);
  });

  it('média omitida é lacuna na linha, nunca zero', () => {
    const [score, confidence] = options([OCTOBER, NOVEMBER]).series;

    expect(score?.data).toEqual([60, null]);
    expect(confidence?.data).toEqual([0.05, 0.1]);
    expect(score?.connectNulls).toBe(false);
  });

  it('a dica de cada mês traz as duas médias e as contagens', () => {
    const { tooltip } = options([OCTOBER, NOVEMBER]);

    expect(tooltip.formatter([{ dataIndex: 1 }])).toBe(windowTooltip(NOVEMBER));
    expect(windowTooltip(NOVEMBER)).toBe(
      '<strong>novembro de 2026</strong><br>Índice médio: Omitida<br>' +
        'Confiança média: 0,10<br>Empresas avaliadas: 6<br>Com índice: 4',
    );
    expect(tooltip.formatter([])).toBe('');
  });

  it('fica fora da árvore de acessibilidade: a tabela traz os mesmos números', () => {
    expect(options([OCTOBER]).aria.enabled).toBe(false);
  });
});
