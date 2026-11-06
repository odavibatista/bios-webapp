import type { CompanyAnalytics, RegistrationStatus } from '../../core/api/generated';
import {
  barChart,
  columnChart,
  donutChart,
  treemapChart,
} from '../../shared/charts/chart-builders';
import { type ChartItem, type ChartSpec, formatCount } from '../../shared/charts/chart-spec';
import {
  companySizeLabel,
  registrationStatusLabel,
} from '../profile/registration-data/registration-labels';

type Distribution = CompanyAnalytics['registration']['status'];
type Range = CompanyAnalytics['ods'][number]['score_ranges'][number];

export interface OverviewCard {
  id: string;
  heading: string;
  description?: string;
  chart: ChartSpec | null;
  emptyMessage: string;
  /** Ocupa a largura inteira da grade. */
  wide?: boolean;
}

/** A ordem fixa mantém a cor de cada categoria quando um filtro faz outra sumir. */
const STATUS_ORDER = ['ATIVA', 'BAIXADA', 'INAPTA', 'SUSPENSA', 'NULA'];
const SIZE_ORDER = ['DEMAIS', 'MICRO EMPRESA', 'EMPRESA DE PEQUENO PORTE'];
/** A fonte grava os biomas sem acento. */
const BIOME_LABELS: Readonly<Record<string, string>> = {
  Amazonia: 'Amazônia',
  'Mata Atlantica': 'Mata Atlântica',
};
export const biomeLabel = (biome: string) => BIOME_LABELS[biome] ?? biome;

const NO_COMPANIES = 'Nenhuma empresa neste recorte.';
const NO_EVIDENCE = 'As empresas deste recorte não têm evidências confirmadas com essa informação.';
const DECIMAL = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1 });

export const companies = (count: number) =>
  `${formatCount(count)} ${count === 1 ? 'empresa' : 'empresas'}`;

const records = (count: number) =>
  `${formatCount(count)} ${count === 1 ? 'registro' : 'registros'}`;

const toItems = (
  distribution: Distribution,
  labelOf: (item: Distribution[number]) => string = ({ label }) => label,
): ChartItem[] =>
  distribution.map((item) => ({ key: item.key, label: labelOf(item), value: item.count }));

const chartName = (heading: string, items: readonly ChartItem[]) =>
  `Gráfico de ${heading.toLowerCase()}: ${items[0]?.label ?? 'sem dados'} é a maior categoria. Os mesmos números estão na tabela.`;

/** Uma categoria só não é comparação: o texto diz o mesmo que uma fatia inteira. */
function emptyMessage(items: readonly ChartItem[], total: number, fallback: string): string {
  if (total === 0) return NO_COMPANIES;
  if (items.length === 1) return `Só uma categoria neste recorte: ${items[0].label}.`;

  return fallback;
}

/** A dica e os eixos usam o sinal de menos, como o restante da tela. */
const rangeNumber = (value: number) =>
  Number.isInteger(value) ? String(value).replace('-', '−') : DECIMAL.format(value);

const rangeLabel = ({ from, to }: Range) => `${rangeNumber(from)} a ${rangeNumber(to)}`;

function yearCategories(years: CompanyAnalytics['evidence']['year']) {
  const first = years[0]?.year;
  const last = years.at(-1)?.year;

  if (first === undefined || last === undefined) return { categories: [], values: [] };

  const counts = new Map(years.map(({ year, count }) => [year, count]));
  const span = Array.from({ length: last - first + 1 }, (_, index) => first + index);

  return {
    categories: span.map(String),
    values: span.map((year) => counts.get(year) ?? null),
  };
}

function rangeCards(
  analytics: CompanyAnalytics,
  {
    ods_number,
    companies_with_index,
    score_ranges,
    confidence_ranges,
  }: CompanyAnalytics['ods'][number],
): OverviewCard[] {
  const below = `Só ${companies(companies_with_index)} com índice no ODS ${ods_number} neste recorte. Médias e faixas aparecem a partir de ${formatCount(analytics.minimum_sample)}, para um caso isolado não parecer tendência. As contagens continuam acima.`;
  const card = (
    measure: string,
    ranges: readonly Range[],
    id: string,
    description: string,
  ): OverviewCard => {
    const heading = `${measure} no ODS ${ods_number}`;

    return {
      id,
      heading,
      description,
      emptyMessage: below,
      chart: ranges.length
        ? columnChart({
            label: `Gráfico de ${heading.toLowerCase()}, em faixas. Os mesmos números estão na tabela.`,
            categories: ranges.map(rangeLabel),
            series: [{ name: 'Empresas', values: ranges.map(({ count }) => count) }],
            headers: ['Faixa', 'Empresas'],
            sentence: (range, _series, count) =>
              `${companies(count)} com ${measure.toLowerCase()} de ${range}`,
          })
        : null,
    };
  };

  return [
    card(
      'Índice',
      score_ranges,
      `indice-${ods_number}`,
      'Só empresas com índice. Sem índice não é nota baixa.',
    ),
    card(
      'Confiança',
      confidence_ranges,
      `confianca-${ods_number}`,
      'Quanto a evidência sustenta o índice. Fica ao lado dele, sem se combinar.',
    ),
  ];
}

