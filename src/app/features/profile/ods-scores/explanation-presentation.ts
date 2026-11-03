import type {
  CompanyFullProfileResponse,
  CompanyOdsScore,
  ScoreContribution,
} from '../../../core/api/generated';
import { CATEGORY_LABELS, safeSourceUrl } from '../environmental-evidences/evidence-presentation';
import { formatScorePoints } from './score-presentation';

const WEIGHT_REASONS: Record<NonNullable<ScoreContribution['weight_reason']>, string> = {
  CGU_SANCTION_EXPIRED: 'Peso reduzido: o período informado da sanção terminou.',
  IBAMA_EMBARGO_LIFTED: 'Peso reduzido: o embargo foi levantado.',
};

/** Usa apenas a evidência do mesmo perfil; nunca inventa um destino de origem. */
export function presentExplanation(
  score: CompanyOdsScore,
  evidences: CompanyFullProfileResponse['evidences'],
) {
  const evidenceIds = new Set(evidences.flatMap((group) => group.evidences.map((item) => item.id)));
  const contributions = score.contributions.map((item) => {
    const reference = item.evidence.source_reference?.trim() ?? null;
    return {
      id: item.evidence.id,
      source: item.evidence.source,
      category: CATEGORY_LABELS[item.evidence.category],
      reference: reference === '' ? null : reference,
      sourceUrl: safeSourceUrl(item.evidence.source_url),
      evidenceAnchor: evidenceIds.has(item.evidence.id) ? `evidencia-${item.evidence.id}` : null,
      signalLabel: item.signal === 'POSITIVE' ? 'Positivo' : 'Negativo',
      weightLabel: formatScorePoints(item.weight),
      pointsLabel: formatScorePoints(item.points),
      weightReason: item.weight_reason ? WEIGHT_REASONS[item.weight_reason] : null,
      outdated: item.evidence.current_state === 'OUTDATED',
    };
  });

  return {
    contributions,
    totalLabel: formatScorePoints(score.contributions.reduce((sum, item) => sum + item.points, 0)),
  };
}
