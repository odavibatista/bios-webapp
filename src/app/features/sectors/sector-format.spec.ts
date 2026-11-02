import type { SectorScoreWindow } from '../../core/api/generated';
import {
  formatAverageConfidence,
  formatAverageScore,
  hasOmittedAverage,
  monthLabel,
  OMITTED_AVERAGE,
} from './sector-format';

function window(patch: Partial<SectorScoreWindow> = {}): SectorScoreWindow {
  return {
    window_start: '2026-10-01T00:00:00.000Z',
    window_end: '2026-11-01T00:00:00.000Z',
    average_score: 60,
    average_confidence: 0.05,
    company_count: 10,
    scored_company_count: 6,
    rules_version: 'rf10-rf11-v3',
    ...patch,
  };
}

describe('formatação da evolução setorial', () => {
  it('o mês é o da janela em UTC, por extenso', () => {
    expect(monthLabel('2026-10-01T00:00:00.000Z')).toBe('outubro de 2026');
    // Em Brasília ainda seria 31/10; a janela da API é o mês de novembro, em UTC.
    expect(monthLabel('2026-11-01T00:00:00.000Z')).toBe('novembro de 2026');
  });

  it('índice médio com até uma casa; omitido nunca vira zero', () => {
    expect(formatAverageScore(-74.28571428571429)).toBe('-74,3');
    expect(formatAverageScore(60)).toBe('60');
    expect(formatAverageScore(0)).toBe('0');
    expect(formatAverageScore(null)).toBe(OMITTED_AVERAGE);
  });

  it('confiança média com duas casas; omitida nunca vira zero', () => {
    expect(formatAverageConfidence(0.4325396825396825)).toBe('0,43');
    expect(formatAverageConfidence(0)).toBe('0,00');
    expect(formatAverageConfidence(null)).toBe(OMITTED_AVERAGE);
  });

  it('acusa média omitida no índice ou na confiança', () => {
    expect(hasOmittedAverage([window()])).toBe(false);
    expect(hasOmittedAverage([window(), window({ average_score: null })])).toBe(true);
    expect(hasOmittedAverage([window({ average_confidence: null })])).toBe(true);
    expect(hasOmittedAverage([])).toBe(false);
  });
});
