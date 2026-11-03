import type { CompanyOdsScore } from '../../../core/api/generated';
import { formatConfidence, formatScore } from '../../search/search-format';

const COVERAGE: Record<NonNullable<CompanyOdsScore['coverage_status']>, string> = {
  HAS_RECORDS: 'Há registros nas fontes consultadas para este ODS.',
  NO_RECORDS_IN_ALL_SOURCES: 'As fontes consultadas não apresentaram registros para este ODS.',
  NO_RECORDS_IN_SOME_SOURCES:
    'Algumas fontes consultadas não apresentaram registros para este ODS.',
  NO_DATA: 'Ainda não há dados suficientes das fontes para avaliar este ODS.',
};

/** Texto e posição da escala derivam do estado, sem transformar ausência em zero. */
export function presentScore(score: CompanyOdsScore) {
  const pending = score.calculation_status === 'PENDING';
  const value = !pending && score.index_status === 'AVAILABLE' ? score.score_value : null;

  return {
    ...score,
    pending,
    scoreLabel: pending
      ? 'Índice pendente'
      : value === null
        ? 'Sem evidência conclusiva'
        : formatScore(value),
    confidenceLabel: pending ? 'Pendente' : formatConfidence(score.confidence_value),
    coverageLabel: pending ? null : score.coverage_status ? COVERAGE[score.coverage_status] : null,
    position: value === null ? null : (value + 100) / 2,
  };
}