/** Os cards do panorama. Nenhum nomeia empresas (IND03), e as categorias só seguem o tamanho. */
export function overviewCards(analytics: CompanyAnalytics): OverviewCard[] {
  const { registration, evidence, ods } = analytics;
  const total = analytics.companies;
  const status = toItems(registration.status, ({ key }) =>
    registrationStatusLabel(key as RegistrationStatus, null),
  );
  const size = toItems(registration.size, ({ key, label }) =>
    key === 'NAO_INFORMADO' ? label : companySizeLabel(key),
  );
  const nature = toItems(registration.legal_nature);
  const uf = toItems(registration.uf);
  const sector = toItems(registration.sector);
  const biome = toItems(evidence.biome, ({ label }) => biomeLabel(label));
  const infraction = toItems(evidence.infraction_type);
  const sanction = toItems(evidence.sanction);
  const years = yearCategories(evidence.year);

  const distribution = (
    id: string,
    heading: string,
    items: ChartItem[],
    build: (items: ChartItem[], label: string) => ChartSpec,
    fallback: string,
    extra: Partial<OverviewCard> = {},
  ): OverviewCard => ({
    id,
    heading,
    emptyMessage: emptyMessage(items, total, fallback),
    chart: items.length > 1 ? build(items, chartName(heading, items)) : null,
    ...extra,
  });

  return [
    distribution(
      'situacao',
      'Situação cadastral',
      status,
      (items, label) =>
        donutChart({
          label,
          items,
          order: STATUS_ORDER,
          headers: ['Situação', 'Empresas'],
          sentence: (item) => `${companies(item.value)} com situação ${item.label.toLowerCase()}`,
        }),
      NO_COMPANIES,
    ),
    distribution(
      'porte',
      'Porte',
      size,
      (items, label) =>
        donutChart({
          label,
          items,
          order: SIZE_ORDER,
          headers: ['Porte', 'Empresas'],
          sentence: (item) => `${companies(item.value)}: ${item.label}`,
        }),
      NO_COMPANIES,
    ),
    distribution(
      'setor',
      'Setor',
      sector,
      (items, label) =>
        treemapChart({
          label,
          items,
          headers: ['Setor', 'Empresas'],
          sentence: (item) => `${companies(item.value)} atuam em ${item.label.toLowerCase()}`,
        }),
      NO_COMPANIES,
      { wide: true, description: 'A área de cada setor acompanha o número de empresas.' },
    ),
    distribution(
      'uf',
      'UF',
      uf,
      (items, label) =>
        barChart({
          label,
          items,
          headers: ['UF', 'Empresas'],
          sentence: (item) => `${companies(item.value)} em ${item.label}`,
        }),
      NO_COMPANIES,
    ),
    distribution(
      'natureza',
      'Natureza jurídica',
      nature,
      (items, label) =>
        barChart({
          label,
          items,
          headers: ['Natureza jurídica', 'Empresas'],
          sentence: (item) => `${companies(item.value)}: ${item.label}`,
        }),
      NO_COMPANIES,
    ),
    distribution(
      'bioma',
      'Bioma',
      biome,
      (items, label) =>
        barChart({
          label,
          items,
          headers: ['Bioma', 'Registros'],
          sentence: (item) => `${records(item.value)} no bioma ${item.label}`,
        }),
      NO_EVIDENCE,
      { description: 'Um registro pode citar mais de um bioma.' },
    ),
    distribution(
      'infracao',
      'Tipo de infração',
      infraction,
      (items, label) =>
        barChart({
          label,
          items,
          headers: ['Tipo de infração', 'Registros'],
          sentence: (item) => `${records(item.value)} do tipo ${item.label}`,
        }),
      NO_EVIDENCE,
    ),
    distribution(
      'sancao',
      'Sanção',
      sanction,
      (items, label) =>
        barChart({
          label,
          items,
          headers: ['Sanção', 'Registros'],
          labelWidth: 340,
          sentence: (item) => `${records(item.value)}: ${item.label}`,
        }),
      NO_EVIDENCE,
      { wide: true },
    ),
    {
      id: 'ano',
      heading: 'Evidências por ano',
      description: 'Pela data do fato registrado, e não pela data de coleta.',
      wide: true,
      emptyMessage: total === 0 ? NO_COMPANIES : NO_EVIDENCE,
      chart: evidence.year.length
        ? columnChart({
            label: 'Gráfico de evidências confirmadas por ano. Os mesmos números estão na tabela.',
            categories: years.categories,
            series: [{ name: 'Evidências confirmadas', values: years.values }],
            headers: ['Ano', 'Evidências confirmadas'],
            sentence: (year, _series, count) =>
              `${formatCount(count)} ${count === 1 ? 'evidência confirmada' : 'evidências confirmadas'} em ${year}`,
          })
        : null,
    },
    ...ods.flatMap((item) => rangeCards(analytics, item)),
  ];
}
