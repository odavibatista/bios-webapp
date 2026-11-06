import type {
  CompanyFullProfileResponse,
  CompanyMovementItem,
  ScoreContribution,
  ScoreExplanationResponse,
} from '../api/generated';
import type { CompanySnapshot } from './company-archive';
import { byMostRecentMovement, companyMovementOf } from './company-movements';

const NOW = Date.parse('2026-11-04T12:00:00.000Z');
const OLDER = '2024-05-01T00:00:00.000Z';
const NEWER = '2026-10-01T00:00:00.000Z';
const FUTURE = '2030-01-01T00:00:00.000Z';

interface Item {
  id: string;
  points: number;
  published: string | null;
  details?: object;
  category?: ScoreContribution['evidence']['category'];
}

function contribution({ id, points, category = 'INFRACAO_AMBIENTAL' }: Item): ScoreContribution {
  return { evidence: { id, category }, points } as unknown as ScoreContribution;
}

function company(items: readonly Item[], score: number | null = -40): CompanySnapshot {
  const profile = {
    cnpj: '11222333000181',
    legal_name: 'Empresa',
    trade_name: null,
    address: { city: 'SÃO PAULO', uf: 'SP' },
    evidences: [
      {
        category: 'INFRACAO_AMBIENTAL',
        evidences: items.map(({ id, published, details = null }) => ({
          id,
          published_at: published,
          collected_at: '2026-11-03T00:00:00.000Z',
          details,
        })),
      },
    ],
    ods_scores: [
      { ods_number: 13, score_value: null, confidence_value: 0 },
      { ods_number: 15, score_value: score, confidence_value: 0.33 },
    ],
  } as unknown as CompanyFullProfileResponse;

  return {
    profile,
    explanations: {
      15: { contributions: items.map(contribution) } as unknown as ScoreExplanationResponse,
    },
  };
}

function movementOf(items: readonly Item[]) {
  return companyMovementOf(company(items), NOW)?.ods[1].movement ?? null;
}

describe('companyMovementOf', () => {
  it('uma única evidência que pontua é AVAILABLE, com a data de publicação', () => {
    expect(movementOf([{ id: 'a', points: -40, published: OLDER }])).toEqual({
      direction: 'AVAILABLE',
      cause: 'EVIDENCE_ADDED',
      evidence_category: 'INFRACAO_AMBIENTAL',
      moved_at: OLDER,
    });
  });

  it('com mais de uma, o sentido vem do sinal dos pontos da mais recente', () => {
    expect(
      movementOf([
        { id: 'a', points: -5, published: OLDER, category: 'CONDUTA_ADMINISTRATIVA' },
        { id: 'b', points: -40, published: NEWER },
      ]),
    ).toMatchObject({
      direction: 'DECREASED',
      evidence_category: 'INFRACAO_AMBIENTAL',
      moved_at: NEWER,
    });
    expect(
      movementOf([
        { id: 'a', points: 60, published: NEWER, category: 'EMISSAO_GEE' },
        { id: 'b', points: 40, published: OLDER, category: 'EMISSAO_GEE' },
      ])?.direction,
    ).toBe('INCREASED');
  });

  it('sem publicação, usa o início da sanção ou o fim do ano do inventário', () => {
    expect(
      movementOf([{ id: 'a', points: -5, published: null, details: { startDate: '2019-07-10' } }])
        ?.moved_at,
    ).toBe('2019-07-10T00:00:00.000Z');
    expect(
      movementOf([{ id: 'a', points: 60, published: null, details: { inventoryYear: 2025 } }])
        ?.moved_at,
    ).toBe('2025-12-31T00:00:00.000Z');
  });

  it('sem data do fato, não reconstrói: a coleta não é data da mudança', () => {
    expect(movementOf([{ id: 'a', points: -40, published: null }])).toBeNull();
    expect(
      movementOf([{ id: 'a', points: -40, published: null, details: { startDate: 'sem data' } }]),
    ).toBeNull();
  });

  it('evidência zerada pelo teto não é a mais recente nem conta como segunda', () => {
    expect(
      movementOf([
        { id: 'a', points: -40, published: OLDER },
        { id: 'b', points: 0, published: NEWER },
      ]),
    ).toMatchObject({ direction: 'AVAILABLE', moved_at: OLDER });
  });

  it('data futura é ignorada', () => {
    expect(
      movementOf([
        { id: 'a', points: -40, published: OLDER },
        { id: 'b', points: -5, published: FUTURE },
      ])?.moved_at,
    ).toBe(OLDER);
    expect(
      companyMovementOf(company([{ id: 'a', points: -40, published: FUTURE }]), NOW),
    ).toBeNull();
  });

  it('no empate de data, vale o maior efeito e depois o menor identificador', () => {
    expect(
      movementOf([
        { id: 'a', points: -5, published: NEWER, category: 'CONDUTA_ADMINISTRATIVA' },
        { id: 'b', points: -40, published: NEWER },
      ])?.evidence_category,
    ).toBe('INFRACAO_AMBIENTAL');
    expect(
      movementOf([
        { id: 'b', points: -5, published: NEWER },
        { id: 'a', points: -5, published: NEWER, category: 'CONDUTA_ADMINISTRATIVA' },
      ])?.evidence_category,
    ).toBe('CONDUTA_ADMINISTRATIVA');
  });

  it('traz a identificação e um item por ODS, com índice nulo sem movimentação (IND02)', () => {
    expect(
      companyMovementOf(company([{ id: 'a', points: -40, published: NEWER }]), NOW),
    ).toMatchObject({
      cnpj: '11222333000181',
      city: 'SÃO PAULO',
      uf: 'SP',
      moved_at: NEWER,
      ods: [
        { ods_number: 13, score_value: null, movement: null },
        { ods_number: 15, score_value: -40, confidence_value: 0.33 },
      ],
    });
  });

  it('empresa sem índice nem explicação fica fora da lista', () => {
    expect(companyMovementOf(company([], null), NOW)).toBeNull();
    expect(
      companyMovementOf(
        { ...company([{ id: 'a', points: -40, published: NEWER }]), explanations: {} },
        NOW,
      ),
    ).toBeNull();
  });

  it('com dois ODS, a data da empresa é a mais recente', () => {
    const base = company([{ id: 'a', points: -40, published: OLDER }]);
    const profile = {
      ...base.profile,
      ods_scores: base.profile.ods_scores.map((score) =>
        score.ods_number === 13 ? { ...score, score_value: 60 } : score,
      ),
      evidences: [
        ...base.profile.evidences,
        { category: 'EMISSAO_GEE', evidences: [{ id: 'g', published_at: NEWER }] },
      ],
    } as CompanyFullProfileResponse;
    const explanations = {
      ...base.explanations,
      13: {
        contributions: [contribution({ id: 'g', points: 60, published: NEWER })],
      } as unknown as ScoreExplanationResponse,
    };

    expect(companyMovementOf({ profile, explanations }, NOW)?.moved_at).toBe(NEWER);
  });
});

describe('byMostRecentMovement', () => {
  const item = (cnpj: string, movedAt: string) =>
    ({ cnpj, moved_at: movedAt }) as CompanyMovementItem;

  it('ordena da mais recente para a mais antiga, com o CNPJ como desempate', () => {
    expect(
      [item('2', OLDER), item('3', NEWER), item('1', NEWER)]
        .sort(byMostRecentMovement)
        .map(({ cnpj }) => cnpj),
    ).toEqual(['1', '3', '2']);
  });
});
