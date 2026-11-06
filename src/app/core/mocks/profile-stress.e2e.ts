import type { CompanyFullProfileResponse } from '../api/generated';
import acoCearense from './fixtures/getCompanyProfile/aco-cearense';

/** Perfil sintético, só no build e2e, para exercitar a lista com milhares de contribuições. */
const source = acoCearense.body as CompanyFullProfileResponse;
const original = source.ods_scores.find((score) => score.ods_number === 15)!.contributions[0];
const evidence = source.evidences
  .flatMap((group) => group.evidences)
  .find((item) => item.id === original.evidence.id)!;
const records = Array.from({ length: 2535 }, (_, index) => ({
  ...evidence,
  id: `qa-${String(index).padStart(4, '0')}`,
}));
const contributions = records.map((record, index) => ({
  ...original,
  evidence: { ...original.evidence, id: record.id },
  points: index < 2 ? -40 : 0,
}));

export const E2E_STRESS_PROFILE: CompanyFullProfileResponse = {
  ...source,
  cnpj: '33000167000101',
  legal_name: 'EMPRESA SINTETICA DE TESTE E2E',
  trade_name: null,
  ods_scores: source.ods_scores.map((score) =>
    score.ods_number === 15 ? { ...score, evidence_count: records.length, contributions } : score,
  ),
  evidences: source.evidences.map((group) =>
    group.category === original.evidence.category ? { ...group, evidences: records } : group,
  ),
};
