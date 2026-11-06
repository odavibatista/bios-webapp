import type { CompanyOdsScore } from '../../../core/api/generated';
import { presentScore, presentSectorAverage } from './score-presentation';

const SCORE: CompanyOdsScore = {
  ods_number: 13,
  calculation_status: 'CALCULATED',
  index_status: 'AVAILABLE',
  score_value: -40,
  confidence_value: 0.35,
  evidence_count: 2,
  coverage_status: 'HAS_RECORDS',
  sources_without_records: [],
  rules_version: 'rf10-rf11-v3',
  calculated_at: '2026-10-30T12:00:00.000Z',
  contributions: [],
};

describe('presentScore', () => {
  it('mantém o índice separado da confiança e posiciona o zero no centro', () => {
    expect(presentScore(SCORE)).toMatchObject({
      scoreLabel: '-40',
      confidenceLabel: '0,35',
      coverageLabel: 'Há registros nas fontes consultadas para este ODS.',
      position: 30,
      fillStart: 30,
      fillWidth: 20,
    });
    expect(presentScore({ ...SCORE, score_value: 0 }).position).toBe(50);
    expect(presentScore({ ...SCORE, score_value: 40 })).toMatchObject({
      fillStart: 50,
      fillWidth: 20,
    });
  });

  it('sem evidência conclusiva mostra confiança mínima sem converter ausência em zero', () => {
    expect(
      presentScore({
        ...SCORE,
        index_status: 'UNAVAILABLE',
        score_value: null,
        confidence_value: 0,
      }),
    ).toMatchObject({
      scoreLabel: 'Sem evidência conclusiva',
      confidenceLabel: '0,00',
      position: null,
      fillStart: null,
      fillWidth: null,
    });
  });

  it('índice pendente não mostra número nem barra, mesmo se a resposta trouxer valores antigos', () => {
    expect(presentScore({ ...SCORE, calculation_status: 'PENDING' })).toMatchObject({
      scoreLabel: 'Índice pendente',
      confidenceLabel: 'Pendente',
      position: null,
    });
  });

  it.each([
    ['NO_RECORDS_IN_ALL_SOURCES', 'As fontes consultadas não apresentaram registros'],
    ['NO_RECORDS_IN_SOME_SOURCES', 'Algumas fontes consultadas não apresentaram registros'],
    ['NO_DATA', 'Ainda não há dados suficientes'],
  ] as const)('cobertura %s é explicada sem veredito', (coverage_status, text) => {
    expect(presentScore({ ...SCORE, coverage_status }).coverageLabel).toContain(text);
  });
});

describe('presentSectorAverage', () => {
  it('situa a média na mesma escala do índice', () => {
    expect(presentSectorAverage(-50)).toEqual({ label: '-50', position: 25 });
  });

  it('sem média publicada, não há marca', () => {
    expect(presentSectorAverage(undefined)).toBeNull();
  });
});
