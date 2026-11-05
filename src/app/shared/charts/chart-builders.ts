import {
  type ChartItem,
  type ChartSeries,
  type ChartSpec,
  CATEGORY_COLORS,
  OTHER_COLOR,
  OTHERS_KEY,
  escapeHtml,
  foldCategories,
  formatCompact,
  formatCount,
  MAX_SLICES,
  SERIES_COLOR,
  sliceColors,
} from './chart-spec';

interface ItemsChart {
  label: string;
  items: readonly ChartItem[];
  /** Cabeçalhos da tabela: a categoria e a medida. */
  headers: readonly [string, string];
  /** A dica em frase: "12.994 empresas atuam em comércio varejista". */
  sentence: (item: ChartItem) => string;
  /** Texto do valor; por padrão, a contagem. */
  format?: (value: number) => string;
}

interface BarsChart extends ItemsChart {
  /** Espaço dos nomes em tela larga, para categorias de nome longo. */
  labelWidth?: number;
}

interface DonutChart extends ItemsChart {
  /** Ordem fixa das categorias, para a cor não mudar com o filtro. */
  order?: readonly string[];
}

interface ColumnsChart {
  label: string;
  /** Eixo ordenado: anos, faixas. Posição sem valor fica vazia, nunca em zero (IND02). */
  categories: readonly string[];
  series: readonly ChartSeries[];
  headers: readonly [string, string];
  sentence: (category: string, series: ChartSeries, value: number) => string;
}

const AXIS_FONT = 12;
const BAR_ROW = 2;
const BAR_THICKNESS = 18;
const NARROW_LABEL = 120;
const WIDE_LABEL = 168;
const COMMON = { aria: { enabled: false }, animation: false };

function itemTable(
  items: readonly ChartItem[],
  headers: readonly [string, string],
  format: (value: number) => string,
) {
  return { headers, rows: items.map(({ label, value }) => [label, format(value)]) };
}

/** Tooltip por marca: a frase pronta, com o texto da API escapado. */
function itemTooltip(items: readonly ChartItem[], sentence: ItemsChart['sentence']) {
  return {
    trigger: 'item',
    confine: true,
    formatter: ({ dataIndex }: { dataIndex: number }) => {
      const item = items[dataIndex];

      return item ? escapeHtml(sentence(item)) : '';
    },
  };
}

/** Parte de um todo, até seis fatias. Duas fatias ou menos pedem texto, e não gráfico. */
export function donutChart(chart: DonutChart): ChartSpec {
  const items = foldCategories(chart.items, MAX_SLICES);
  const colors = sliceColors(items, chart.order);

  return {
    label: chart.label,
    height: 18,
    table: itemTable(items, chart.headers, chart.format ?? formatCount),
    options: ({ text, surface }) => ({
      ...COMMON,
      color: colors,
      tooltip: itemTooltip(items, chart.sentence),
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: text },
        formatter: (name: string) => name,
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '74%'],
          center: ['50%', '42%'],
          label: { show: false },
          itemStyle: { borderColor: surface, borderWidth: 2 },
          data: items.map(({ label, value }) => ({ name: label, value })),
        },
      ],
    }),
  };
}

/** Comparação de categorias sem ordem natural: uma barra por categoria, da maior para a menor. */
export function barChart(chart: BarsChart): ChartSpec {
  const { items } = chart;
  const format = chart.format ?? formatCount;

  return {
    label: chart.label,
    height: items.length * BAR_ROW + 1,
    table: itemTable(items, chart.headers, format),
    options: ({ text, grid, narrow }) => ({
      ...COMMON,
      color: [SERIES_COLOR],
      grid: { left: 4, right: 72, top: 4, bottom: 4, containLabel: true },
      tooltip: itemTooltip(items, chart.sentence),
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: items.map(({ label }) => label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: grid } },
        axisLabel: {
          color: text,
          fontSize: AXIS_FONT,
          width: narrow ? NARROW_LABEL : (chart.labelWidth ?? WIDE_LABEL),
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: BAR_THICKNESS,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            color: text,
            fontSize: AXIS_FONT,
            formatter: ({ value }: { value: number }) => format(value),
          },
          data: items.map(({ value }) => value),
        },
      ],
    }),
  };
}

/** Eixo ordenado, com uma medida ou com medidas empilhadas. */
export function columnChart(chart: ColumnsChart): ChartSpec {
  const { categories, series } = chart;
  const stacked = series.length > 1;
  const rows = categories.flatMap((category, index) =>
    series.flatMap((item) => {
      const value = item.values[index];

      return value === null || value === undefined
        ? []
        : [stacked ? [category, item.name, formatCount(value)] : [category, formatCount(value)]];
    }),
  );

  return {
    label: chart.label,
    height: stacked ? 20 : 18,
    table: {
      headers: stacked ? [chart.headers[0], 'Tipo', chart.headers[1]] : chart.headers,
      rows,
    },
    options: ({ text, grid, surface }) => ({
      ...COMMON,
      color: CATEGORY_COLORS,
      grid: { left: 4, right: 12, top: 12, bottom: stacked ? 36 : 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: ({ dataIndex, seriesIndex }: { dataIndex: number; seriesIndex: number }) => {
          const item = series[seriesIndex];
          const value = item?.values[dataIndex];

          return item && value !== null && value !== undefined
            ? escapeHtml(chart.sentence(categories[dataIndex], item, value))
            : '';
        },
      },
      ...(stacked
        ? { legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { color: text } } }
        : {}),
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: grid } },
        axisLabel: { color: text, fontSize: AXIS_FONT, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: text, fontSize: AXIS_FONT, formatter: formatCompact },
      },
      series: series.map((item) => ({
        name: item.name,
        type: 'bar',
        barMaxWidth: BAR_THICKNESS,
        ...(stacked ? { stack: 'total' } : {}),
        itemStyle: {
          borderRadius: stacked ? 0 : [4, 4, 0, 0],
          borderColor: surface,
          borderWidth: stacked ? 1 : 0,
        },
        data: item.values,
      })),
    }),
  };
}

/** Muitas categorias de nomes longos: a área mostra o tamanho, sem depender de um eixo. */
export function treemapChart(chart: ItemsChart): ChartSpec {
  const { items } = chart;
  const format = chart.format ?? formatCount;

  return {
    label: chart.label,
    height: 22,
    table: itemTable(items, chart.headers, format),
    options: ({ surface }) => ({
      ...COMMON,
      tooltip: itemTooltip(items, chart.sentence),
      series: [
        {
          type: 'treemap',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          itemStyle: { borderColor: surface, borderWidth: 2, gapWidth: 2 },
          label: {
            show: true,
            color: '#ffffff',
            fontSize: AXIS_FONT,
            overflow: 'truncate',
            formatter: ({ name }: { name: string }) => name,
          },
          data: items.map(({ key, label, value }) => ({
            name: label,
            value,
            // A cor por nó: sem ela, o ECharts pinta cada categoria com uma cor da própria paleta.
            itemStyle: { color: key === OTHERS_KEY ? OTHER_COLOR : SERIES_COLOR },
          })),
        },
      ],
    }),
  };
}
