import type {
  CompanyEvidence,
  CompanyFullProfileResponse,
  ScoreContribution,
} from '../../../core/api/generated';
import { profileCards, sourceResults } from './profile-charts';

const evidence = (
  published: string | null,
  details: object = {},
  state: CompanyEvidence['state'] = 'CONFIRMED',
) =>
  ({
    id: Math.random().toString(),
    source_slug: 'IBAMA',
    state,
    published_at: published,
    details,
  }) as CompanyEvidence;

const contribution = (points: number, reference: string) =>
  ({
    points,
    evidence: { id: reference, source_slug: 'CGU_CEIS', source_reference: reference },
  }) as ScoreContribution;

function profile(
  infractions: CompanyEvidence[],
  contributions: ScoreContribution[] = [],
  sanctions: CompanyEvidence[] = [],
) {
  return {
    evidences: [
      { category: 'INFRACAO_AMBIENTAL', evidences: infractions },
      { category: 'CONDUTA_ADMINISTRATIVA', evidences: sanctions },
    ],
    ods_scores: [{ ods_number: 15, score_value: -40, contributions }],
    provenance: {
      sources: [
        { source_slug: 'IBAMA', origin: 'PERSISTED', evidence_state: 'CONFIRMED' },
        { source_slug: 'CGU_CEIS', origin: 'COLLECTION', evidence_state: 'NOT_FOUND' },
        { source_slug: 'CGU_CNEP', origin: 'UNAVAILABLE', evidence_state: null },
        { source_slug: 'GHG_PROTOCOL', origin: 'PENDING', evidence_state: null },
      ],
    },
  } as unknown as CompanyFullProfileResponse;
}

const cardOf = (subject: CompanyFullProfileResponse, id: string) =>
  profileCards(subject).find((card) => card.id === id);

