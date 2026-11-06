import type {
  CompanyEvidence,
  CompanyMovementItem,
  CompanyMovementOds,
  OdsMovement,
  ScoreContribution,
} from '../api/generated';
import type { CompanySnapshot } from './company-archive';

/** Quantas empresas a base publicada leva na lista: a tela não precisa da base inteira. */
export const PUBLISHED_MOVEMENTS_LIMIT = 5_000;

/**
 * Quando o fato registrado pela evidência aconteceu: a publicação ou, sem ela, o início da sanção
 * (CEIS/CNEP) ou o fim do ano do inventário (GHG). A data de coleta nunca entra: ela diz quando o
 * BIOS leu o dado, e uma sanção antiga apareceria como se fosse de hoje.
 */
export function factDate({ published_at: published, details }: CompanyEvidence): string | null {
  if (published) return published;

  const { startDate, inventoryYear } = (details ?? {}) as Record<string, unknown>;

  if (typeof startDate === 'string' && !Number.isNaN(Date.parse(startDate))) {
    return new Date(startDate).toISOString();
  }

  return typeof inventoryYear === 'number' ? `${inventoryYear}-12-31T00:00:00.000Z` : null;
}

export function evidenceDates(
  company: Pick<CompanySnapshot, 'profile'>,
): ReadonlyMap<string, string> {
  return new Map(
    company.profile.evidences.flatMap(({ evidences }) =>
      evidences.flatMap((evidence) => {
        const date = factDate(evidence);

        return date ? [[evidence.id, date] as const] : [];
      }),
    ),
  );
}

/**
 * A mesma reconstrução da API (UC15, regra 8): na base publicada não há histórico de recálculos,
 * então a movimentação sai da evidência mais recente que pontua. Foi ela que deu ao índice o
 * valor atual. Sem data utilizável, ou só com data futura, não há o que afirmar.
 */
function reconstructed(
  contributions: readonly ScoreContribution[],
  dates: ReadonlyMap<string, string>,
  now: number,
): OdsMovement | null {
  const scoring = contributions.filter(({ points }) => points !== 0);
  const [latest] = scoring
    .flatMap((contribution) => {
      const date = dates.get(contribution.evidence.id);

      return date && Date.parse(date) <= now ? [{ contribution, date }] : [];
    })
    .sort(
      (a, b) =>
        Date.parse(b.date) - Date.parse(a.date) ||
        Math.abs(b.contribution.points) - Math.abs(a.contribution.points) ||
        a.contribution.evidence.id.localeCompare(b.contribution.evidence.id),
    );

  if (!latest) return null;

  const { contribution, date } = latest;
  const signed = contribution.points > 0 ? 'INCREASED' : 'DECREASED';

  return {
    direction: scoring.length === 1 ? 'AVAILABLE' : signed,
    cause: 'EVIDENCE_ADDED',
    evidence_category: contribution.evidence.category,
    moved_at: date,
  };
}

/** A empresa na lista de movimentações; `null` quando não há nada a mostrar nela. */
export function companyMovementOf(
  company: CompanySnapshot,
  now: number,
): CompanyMovementItem | null {
  const { profile, explanations } = company;
  const dates = evidenceDates(company);
  const ods: CompanyMovementOds[] = profile.ods_scores.map((score) => ({
    ods_number: score.ods_number,
    score_value: score.score_value,
    confidence_value: score.confidence_value,
    movement:
      score.score_value === null
        ? null
        : reconstructed(explanations[score.ods_number]?.contributions ?? [], dates, now),
  }));
  const moments = ods.flatMap(({ movement }) => (movement ? [movement.moved_at] : []));

  if (!moments.length) return null;

  return {
    cnpj: profile.cnpj,
    legal_name: profile.legal_name,
    trade_name: profile.trade_name,
    city: profile.address.city,
    uf: profile.address.uf,
    moved_at: moments.reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a)),
    ods,
  };
}

/** A ordem da API: a mudança mais recente primeiro, com o CNPJ como desempate (UC18, regra 2). */
export function byMostRecentMovement(a: CompanyMovementItem, b: CompanyMovementItem): number {
  return Date.parse(b.moved_at) - Date.parse(a.moved_at) || a.cnpj.localeCompare(b.cnpj);
}
