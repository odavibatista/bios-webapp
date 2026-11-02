import type { SectorScoreWindow } from '../../core/api/generated';

/** Média que a API omitiu por amostra mínima (UC10, regra 4): lacuna explicada, nunca zero. */
export const OMITTED_AVERAGE = 'Omitida';

/** Por que uma média aparece como omitida, ao lado das contagens, que continuam visíveis. */
export const OMITTED_AVERAGE_NOTE =
  'Média omitida: o setor tem menos empresas que o mínimo exigido para que a média não revele ' +
  'o índice ou a confiança de nenhuma delas. As contagens continuam visíveis.';

const SCORE = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const CONFIDENCE = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const MONTH = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** O mês da janela (`outubro de 2026`). A janela é o mês em UTC, como a API a grava. */
export function monthLabel(windowStart: string): string {
  return MONTH.format(new Date(windowStart));
}

/** Índice médio (−100 a 100), com até uma casa; omitido, "Omitida". */
export function formatAverageScore(score: number | null): string {
  return score === null ? OMITTED_AVERAGE : SCORE.format(score);
}

/** Confiança média (0 a 1), com duas casas, sempre separada do índice; omitida, "Omitida". */
export function formatAverageConfidence(confidence: number | null): string {
  return confidence === null ? OMITTED_AVERAGE : CONFIDENCE.format(confidence);
}

/** Se alguma janela tem média omitida, para a tela explicar a lacuna. */
export function hasOmittedAverage(windows: readonly SectorScoreWindow[]): boolean {
  return windows.some(
    (window) => window.average_score === null || window.average_confidence === null,
  );
}
