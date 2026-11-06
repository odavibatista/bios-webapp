import {
  barChart,
  columnChart,
  donutChart,
  pointsChart,
  stepChart,
  treemapChart,
} from './chart-builders';
import { CATEGORY_COLORS, type ChartItem, OTHER_COLOR, SERIES_COLOR } from './chart-spec';

const THEME = { text: '#111111', grid: '#cccccc', surface: '#ffffff', narrow: false };
const HEADERS = ['Categoria', 'Empresas'] as const;
const ITEMS: ChartItem[] = [
  { key: 'A', label: 'Comércio <varejista>', value: 12994 },
  { key: 'B', label: 'Indústria', value: 300 },
];

const base = {
  label: 'Empresas por setor',
  items: ITEMS,
  headers: HEADERS,
  sentence: ({ label, value }: ChartItem) => `${value} empresas atuam em ${label}`,
};

interface Options {
  color?: string[];
  tooltip: { formatter: (params: object) => string };
  legend?: unknown;
  series: Record<string, unknown>[];
}

const optionsOf = (spec: { options: (theme: typeof THEME) => object }) =>
  spec.options(THEME) as Options;

describe('donutChart', () => {
  it('a tabela traz os mesmos números, com o milhar em português', () => {
    expect(donutChart(base).table).toEqual({
      headers: [...HEADERS, 'Percentual'],
      rows: [
        ['Comércio <varejista>', '12.994', '97,7%'],
        ['Indústria', '300', '2,3%'],
      ],
    });
  });

  it('a dica e a legenda mostram quantidade e percentual, com o texto da API escapado', () => {
    const spec = donutChart(base);
    const { tooltip } = optionsOf(spec);

    expect(tooltip.formatter({ dataIndex: 0 })).toBe(
      '12994 empresas atuam em Comércio &lt;varejista&gt;, 97,7%',
    );
    expect(tooltip.formatter({ dataIndex: 9 })).toBe('');
    expect(spec.legend?.[1]).toEqual({
      label: 'Indústria',
      share: '2,3%',
      color: CATEGORY_COLORS[1],
    });
  });

  it('a dica e a tabela respeitam a frase e o formato de quem pede o gráfico', () => {
    const spec = donutChart({
      ...base,
      sentence: ({ value }) => (value === 1 ? '1 evidência' : `${value} evidências`),
      format: (value) => `R$ ${value}`,
      items: [
        { key: 'A', label: 'A', value: 1 },
        { key: 'B', label: 'B', value: 3 },
      ],
    });

    expect(optionsOf(spec).tooltip.formatter({ dataIndex: 0 })).toBe('1 evidência, 25,0%');
    expect(spec.table.rows[1]).toEqual(['B', 'R$ 3', '75,0%']);
  });

  it('sem nada a somar, o percentual fica em zero', () => {
    const spec = donutChart({
      ...base,
      items: [
        { key: 'A', label: 'A', value: 0 },
        { key: 'B', label: 'B', value: 0 },
      ],
    });

    expect(spec.table.rows.map((row) => row[2])).toEqual(['0,0%', '0,0%']);
  });

  it('a soma fecha em 100% e fatias inferiores a 0,1% não aparecem como zero', () => {
    const spec = donutChart({
      ...base,
      items: [
        { key: 'A', label: 'A', value: 1 },
        { key: 'B', label: 'B', value: 1 },
        { key: 'C', label: 'C', value: 1 },
      ],
    });
    expect(spec.table.rows.map((row) => row[2])).toEqual(['33,4%', '33,3%', '33,3%']);

    const tiny = donutChart({
      ...base,
      items: [
        { key: 'A', label: 'A', value: 10000 },
        { key: 'B', label: 'B', value: 1 },
      ],
    });
    expect(tiny.table.rows[1][2]).toBe('menos de 0,1%');
  });

  it('acima de seis fatias, as menores viram "Outros", em cinza', () => {
    const items = 'ABCDEFGH'.split('').map((key, index) => ({
      key,
      label: key,
      value: 10 - index,
    }));
    const spec = donutChart({ ...base, items });
    const { color, series } = optionsOf(spec);

    expect(series[0]['data']).toHaveLength(6);
    expect(spec.table.rows.at(-1)).toEqual(['Outros', '12', '23,1%']);
    expect(color?.at(-1)).toBe(OTHER_COLOR);
  });

  it('a sexta categoria também entra em "Outros", sem repetir a primeira cor', () => {
    const items = 'ABCDEF'.split('').map((key, index) => ({
      key,
      label: key,
      value: 6 - index,
    }));
    const spec = donutChart({ ...base, items });
    const { color } = optionsOf(spec);

    expect(spec.table.rows.at(-1)).toEqual(['Outros', '1', '4,8%']);
    expect(color).toEqual([...CATEGORY_COLORS, OTHER_COLOR]);
  });

  it('a ordem fixa mantém a cor da categoria quando outra some', () => {
    const { color } = optionsOf(donutChart({ ...base, items: [ITEMS[1]], order: ['A', 'B'] }));

    expect(color).toEqual([CATEGORY_COLORS[1]]);
  });
});

