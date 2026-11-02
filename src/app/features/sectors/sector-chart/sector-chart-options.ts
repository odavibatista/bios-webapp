import type { SectorScoreWindow } from '../../../core/api/generated';
import { formatAverageConfidence, formatAverageScore, monthLabel } from '../sector-format';

/** As cores das duas séries, tiradas do tema na hora de desenhar. */
export interface SectorChartColors {
  score: string;
  confidence: string;
  text: string;
  grid: string;
}

/** Os nomes das séries, que aparecem na legenda e na dica. */
export const SCORE_SERIES = 'Índice médio';
export const CONFIDENCE_SERIES = 'Confiança média';

/** O que a dica mostra de um mês: as duas médias, separadas, e as contagens. */
export function windowTooltip(window: SectorScoreWindow): string {
  return [
    `<strong>${monthLabel(window.window_start)}</strong>`,
    `${SCORE_SERIES}: ${formatAverageScore(window.average_score)}`,
    `${CONFIDENCE_SERIES}: ${formatAverageConfidence(window.average_confidence)}`,
    `Empresas avaliadas: ${window.company_count}`,
    `Com índice: ${window.scored_company_count}`,
  ].join('<br>');
}

/**
 * As opções do gráfico de linha da evolução (UC10): um ponto por mês, o índice médio e a confiança
 * média em eixos separados (−100 a 100 e 0 a 1), nunca combinados. Média omitida (regra 4) é
 * lacuna na linha, nunca zero: o ponto vai como `null`, e a linha não liga os vizinhos. As duas
 * séries se distinguem também pelo traço e pelo marcador, não só pela cor.
 */
export function sectorChartOptions(
  windows: readonly SectorScoreWindow[],
  colors: SectorChartColors,
): Record<string, unknown> {
  const axisLabel = { color: colors.text };
  const splitLine = { lineStyle: { color: colors.grid } };

  return {
    // O gráfico é decorativo para o leitor de tela: a tabela traz os mesmos números.
    aria: { enabled: false },
    animation: false,
    color: [colors.score, colors.confidence],
    grid: { left: 56, right: 56, top: 40, bottom: 64, containLabel: false },
    legend: { bottom: 0, textStyle: { color: colors.text } },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { dataIndex: number }[]) => {
        const window = windows[params[0]?.dataIndex ?? -1];

        return window ? windowTooltip(window) : '';
      },
    },
    xAxis: {
      type: 'category',
      data: windows.map((window) => monthLabel(window.window_start)),
      axisLabel,
    },
    yAxis: [
      {
        type: 'value',
        name: SCORE_SERIES,
        min: -100,
        max: 100,
        nameTextStyle: { color: colors.text },
        axisLabel,
        splitLine,
      },
      {
        type: 'value',
        name: CONFIDENCE_SERIES,
        min: 0,
        max: 1,
        position: 'right',
        nameTextStyle: { color: colors.text },
        axisLabel,
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: SCORE_SERIES,
        type: 'line',
        yAxisIndex: 0,
        connectNulls: false,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, type: 'solid' },
        data: windows.map((window) => window.average_score),
      },
      {
        name: CONFIDENCE_SERIES,
        type: 'line',
        yAxisIndex: 1,
        connectNulls: false,
        symbol: 'diamond',
        symbolSize: 9,
        lineStyle: { width: 2, type: 'dashed' },
        data: windows.map((window) => window.average_confidence),
      },
    ],
  };
}
