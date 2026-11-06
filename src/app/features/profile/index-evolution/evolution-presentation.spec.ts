import type { CompanyIndexEvolution } from '../../../core/api/generated';
import { evolutionCard, RECONSTRUCTED_NOTICE } from './evolution-presentation';

type OdsEvolution = CompanyIndexEvolution['ods'][number];

const step = (date: string, score: number, cause = 'EVIDENCE_ADDED', count = 1) =>
  ({
    date,
    score_value: score,
    cause,
    evidence_count: count,
    evidence: {
      id: date,
      category: 'INFRACAO_AMBIENTAL',
      source_slug: 'IBAMA',
      source: 'IBAMA — Dados Abertos',
      summary: 'Multa simples',
      source_reference: '510251-D',
      source_url: null,
    },
  }) as OdsEvolution['steps'][number];

const AVAILABLE: OdsEvolution = {
  ods_number: 15,
  status: 'AVAILABLE',
  steps: [
    step('2019-03-01T00:00:00.000Z', -40),
    step('2022-07-15T00:00:00.000Z', -20, 'WEIGHT_CHANGED', 3),
  ],
};

const blocked = (status: OdsEvolution['status']) =>
  evolutionCard({ ods_number: 13, status, steps: [] });

describe('evolutionCard', () => {
  it('a tabela traz data, evidência e índice', () => {
    expect(evolutionCard(AVAILABLE).chart?.table).toEqual({
      headers: ['Data', 'Evidência', 'Índice'],
      rows: [
        ['01/03/2019', 'Evidência passou a contar: IBAMA — Dados Abertos, 510251-D', '-40'],
        [
          '15/07/2022',
          'O peso da evidência mudou: IBAMA — Dados Abertos, 510251-D e mais 2 evidências na data',
          '-20',
        ],
      ],
    });
  });

  it('a dica do degrau mostra a data, o índice e a evidência, e nada de variação', () => {
    const options = evolutionCard(AVAILABLE).chart?.options({
      text: '',
      grid: '',
      surface: '',
      narrow: false,
    }) as { tooltip: { formatter: (params: { dataIndex: number }[]) => string } };
    const tip = options.tooltip.formatter([{ dataIndex: 1 }]);

    expect(tip).toContain('15/07/2022');
    expect(tip).toContain('Índice: -20');
    expect(tip).toContain('510251-D');
    expect(tip).not.toMatch(/melhor|pior|subiu|desceu|%|\+/i);
  });

  it('o nome do gráfico diz o ODS e o período', () => {
    expect(evolutionCard(AVAILABLE).chart?.label).toContain('ODS 15, de 01/03/2019 a 15/07/2022');
  });

  it.each([
    ['INDIVIDUAL_ENTREPRENEUR', 'person', 'Evolução não exibida para empresário individual.'],
    ['SHORT_HISTORY', 'hourglass_top', 'As evidências desta empresa estão em um único ano.'],
    ['NO_DATED_EVIDENCE', 'info', 'Sem evidências com data para mostrar a evolução.'],
    ['LEGAL_NATURE_PENDING', 'info', 'A evolução aparece depois da próxima atualização'],
    ['NOT_REPRODUCIBLE', 'info', 'Não foi possível reconstruir a evolução'],
  ] as const)('%s tem ícone e explicação, sem gráfico', (status, icon, message) => {
    const card = blocked(status);

    expect(card.chart).toBeNull();
    expect(card.emptyIcon).toBe(icon);
    expect(card.emptyMessage).toContain(message);
  });

  it('nenhuma mensagem atribui a ausência do gráfico ao porte da empresa', () => {
    const messages = (
      [
        'INDIVIDUAL_ENTREPRENEUR',
        'SHORT_HISTORY',
        'NO_DATED_EVIDENCE',
        'LEGAL_NATURE_PENDING',
        'NOT_REPRODUCIBLE',
      ] as const
    ).map((status) => blocked(status).emptyMessage);

    expect(messages.join(' ')).not.toMatch(/porte/i);
  });

  it('o aviso de reconstrução usa o texto combinado', () => {
    expect(RECONSTRUCTED_NOTICE).toBe(
      'Série reconstruída com as regras atuais, a partir das evidências disponíveis hoje.',
    );
  });
});
