import {
  type ChartItem,
  type ChartSeries,
  type ChartSpec,
  type ChartTable,
  CATEGORY_COLORS,
  OTHER_COLOR,
  OTHERS_KEY,
  escapeHtml,
  foldColoredCategories,
  formatCompact,
  formatCount,
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

interface StepsChart {
  label: string;
  points: readonly { date: string; value: number }[];
  format: (value: number) => string;
  /** As linhas da dica de cada ponto. */
  tooltip: (index: number) => readonly string[];
  table: ChartTable;
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
  const items = foldColoredCategories(chart.items);
  const colors = sliceColors(items, chart.order);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const tenths = items.map((item) => (total > 0 ? (item.value / total) * 1000 : 0));
  const rounded = tenths.map((value) => Math.floor(value));
  let remainder = total > 0 ? 1000 - rounded.reduce((sum, value) => sum + value, 0) : 0;
  const order = tenths
    .map((value, index) => ({ index, fraction: value - rounded[index] }))
    .filter(({ index }) => tenths[index] >= 1)
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of order) {
    if (remainder-- <= 0) break;
    rounded[index]++;
  }
  const percentage = (index: number) =>
    tenths[index] > 0 && tenths[index] < 1
      ? 'menos de 0,1%'
      : `${(rounded[index] / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const percentages = new Map(items.map((item, index) => [item.label, percentage(index)]));

  return {
    label: chart.label,
    height: 18,
    table: {
      headers: [...chart.headers, 'Percentual'],
      rows: items.map((item, index) => [
        item.label,
        (chart.format ?? formatCount)(item.value),
        percentage(index),
      ]),
    },
    options: ({ text, surface }) => ({
      ...COMMON,
      color: colors,
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: ({ dataIndex }: { dataIndex: number }) => {
          const item = items[dataIndex];
          return item
            ? `${escapeHtml(item.label)}<br>${formatCount(item.value)} ${escapeHtml(chart.headers[1].toLowerCase())}, ${percentage(dataIndex)}`
            : '';
        },
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: text },
        formatter: (name: string) => `${name} ${percentages.get(name) ?? ''}`,
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

/**
 * Pontos com sinal: cada barra sai do zero para o seu lado. A direção mostra o sinal, com a mesma
 * cor nos dois lados, porque nenhum lado é "bom" pela cor (IND01).
 */
export function pointsChart(chart: ItemsChart): ChartSpec {
  const { items } = chart;
  const format = chart.format ?? formatCount;

  return {
    label: chart.label,
    height: items.length * BAR_ROW + 1,
    table: itemTable(items, chart.headers, format),
    options: ({ text, narrow }) => ({
      ...COMMON,
      color: [SERIES_COLOR],
      grid: { left: 4, right: 56, top: 4, bottom: 4, containLabel: true },
      tooltip: itemTooltip(items, chart.sentence),
      xAxis: { type: 'value', show: false, boundaryGap: ['18%', '18%'] },
      yAxis: {
        type: 'category',
        inverse: true,
        data: items.map(({ label }) => label),
        axisTick: { show: false },
        // Os nomes ficam à esquerda, e a linha de zero, no valor zero.
        axisLine: { onZero: false, show: false },
        axisLabel: {
          color: text,
          fontSize: AXIS_FONT,
          width: narrow ? NARROW_LABEL : WIDE_LABEL,
          overflow: 'truncate',
        },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: BAR_THICKNESS,
          label: {
            show: true,
            color: text,
            fontSize: AXIS_FONT,
            formatter: ({ value }: { value: number }) => format(value),
          },
          data: items.map(({ value }) => ({
            value,
            label: { position: value < 0 ? 'left' : 'right' },
            itemStyle: { borderRadius: value < 0 ? [4, 0, 0, 4] : [0, 4, 4, 0] },
          })),
        },
      ],
    }),
  };
}

/**
 * Degraus no tempo: o valor fica parado até o evento seguinte. A escala é sempre a do índice
 * inteira, para o tamanho do degrau não parecer maior do que é, e a cor não muda com o valor.
 */
export function stepChart(chart: StepsChart): ChartSpec {
  const { points } = chart;

  return {
    label: chart.label,
    height: 18,
    table: chart.table,
    options: ({ text, grid, surface }) => ({
      ...COMMON,
      color: [SERIES_COLOR],
      grid: { left: 4, right: 40, top: 16, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params: { dataIndex: number }[]) =>
          chart
            .tooltip(params[0]?.dataIndex ?? 0)
            .map(escapeHtml)
            .join('<br>'),
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: grid } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: text, fontSize: AXIS_FONT, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        min: -100,
        max: 100,
        interval: 50,
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: text, fontSize: AXIS_FONT },
      },
      series: [
        {
          type: 'line',
          step: 'end',
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: { width: 2 },
          itemStyle: { borderColor: surface, borderWidth: 2 },
          endLabel: {
            show: true,
            color: text,
            fontSize: AXIS_FONT,
            formatter: () => chart.format(points[points.length - 1].value),
          },
          data: points.map(({ date, value }) => [date, value]),
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
      series: series.map((item, index) => ({
        name: item.name,
        type: 'bar',
        color: CATEGORY_COLORS[(item.order ?? index) % CATEGORY_COLORS.length],
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
