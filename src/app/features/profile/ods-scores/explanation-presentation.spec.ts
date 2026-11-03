import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import acoCearense from '../../../core/mocks/fixtures/getCompanyProfile/aco-cearense';
import foxStore from '../../../core/mocks/fixtures/getCompanyProfile/fox-store';
import { PROFILES } from '../../../core/mocks/mock-companies';
import { presentExplanation } from './explanation-presentation';
import { presentScore } from './score-presentation';

const ACO = acoCearense.body as CompanyFullProfileResponse;
const FOX = foxStore.body as CompanyFullProfileResponse;

describe('presentExplanation', () => {
  it('reproduz o índice exibido em todos os perfis capturados com contribuição', () => {
    for (const profile of PROFILES.values()) {
      for (const score of profile.ods_scores) {
        if (score.score_value === null || score.contributions.length === 0) continue;
        const sum = score.contributions.reduce((total, item) => total + item.points, 0);
        expect(sum).toBeCloseTo(score.score_value);
        expect(presentExplanation(score, profile.evidences).totalLabel).toBe(
          presentScore(score).scoreLabel,
        );
        expect(
          presentExplanation(score, profile.evidences).contributions.every(
            (item) => item.evidenceAnchor !== null,
          ),
        ).toBe(true);
      }
    }
  });

  it('soma os pontos do ODS e liga cada contribuição à evidência e à fonte', () => {
    const score = ACO.ods_scores.find((item) => item.ods_number === 15)!;
    const explanation = presentExplanation(score, ACO.evidences);

    expect(explanation.totalLabel).toBe('-80');
    expect(explanation.contributions).toHaveLength(2);
    expect(explanation.contributions[0]).toMatchObject({
      category: 'Infrações ambientais',
      signalLabel: 'Negativo',
      weightLabel: '40',
      pointsLabel: '-40',
      evidenceAnchor: `evidencia-${score.contributions[0].evidence.id}`,
      sourceUrl: 'https://dadosabertos.ibama.gov.br/dataset/fiscalizacao-auto-de-infracao',
    });
  });

  it('preserva centésimos e explica o peso reduzido sem afirmar vigência da sanção', () => {
    const score = FOX.ods_scores.find((item) => item.ods_number === 15)!;
    const explanation = presentExplanation(score, FOX.evidences);

    expect(explanation.totalLabel).toBe('-6,25');
    expect(explanation.contributions[0].weightLabel).toBe('1,25');
    expect(explanation.contributions[0].weightReason).toContain('período informado');
  });

  it('avisa sobre evidência vencida e não cria links para destino ausente ou inseguro', () => {
    const score = ACO.ods_scores.find((item) => item.ods_number === 15)!;
    const changed = {
      ...score,
      contributions: [
        {
          ...score.contributions[0],
          evidence: {
            ...score.contributions[0].evidence,
            id: 'ausente',
            current_state: 'OUTDATED' as const,
            source_url: 'http://exemplo.invalid/registro',
          },
          weight_reason: 'IBAMA_EMBARGO_LIFTED' as const,
        },
      ],
    };
    const item = presentExplanation(changed, ACO.evidences).contributions[0];

    expect(item.outdated).toBe(true);
    expect(item.weightReason).toContain('embargo foi levantado');
    expect(item.evidenceAnchor).toBeNull();
    expect(item.sourceUrl).toBeNull();
  });
});
