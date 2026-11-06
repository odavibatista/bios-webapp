import type {
  CompanyEvidence,
  CompanySourceProvenance,
  EvidenceCategoryGroup,
} from '../../../core/api/generated';
import { formatDateTime } from '../../../shared/format/date-time';

/** O GHG respondeu, só não há inventário: nunca "sem resposta", nem bom ou ruim (IND02). */
export const GHG_NO_INVENTORY_LABEL = 'Inventário não localizado no registro voluntário';

export function ghgWithoutLocatedInventory(source: CompanySourceProvenance): boolean {
  return (
    source.source_slug === 'GHG_PROTOCOL' &&
    source.origin === 'UNAVAILABLE' &&
    source.evidence_state === 'UNKNOWN'
  );
}

type EvidenceState = CompanyEvidence['state'];
type EvidenceCategory = EvidenceCategoryGroup['category'];

export const CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  INFRACAO_AMBIENTAL: 'Infrações ambientais',
  CONDUTA_ADMINISTRATIVA: 'Conduta administrativa',
  EMISSAO_GEE: 'Inventários de emissões de GEE',
};

export const STATE_LABELS: Record<EvidenceState, string> = {
  CONFIRMED: 'Registro encontrado',
  NOT_FOUND: 'Sem registro na fonte',
  UNKNOWN: 'Não foi possível verificar',
  OUTDATED: 'Dados desatualizados',
};

export const SOURCE_LABELS: Record<CompanySourceProvenance['source_slug'], string> = {
  IBAMA: 'IBAMA — Dados Abertos',
  CGU_CEIS: 'CGU — CEIS',
  CGU_CNEP: 'CGU — CNEP',
  GHG_PROTOCOL: 'GHG Protocol — Registro Público de Emissões',
};

/** Apenas endereços HTTPS absolutos e sem credenciais viram links clicáveis. */
export function safeSourceUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export interface EvidenceView {
  id: string;
  source: string;
  state: EvidenceState;
  stateLabel: string;
  summary: string | null;
  reference: string | null;
  url: string | null;
  publishedAt: string | null;
  collectedAt: string;
  validUntil: string;
  sanctionPeriod: string | null;
}

function detailsDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

/** A publicação vem como data civil, frequentemente à meia-noite UTC. */
function publicationDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

/** O período vem só dos campos públicos da sanção; não indica vigência atual. */
function sanctionPeriod(evidence: CompanyEvidence): string | null {
  if (!evidence.source_slug.startsWith('CGU_')) return null;
  const details = evidence.details;
  if (!details || Array.isArray(details) || typeof details !== 'object') return null;
  const start = detailsDate(details['startDate']);
  const end = detailsDate(details['endDate']);
  return start || end
    ? `${start ?? 'Data inicial não informada'} a ${end ?? 'Data final não informada'}`
    : null;
}

/** Um registro sem referência auditável nunca aparece como confirmação. */
export function presentEvidence(evidence: CompanyEvidence): EvidenceView {
  const url = safeSourceUrl(evidence.source_url);
  const trimmedReference = evidence.source_reference?.trim();
  const reference = trimmedReference?.length === 0 ? null : (trimmedReference ?? null);
  const untraceable =
    !url && !reference && (evidence.state === 'CONFIRMED' || evidence.state === 'OUTDATED');
  const state = untraceable ? 'UNKNOWN' : evidence.state;
  const confirmedContent = state === 'CONFIRMED' || state === 'OUTDATED';

  return {
    id: evidence.id,
    source: evidence.source,
    state,
    stateLabel: STATE_LABELS[state],
    summary: confirmedContent ? evidence.summary : null,
    reference: confirmedContent ? reference : null,
    url: confirmedContent ? url : null,
    publishedAt: publicationDate(evidence.published_at),
    collectedAt: formatDateTime(evidence.collected_at),
    validUntil: formatDateTime(evidence.valid_until),
    sanctionPeriod: confirmedContent ? sanctionPeriod(evidence) : null,
  };
}

export function retryHint(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return 'Recarregue o perfil em instantes.';
  if (seconds < 60) return `Recarregue o perfil em cerca de ${Math.ceil(seconds)} segundos.`;
  return `Recarregue o perfil em cerca de ${Math.ceil(seconds / 60)} minutos.`;
}
