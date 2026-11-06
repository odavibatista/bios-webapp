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
  /** Rótulos curtos do eixo, um por categoria: todos aparecem, sem depender de caber o nome. */
  ticks?: readonly string[];
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
const LABEL_LINE_HEIGHT = 14;
const LABEL_LINE_REM = LABEL_LINE_HEIGHT / 16;
const LABEL_CHAR_WIDTH = 6.2;
/** Caixa alta, no mapa de setores. */
const TILE_CHAR_WIDTH = 7.5;
const TILE_PADDING = 8;
/** Área do mapa em px²: 22 rem de altura, na largura do card. */
const TREEMAP_AREA = 320_000;
const TREEMAP_AREA_NARROW = 85_000;
const COMMON = { aria: { enabled: false }, animation: false };
const PERCENT_DIGITS = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

function itemTable(
  items: readonly ChartItem[],
  headers: readonly [string, string],
  format: (value: number) => string,
) {
  return { headers, rows: items.map(({ label, value }) => [label, format(value)]) };
}

/** Altura em rem de uma lista de barras: cada fileira cabe o nome mais longo, já quebrado. */
function barsHeight(items: readonly ChartItem[], labelWidth: number): number {
  const lineLength = Math.floor(labelWidth / LABEL_CHAR_WIDTH);
  const lines = Math.max(...items.map(({ label }) => Math.ceil(label.length / lineLength)));

  return items.length * Math.max(BAR_ROW, lines * LABEL_LINE_REM + 0.25) + 1;
}

/**
 * O nome só entra na fatia do mapa se a palavra mais longa couber nela, medida pelo lado de um
 * quadrado de mesma área. Do contrário, sobraria "A…" ou "AGRICULTU/RA": fica na tabela (#259).
 */
function fitsTile(label: string, share: number, area: number): boolean {
  const longestWord = Math.max(...label.split(' ').map((word) => word.length));

  return Math.sqrt(share * area) >= longestWord * TILE_CHAR_WIDTH + TILE_PADDING;
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

/**
 * O percentual de cada fatia, com uma casa (NFIN04). Os décimos que sobram do arredondamento vão
 * para as maiores frações, para a soma fechar em 100%; fatia abaixo de 0,1% nunca aparece como zero.
 */
function slicePercentages(items: readonly ChartItem[]): string[] {
  const total = items.reduce((sum, { value }) => sum + value, 0);
  const tenths = items.map(({ value }) => (total > 0 ? (value / total) * 1000 : 0));
  const rounded = tenths.map((value) => Math.floor(value));
  const remainder = total > 0 ? 1000 - rounded.reduce((sum, value) => sum + value, 0) : 0;

  tenths
    .map((value, index) => ({ index, value, fraction: value - rounded[index] }))
    .filter(({ value }) => value >= 1)
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .slice(0, remainder)
    .forEach(({ index }) => rounded[index]++);

  return tenths.map((value, index) =>
    value > 0 && value < 1
      ? 'menos de 0,1%'
      : `${(rounded[index] / 10).toLocaleString('pt-BR', PERCENT_DIGITS)}%`,
  );
}

/** Parte de um todo, até seis fatias. Duas fatias ou menos pedem texto, e não gráfico. */
export function donutChart(chart: DonutChart): ChartSpec {
  const items = foldColoredCategories(chart.items);
  const colors = sliceColors(items, chart.order);
  const shares = slicePercentages(items);
  const format = chart.format ?? formatCount;

  return {
    label: chart.label,
    height: 14,
    legend: items.map(({ label }, index) => ({
      label,
      share: shares[index],
      color: colors[index],
    })),
    table: {
      headers: [...chart.headers, 'Percentual'],
      rows: items.map(({ label, value }, index) => [label, format(value), shares[index]]),
    },
    options: ({ surface }) => ({
      ...COMMON,
      color: colors,
      tooltip: itemTooltip(
        items,
        (item) => `${chart.sentence(item)}, ${shares[items.indexOf(item)]}`,
      ),
      series: [
        {
          type: 'pie',
          radius: ['62%', '95%'],
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
    height: barsHeight(items, chart.labelWidth ?? WIDE_LABEL),
    narrowHeight: barsHeight(items, NARROW_LABEL),
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
          overflow: 'break',
          lineHeight: LABEL_LINE_HEIGHT,
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
    height: barsHeight(items, WIDE_LABEL),
    narrowHeight: barsHeight(items, NARROW_LABEL),
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
          overflow: 'break',
          lineHeight: LABEL_LINE_HEIGHT,
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
  const { categories, series, ticks } = chart;
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
    options: ({ text, grid, surface, narrow }) => ({
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
        axisLabel: {
          color: text,
          fontSize: AXIS_FONT,
          ...(ticks
            ? {
                interval: narrow ? 1 : 0,
                formatter: (_: string, index: number) => ticks[index],
              }
            : { hideOverlap: true }),
        },
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
  const total = items.reduce((sum, { value }) => sum + value, 0);

  return {
    label: chart.label,
    height: 22,
    table: itemTable(items, chart.headers, format),
    options: ({ surface, narrow }) => ({
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
            lineHeight: LABEL_LINE_HEIGHT,
            overflow: 'break',
            formatter: ({ name }: { name: string }) => name,
          },
          data: items.map(({ key, label, value }) => ({
            name: label,
            value,
            label: {
              show: fitsTile(label, value / total, narrow ? TREEMAP_AREA_NARROW : TREEMAP_AREA),
            },
            // A cor por nó: sem ela, o ECharts pinta cada categoria com uma cor da própria paleta.
            itemStyle: { color: key === OTHERS_KEY ? OTHER_COLOR : SERIES_COLOR },
          })),
        },
      ],
    }),
  };
}