describe('profileCards', () => {
  it('sem evidência confirmada, não há gráficos', () => {
    expect(profileCards(profile([evidence(null, {}, 'NOT_FOUND')]))).toEqual([]);
  });

  describe('linha do tempo', () => {
    it('conta por ano do fato e por tipo, em séries separadas', () => {
      const card = cardOf(
        profile(
          [evidence('2019-01-01T00:00:00.000Z'), evidence('2021-01-01T00:00:00.000Z')],
          [],
          [evidence(null, { startDate: '2021-05-01' })],
        ),
        'linha-do-tempo',
      );

      expect(card?.chart?.table.rows).toEqual([
        ['2019', 'Infrações ambientais', '1'],
        ['2021', 'Infrações ambientais', '1'],
        ['2021', 'Conduta administrativa', '1'],
      ]);
    });

    it('evidência sem data fica fora, com aviso da quantidade', () => {
      const card = cardOf(
        profile([
          evidence('2019-01-01T00:00:00.000Z'),
          evidence('2021-01-01T00:00:00.000Z'),
          evidence(null),
        ]),
        'linha-do-tempo',
      );

      expect(card?.note).toBe('1 evidência sem data fica fora da linha do tempo.');
    });

    it('um ano só vira frase, e não uma coluna', () => {
      const one = cardOf(profile([evidence('2024-02-01T00:00:00.000Z')]), 'linha-do-tempo');
      const two = cardOf(
        profile([evidence('2024-02-01T00:00:00.000Z'), evidence('2024-03-01T00:00:00.000Z')]),
        'linha-do-tempo',
      );

      expect(one?.chart).toBeNull();
      expect(one?.emptyMessage).toBe('Uma evidência com data, de 2024.');
      expect(two?.emptyMessage).toBe('2 evidências com data, todas de 2024.');
    });

    it('nada com data explica, sem mostrar zero', () => {
      expect(cardOf(profile([evidence(null)]), 'linha-do-tempo')?.emptyMessage).toBe(
        'Sem evidências confirmadas com data.',
      );
    });
  });

  describe('composição do índice', () => {
    const confirmed = [evidence('2024-02-01T00:00:00.000Z')];

    it('mostra os pontos de cada evidência, e as demais ficam num aviso', () => {
      const card = cardOf(
        profile(confirmed, [
          contribution(-5, 'A'),
          contribution(-40, 'B'),
          contribution(0, 'C'),
          contribution(0, 'D'),
        ]),
        'composicao-15',
      );

      expect(card?.chart?.table.rows).toEqual([
        ['CGU CEIS B', '-40'],
        ['CGU CEIS A', '-5'],
      ]);
      expect(card?.note).toBe(
        '2 evidências sem pontos: o teto da categoria já tinha sido atingido.',
      );
    });

    it('uma evidência vira frase, e não um gráfico de uma barra', () => {
      const card = cardOf(profile(confirmed, [contribution(-5, 'A')]), 'composicao-15');

      expect(card?.chart).toBeNull();
      expect(card?.emptyMessage).toBe('Uma evidência soma os pontos deste índice: -5.');
    });

    it('ODS sem índice não tem card, e nenhum ODS se combina com outro', () => {
      const subject = profile(confirmed, [contribution(-5, 'A')]);

      subject.ods_scores.push({
        ...subject.ods_scores[0],
        ods_number: 13,
        score_value: null,
      });

      expect(cardOf(subject, 'composicao-13')).toBeUndefined();
      expect(cardOf(subject, 'composicao-15')).toBeDefined();
    });
  });

  describe('distribuições', () => {
    it('viram gráfico só com duas categorias ou mais', () => {
      const card = cardOf(
        profile([
          evidence(null, { infraction_type: 'Flora', severity: 'Grave' }),
          evidence(null, { infraction_type: 'Pesca', severity: 'Grave' }),
        ]),
        'tipo',
      );
      const single = cardOf(
        profile([evidence(null, { severity: 'Grave' }), evidence(null, { severity: 'Grave' })]),
        'gravidade',
      );

      expect(card?.chart).not.toBeNull();
      expect(single?.chart).toBeNull();
      expect(single?.emptyMessage).toBe('Só uma categoria: Grave (2 evidências).');
    });

    it('sem a informação, o card nem aparece', () => {
      expect(cardOf(profile([evidence(null)]), 'bioma')).toBeUndefined();
    });

    it('separa os biomas de um registro e corrige o acento', () => {
      const card = cardOf(profile([evidence(null, { biomes: 'Amazonia, Cerrado' })]), 'bioma');

      expect(card?.chart?.table.rows).toEqual([
        ['Amazônia', '1'],
        ['Cerrado', '1'],
      ]);
    });

    it('registro não confirmado não conta', () => {
      const card = cardOf(
        profile([
          evidence(null, { severity: 'Grave' }),
          evidence(null, { severity: 'Leve' }, 'UNKNOWN'),
        ]),
        'gravidade',
      );

      expect(card?.chart).toBeNull();
    });
  });
});

describe('sourceResults', () => {
  it('o GHG sem inventário usa o mesmo termo do resto do perfil', () => {
    const base = profile([]);
    const results = sourceResults({
      ...base,
      provenance: {
        ...base.provenance,
        sources: [
          { source_slug: 'GHG_PROTOCOL', origin: 'UNAVAILABLE', evidence_state: 'UNKNOWN' },
        ],
      },
    });

    expect(results[0].label).toBe('Inventário não localizado no registro voluntário');
  });

  it('diz o que cada fonte respondeu, sem tratar ausência como resultado bom ou ruim', () => {
    const results = sourceResults(profile([evidence(null)]));

    expect(results.map(({ label, count }) => [label, count])).toEqual([
      ['Encontrado', 1],
      ['Nada encontrado', 0],
      ['Sem resposta', 0],
      ['Consulta pendente', 0],
    ]);
    expect(results.map(({ icon }) => icon)).not.toContain('check');
    expect(results.map(({ icon }) => icon)).not.toContain('error');
  });
});