describe('barChart', () => {
  it('uma cor só, e altura que acompanha o número de categorias', () => {
    const spec = barChart(base);

    expect(optionsOf(spec).color).toEqual([SERIES_COLOR]);
    expect(barChart({ ...base, items: [...ITEMS, ...ITEMS] }).height).toBeGreaterThan(spec.height);
  });

  it('aceita outro formato de valor, igual no gráfico e na tabela', () => {
    const spec = barChart({ ...base, format: (value) => `R$ ${value}` });
    const label = optionsOf(spec).series[0]['label'] as {
      formatter: (params: { value: number }) => string;
    };

    expect(spec.table.rows[1][1]).toBe('R$ 300');
    expect(label.formatter({ value: 300 })).toBe('R$ 300');
  });
});

describe('pointsChart', () => {
  it('a barra sai do zero para o lado do sinal, com a mesma cor e o valor do lado de fora', () => {
    const spec = pointsChart({
      ...base,
      items: [
        { key: 'A', label: 'Sanção', value: -40 },
        { key: 'B', label: 'Inventário', value: 60 },
      ],
    });
    const { color, series } = optionsOf(spec);
    const [negative, positive] = series[0]['data'] as {
      value: number;
      label: { position: string };
    }[];

    expect(color).toEqual([SERIES_COLOR]);
    expect(negative).toMatchObject({ value: -40, label: { position: 'left' } });
    expect(positive).toMatchObject({ value: 60, label: { position: 'right' } });
  });
});

describe('columnChart', () => {
  const single = {
    label: 'Evidências por ano',
    categories: ['2019', '2020', '2021'],
    series: [{ name: 'Evidências', values: [4, null, 2] }],
    headers: ['Ano', 'Evidências'] as const,
    sentence: (year: string, _series: unknown, value: number) => `${value} evidências em ${year}`,
  };

  it('ano sem valor fica vazio no gráfico e fora da tabela, nunca em zero', () => {
    const spec = columnChart(single);

    expect(optionsOf(spec).series[0]['data']).toEqual([4, null, 2]);
    expect(spec.table.rows).toEqual([
      ['2019', '4'],
      ['2021', '2'],
    ]);
  });

  it('a dica ignora a posição vazia', () => {
    const { tooltip } = optionsOf(columnChart(single));

    expect(tooltip.formatter({ dataIndex: 0, seriesIndex: 0 })).toBe('4 evidências em 2019');
    expect(tooltip.formatter({ dataIndex: 1, seriesIndex: 0 })).toBe('');
  });

  it('com duas medidas, empilha, mostra a legenda e abre a coluna do tipo na tabela', () => {
    const spec = columnChart({
      ...single,
      series: [
        { name: 'Infração', values: [1, 2, null] },
        { name: 'Sanção', values: [3, null, 1] },
      ],
    });
    const options = optionsOf(spec);

    expect(options.legend).toBeDefined();
    expect(options.series[0]['stack']).toBe('total');
    expect(spec.table.headers).toEqual(['Ano', 'Tipo', 'Evidências']);
    expect(spec.table.rows[1]).toEqual(['2019', 'Sanção', '3']);
  });

  it('a cor acompanha a série pela ordem fixa, e não pela quantidade de séries', () => {
    const { series } = optionsOf(
      columnChart({ ...single, series: [{ name: 'Sanção', order: 1, values: [1, 2, 3] }] }),
    );

    expect(series[0]['color']).toBe(CATEGORY_COLORS[1]);
  });

  it('com uma medida só, não há legenda', () => {
    expect(optionsOf(columnChart(single)).legend).toBeUndefined();
  });
});

describe('stepChart', () => {
  const spec = stepChart({
    label: 'Degraus',
    points: [
      { date: '2019-01-01T00:00:00.000Z', value: -40 },
      { date: '2022-01-01T00:00:00.000Z', value: -20 },
    ],
    format: String,
    tooltip: (index) => [`Ponto <${String(index)}>`, 'Fonte'],
    table: { headers: ['Data', 'Índice'], rows: [] },
  });

  it('usa degraus e a escala inteira do índice, em uma cor só', () => {
    const options = spec.options(THEME) as unknown as {
      color: string[];
      yAxis: { min: number; max: number };
      series: { step: string; endLabel: { formatter: () => string } }[];
    };

    expect(options.color).toEqual([SERIES_COLOR]);
    expect(options.yAxis).toMatchObject({ min: -100, max: 100 });
    expect(options.series[0].step).toBe('end');
    expect(options.series[0].endLabel.formatter()).toBe('-20');
  });

  it('a dica escapa o texto da API e lista uma linha por informação', () => {
    const options = spec.options(THEME) as unknown as {
      tooltip: { formatter: (params: { dataIndex: number }[]) => string };
    };

    expect(options.tooltip.formatter([{ dataIndex: 1 }])).toBe('Ponto &lt;1&gt;<br>Fonte');
  });
});

describe('treemapChart', () => {
  it('uma cor só, com a tabela dos mesmos números', () => {
    const spec = treemapChart(base);
    const [first] = optionsOf(spec).series[0]['data'] as { itemStyle: { color: string } }[];

    expect(first.itemStyle.color).toBe(SERIES_COLOR);
    expect(spec.table.rows).toHaveLength(2);
  });
});
