/** Cores vindas do tema, lidas por `ChartCanvas` na hora de desenhar. */
export interface ChartTheme {
  text: string;
  grid: string;
  surface: string;
  /** Tela estreita: os rótulos dos eixos cedem espaço às barras. */
  narrow: boolean;
}

export interface ChartTable {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

/** Tudo o que o card precisa de um gráfico, sem carregar o ECharts. */
export interface ChartSpec {
  /** Nome lido pelo leitor de tela. */
  label: string;
  /** Altura em rem, com os eixos e a legenda dentro dela. */
  height: number;
  options: (theme: ChartTheme) => Record<string, unknown>;
  /** Os mesmos números do gráfico, em texto. */
  table: ChartTable;
}

export interface ChartItem {
  key: string;
  label: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  /** Posição fixa na paleta: a cor acompanha a série, e não quantas existem. */
  order?: number;
  values: readonly (number | null)[];
}

/** Paleta do BIOS; a posição identifica a categoria, sem indicar julgamento (IND01). */
export const CATEGORY_COLORS = ['#3f7f3f', '#e0a100', '#d9541e', '#9c3d6b', '#6f8f2f'];
/** Uma única medida: a cor não diz nada além de "isto é o dado". */
export const SERIES_COLOR = CATEGORY_COLORS[0];
export const OTHER_COLOR = '#6b6d65';

export const OTHERS_KEY = 'OUTROS';
export const UNINFORMED_KEY = 'NAO_INFORMADO';
/** Mais fatias que isso já não se comparam numa rosca. */
export const MAX_SLICES = 6;

const COUNT = new Intl.NumberFormat('pt-BR');
const COMPACT = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCount = (value: number) => COUNT.format(value);
export const formatCompact = (value: number) => COMPACT.format(value);

/** Os textos vêm da API, e a dica do ECharts é HTML. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** As categorias que passam de `limit` viram "Outros", que nunca fica fora da soma. */
export function foldCategories(items: readonly ChartItem[], limit: number): ChartItem[] {
  if (items.length <= limit) return [...items];

  const others = items.slice(limit - 1).reduce((total, { value }) => total + value, 0);

  return [...items.slice(0, limit - 1), { key: OTHERS_KEY, label: 'Outros', value: others }];
}

/** Cinco categorias recebem cores próprias; as demais compartilham a fatia neutra. */
export function foldColoredCategories(items: readonly ChartItem[]): ChartItem[] {
  if (items.length <= CATEGORY_COLORS.length) return [...items];

  const others = items.slice(CATEGORY_COLORS.length).reduce((total, { value }) => total + value, 0);

  return [
    ...items.slice(0, CATEGORY_COLORS.length),
    { key: OTHERS_KEY, label: 'Outros', value: others },
  ];
}

/**
 * Cor de cada fatia. Com `order`, a cor acompanha a categoria, e não a posição: filtrar a pesquisa
 * não repinta as que sobram.
 */
export function sliceColors(
  items: readonly ChartItem[],
  order: readonly string[] = items.map(({ key }) => key),
): string[] {
  const known = order.filter((key) => key !== OTHERS_KEY && key !== UNINFORMED_KEY);

  return items.map(({ key }) => {
    const position = known.indexOf(key);

    return position < 0 ? OTHER_COLOR : CATEGORY_COLORS[position % CATEGORY_COLORS.length];
  });
}
