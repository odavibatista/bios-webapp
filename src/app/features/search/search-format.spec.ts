import {
  formatCnpj,
  formatConfidence,
  formatScore,
  NO_CONFIDENCE,
  NO_SCORE,
  statusLabel,
} from './search-format';

describe('formatação dos resultados', () => {
  it('CNPJ com a máscara; outro formato passa como veio', () => {
    expect(formatCnpj('33592510000154')).toBe('33.592.510/0001-54');
    expect(formatCnpj('123')).toBe('123');
  });

  it('situação cadastral como se lê', () => {
    expect(statusLabel('ATIVA')).toBe('Ativa');
    expect(statusLabel('NAO_RECONHECIDA')).toBe('Não reconhecida');
  });

  it('índice com até uma casa, negativo e zero inclusive', () => {
    expect(formatScore(42.25)).toBe('42,3');
    expect(formatScore(-12.5)).toBe('-12,5');
    expect(formatScore(0)).toBe('0');
  });

  it('sem índice é "Sem índice", nunca zero (IND02)', () => {
    expect(formatScore(null)).toBe(NO_SCORE);
    expect(formatScore(undefined)).toBe(NO_SCORE);
    expect(NO_SCORE).toBe('Sem índice');
  });

  it('confiança com duas casas; sem cálculo, o texto próprio', () => {
    expect(formatConfidence(0.625)).toBe('0,63');
    expect(formatConfidence(0)).toBe('0,00');
    expect(formatConfidence(1)).toBe('1,00');
    expect(formatConfidence(null)).toBe(NO_CONFIDENCE);
  });
});
