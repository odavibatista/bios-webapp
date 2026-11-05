import type { SectorScoreWindow } from '../../../core/api/generated';
import { formatAverageConfidence, formatAverageScore, monthLabel } from '../sector-format';

export interface SectorChartColors {
  score: string;
  confidence: string;
  text: string;
  grid: string;
}

export type SectorMetric = 'score' | 'confidence';
export const SCORE_SERIES = 'Índice médio';
export const CONFIDENCE_SERIES = 'Confiança média';

const AXIS_NUMBER = new Intl.NumberFormat('pt-BR');

/** A escala do índice acompanha os valores observados, sem mudar sua faixa possível. */
export function scoreBounds(windows: readonly SectorScoreWindow[]): { min: number; max: number } {
  const values = windows
    .map((window) => window.average_score)
    .filter((value): value is number => value !== null);
  if (values.length === 0) return { min: -100, max: 100 };

  return {
    min: Math.max(-100, Math.floor((Math.min(...values) - 10) / 10) * 10),
    max: Math.min(100, Math.ceil((Math.max(...values) + 10) / 10) * 10),
  };
}

/** O detalhe de um mês na série escolhida, com as contagens do agregado. */
export function windowTooltip(window: SectorScoreWindow, metric: SectorMetric): string {
  const average =
    metric === 'score'
      ? `${SCORE_SERIES}: ${formatAverageScore(window.average_score)}`
      : `${CONFIDENCE_SERIES}: ${formatAverageConfidence(window.average_confidence)}`;

  return [
    `<strong>${monthLabel(window.window_start)}</strong>`,
    average,
    `Empresas avaliadas: ${window.company_count}`,
    `Com índice: ${window.scored_company_count}`,
  ].join('<br>');
}

/** Cada medida tem seu próprio gráfico e eixo; lacunas da API continuam nulas. */
export function sectorChartOptions(
  windows: readonly SectorScoreWindow[],
  colors: SectorChartColors,
  metric: SectorMetric,
): Record<string, unknown> {
  const score = metric === 'score';
  const bounds = score ? scoreBounds(windows) : { min: 0, max: 1 };

  return {
    aria: { enabled: false },
    animation: false,
    color: [score ? colors.score : colors.confidence],
    grid: { left: 64, right: 24, top: 40, bottom: 48, containLabel: false },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { dataIndex: number }[]) => {
        const window = windows[params[0]?.dataIndex ?? -1];
        return window ? windowTooltip(window, metric) : '';
      },
    },
    xAxis: {
      type: 'category',
      data: windows.map((window) => monthLabel(window.window_start)),
      axisLabel: { color: colors.text },
    },
    yAxis: {
      type: 'value',
      name: score ? SCORE_SERIES : CONFIDENCE_SERIES,
      ...bounds,
      nameTextStyle: { color: colors.text },
      axisLabel: { color: colors.text, formatter: (value: number) => AXIS_NUMBER.format(value) },
      splitLine: { lineStyle: { color: colors.grid } },
    },
    series: [
      {
        name: score ? SCORE_SERIES : CONFIDENCE_SERIES,
        type: 'line',
        connectNulls: false,
        symbol: score ? 'circle' : 'diamond',
        symbolSize: 9,
        lineStyle: { width: 3 },
        data: windows.map((window) => (score ? window.average_score : window.average_confidence)),
      },
    ],
  };
}
