import type { CompanyAnalytics } from '../../core/api/generated';
import { companies, overviewCards } from './overview-charts';

const item = (key: string, count: number, label = key) => ({ key, label, count });

const ANALYTICS: CompanyAnalytics = {
  companies: 120,
  minimum_sample: 5,
  totals: { confirmed_evidences: 40, fine_notices: 3, fine_amount: 900, area_hectares: 2 },
  registration: {
    status: [item('ATIVA', 100), item('BAIXADA', 20)],
    size: [item('MICRO EMPRESA', 80), item('NAO_INFORMADO', 40, 'Não informado')],
    legal_nature: [item('2062', 110, 'Sociedade Limitada'), item('2135', 10, 'Empresário')],
    uf: [item('SP', 70), item('MG', 50)],
    sector: [item('47', 100, 'COMÉRCIO VAREJISTA'), item('24', 20, 'METALURGIA')],
  },
  evidence: {
    biome: [item('Amazonia', 12), item('Cerrado', 8)],
    infraction_type: [item('Flora', 30), item('Pesca', 10)],
    sanction: [item('Suspensão', 2), item('Multa', 1)],
    year: [
      { year: 2019, count: 3 },
      { year: 2022, count: 1 },
    ],
  },
  ods: [
    {
      ods_number: 15,
      companies: 120,
      companies_with_index: 90,
      average_score: -40,
      average_confidence: 0.4,
      score_ranges: [
        { from: -100, to: -80, count: 60 },
        { from: -80, to: -60, count: 30 },
      ],
      confidence_ranges: [{ from: 0.2, to: 0.4, count: 90 }],
    },
  ],
};

const cardOf = (id: string, analytics = ANALYTICS) => {
  const card = overviewCards(analytics).find((candidate) => candidate.id === id);

  if (!card) throw new Error(`Sem o card ${id}`);

  return card;
};

describe('overviewCards', () => {
  it('traz as distribuições, os anos e as duas faixas de cada ODS', () => {
    expect(overviewCards(ANALYTICS).map(({ id }) => id)).toEqual([
      'situacao',
      'porte',
      'setor',
      'uf',
      'natureza',
      'bioma',
      'infracao',
      'sancao',
      'ano',
      'indice-15',
      'confianca-15',
    ]);
  });

  it('usa os rótulos da tela, com acento e sem o código da API', () => {
    expect(cardOf('situacao').chart?.table.rows[0]).toEqual(['Ativa', '100']);
    expect(cardOf('porte').chart?.table.rows).toEqual([
      ['Microempresa (ME)', '80'],
      ['Não informado', '40'],
    ]);
    expect(cardOf('bioma').chart?.table.rows[0]).toEqual(['Amazônia', '12']);
  });

  it('a dica do setor é uma frase sobre as empresas na base', () => {
    const chart = cardOf('setor').chart;
    const options = chart?.options({ text: '', grid: '', surface: '', narrow: false }) as {
      tooltip: { formatter: (params: { dataIndex: number }) => string };
    };

    expect(options.tooltip.formatter({ dataIndex: 0 })).toBe(
      '100 empresas atuam em comércio varejista',
    );
  });

  it('uma categoria só vira texto, e nunca um gráfico de uma fatia', () => {
    const card = cardOf('situacao', {
      ...ANALYTICS,
      registration: { ...ANALYTICS.registration, status: [item('ATIVA', 120)] },
    });

    expect(card.chart).toBeNull();
    expect(card.emptyMessage).toBe('Só uma categoria neste recorte: Ativa.');
  });

  it('recorte sem evidências explica, sem mostrar zero', () => {
    const card = cardOf('ano', {
      ...ANALYTICS,
      evidence: { biome: [], infraction_type: [], sanction: [], year: [] },
    });

    expect(card.chart).toBeNull();
    expect(card.emptyMessage).toContain('não têm evidências confirmadas');
  });

  it('recorte sem empresas avisa uma vez, na mesma frase, em todos os cards', () => {
    const empty = {
      ...ANALYTICS,
      companies: 0,
      registration: { status: [], size: [], legal_nature: [], uf: [], sector: [] },
      evidence: { biome: [], infraction_type: [], sanction: [], year: [] },
    };

    expect(cardOf('uf', empty).emptyMessage).toBe('Nenhuma empresa neste recorte.');
    expect(cardOf('bioma', empty).emptyMessage).toBe('Nenhuma empresa neste recorte.');
  });

  it('ano sem evidência fica vazio no eixo, e não em zero', () => {
    const options = cardOf('ano').chart?.options({
      text: '',
      grid: '',
      surface: '',
      narrow: false,
    }) as {
      xAxis: { data: string[] };
      series: { data: (number | null)[] }[];
    };

    expect(options.xAxis.data).toEqual(['2019', '2020', '2021', '2022']);
    expect(options.series[0].data).toEqual([3, null, null, 1]);
  });

  it('as faixas usam o sinal de menos e a vírgula decimal', () => {
    expect(cardOf('indice-15').chart?.table.rows[0]).toEqual(['−100 a −80', '60']);
    expect(cardOf('confianca-15').chart?.table.rows[0]).toEqual(['0,2 a 0,4', '90']);
  });

  it('abaixo do mínimo, explica por que as faixas não aparecem', () => {
    const [ods] = ANALYTICS.ods;
    const card = cardOf('indice-15', {
      ...ANALYTICS,
      ods: [{ ...ods, companies_with_index: 1, score_ranges: [], confidence_ranges: [] }],
    });

    expect(card.chart).toBeNull();
    expect(card.emptyMessage).toContain('Só 1 empresa com índice no ODS 15');
    expect(card.emptyMessage).toContain('a partir de 5');
  });

  it('o singular de empresa', () => {
    expect(companies(1)).toBe('1 empresa');
    expect(companies(1200)).toBe('1.200 empresas');
  });
});
