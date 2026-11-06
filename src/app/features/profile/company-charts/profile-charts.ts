import type {
  CompanyEvidence,
  CompanyFullProfileResponse,
  CompanySourceProvenance,
  EvidenceCategoryGroup,
} from '../../../core/api/generated';
import { factDate } from '../../../core/mocks/company-movements';
import {
  columnChart,
  donutChart,
  barChart,
  pointsChart,
} from '../../../shared/charts/chart-builders';
import {
  type ChartItem,
  type ChartSpec,
  foldCategories,
  formatCount,
  MAX_SLICES,
} from '../../../shared/charts/chart-spec';
import { biomeLabel } from '../../overview/overview-charts';
import { CATEGORY_LABELS, SOURCE_LABELS } from '../environmental-evidences/evidence-presentation';
import { formatScorePoints } from '../ods-scores/score-presentation';

type Score = CompanyFullProfileResponse['ods_scores'][number];
type Category = EvidenceCategoryGroup['category'];

export interface ProfileCard {
  id: string;
  heading: string;
  description?: string;
  chart: ChartSpec | null;
  emptyMessage: string;
  /** Aviso abaixo do gráfico, como o de evidências sem data. */
  note?: string;
  wide?: boolean;
}

export interface SourceResult {
  source: string;
  label: string;
  icon: string;
  count: number;
}

/** A cor de cada tipo não muda com a empresa aberta. */
const CATEGORY_ORDER: readonly Category[] = [
  'INFRACAO_AMBIENTAL',
  'CONDUTA_ADMINISTRATIVA',
  'EMISSAO_GEE',
];
const MAX_POINTS = 12;

const evidences = (count: number) =>
  `${formatCount(count)} ${count === 1 ? 'evidência' : 'evidências'}`;

/** Ano do fato; o da coleta nunca entra (UC15, regra 8). */
function yearOf(evidence: CompanyEvidence): string | null {
  return factDate(evidence)?.slice(0, 4) ?? null;
}

function confirmed(profile: CompanyFullProfileResponse) {
  return profile.evidences.flatMap(({ category, evidences: items }) =>
    items.filter(({ state }) => state === 'CONFIRMED').map((evidence) => ({ category, evidence })),
  );
}

function timelineCard(profile: CompanyFullProfileResponse): ProfileCard {
  const items = confirmed(profile);
  const dated = items.flatMap(({ category, evidence }) => {
    const year = yearOf(evidence);

    return year ? [{ category, year: Number(year) }] : [];
  });
  const undated = items.length - dated.length;
  const years = [...new Set(dated.map(({ year }) => year))].sort((a, b) => a - b);
  const note =
    undated > 0
      ? `${evidences(undated)} sem data ${undated === 1 ? 'fica' : 'ficam'} fora da linha do tempo.`
      : undefined;
  const base = { id: 'linha-do-tempo', heading: 'Linha do tempo', wide: true, note };

  if (years.length < 2) {
    return {
      ...base,
      chart: null,
      emptyMessage: years.length
        ? dated.length === 1
          ? `Uma evidência com data, de ${String(years[0])}.`
          : `${evidences(dated.length)} com data, todas de ${String(years[0])}.`
        : 'Sem evidências confirmadas com data.',
    };
  }

  const span = Array.from(
    { length: years[years.length - 1] - years[0] + 1 },
    (_, index) => years[0] + index,
  );

  return {
    ...base,
    description: 'Evidências confirmadas por ano do fato registrado, e não da coleta.',
    emptyMessage: '',
    chart: columnChart({
      label: `Gráfico de evidências confirmadas por ano, de ${String(years[0])} a ${String(years[years.length - 1])}. Os mesmos números estão na tabela.`,
      categories: span.map(String),
      series: CATEGORY_ORDER.flatMap((category, order) => {
        const rows = dated.filter((item) => item.category === category);

        return rows.length
          ? [
              {
                name: CATEGORY_LABELS[category],
                order,
                values: span.map(
                  (year) => rows.filter((item) => item.year === year).length || null,
                ),
              },
            ]
          : [];
      }),
      headers: ['Ano', 'Evidências'],
      sentence: (year, series, count) => `${evidences(count)} em ${year}: ${series.name}`,
    }),
  };
}

function compositionCard({ ods_number, score_value, contributions }: Score): ProfileCard | null {
  if (score_value === null || !contributions.length) return null;

  const scoring = contributions
    .filter(({ points }) => points !== 0)
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  const withoutPoints = contributions.length - scoring.length;
  const items = foldCategories(
    scoring.map(({ evidence, points }, index) => ({
      key: `${evidence.id}-${String(index)}`,
      label: `${evidence.source_slug.replace('_', ' ')} ${evidence.source_reference ?? ''}`.trim(),
      value: points,
    })),
    MAX_POINTS,
  );
  const heading = `Composição do índice no ODS ${String(ods_number)}`;
  const note =
    withoutPoints > 0
      ? `${evidences(withoutPoints)} sem pontos: o teto da categoria já tinha sido atingido.`
      : undefined;

  return {
    id: `composicao-${String(ods_number)}`,
    heading,
    note,
    emptyMessage:
      items.length === 1
        ? `Uma evidência soma os pontos deste índice: ${formatScorePoints(items[0].value)}.`
        : 'Nenhuma evidência somou pontos neste índice.',
    description: 'Os pontos de cada evidência, a partir da explicação do índice.',
    chart:
      items.length > 1
        ? pointsChart({
            label: `Gráfico da ${heading.toLowerCase()}, com os pontos de cada evidência. Os mesmos números estão na tabela.`,
            items,
            headers: ['Evidência', 'Pontos'],
            format: formatScorePoints,
            sentence: ({ label, value }) => `${label}: ${formatScorePoints(value)} pontos`,
          })
        : null,
  };
}

function countValues(values: readonly string[]): ChartItem[] {
  const counts = new Map<string, number>();

  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  return [...counts]
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
}

function distributionCard(
  id: string,
  heading: string,
  values: readonly string[],
): ProfileCard | null {
  const items = countValues(values);

  if (!items.length) return null;

  const spec = {
    label: `Gráfico de ${heading.toLowerCase()}: ${items[0].label} é a maior categoria. Os mesmos números estão na tabela.`,
    items,
    headers: [heading, 'Evidências'] as const,
    sentence: ({ label, value }: ChartItem) => `${evidences(value)}: ${label}`,
  };

  return {
    id,
    heading,
    emptyMessage: `Só uma categoria: ${items[0].label} (${evidences(items[0].value)}).`,
    // Duas categorias ou mais: uma só seria uma fatia inteira.
    chart: items.length < 2 ? null : items.length > MAX_SLICES ? barChart(spec) : donutChart(spec),
  };
}

const detail = (evidence: CompanyEvidence, name: string): string | null => {
  const details = evidence.details;

  if (!details || Array.isArray(details) || typeof details !== 'object') return null;

  const value = details[name];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

/** Os cards do perfil. O índice e a confiança não se combinam, nem os ODS entre si. */
export function profileCards(profile: CompanyFullProfileResponse): ProfileCard[] {
  const items = confirmed(profile).map(({ evidence }) => evidence);

  if (!items.length) return [];

  const values = (name: string) => items.flatMap((item) => detail(item, name) ?? []);
  const biomes = values('biomes').flatMap((text) =>
    text
      .split(',')
      .map((biome) => biomeLabel(biome.trim()))
      .filter(Boolean),
  );

  return [
    timelineCard(profile),
    ...[...profile.ods_scores]
      .sort((a, b) => a.ods_number - b.ods_number)
      .flatMap((score) => compositionCard(score) ?? []),
    distributionCard('tipo', 'Tipo de infração', values('infraction_type')),
    distributionCard('bioma', 'Bioma', biomes),
    distributionCard('gravidade', 'Gravidade', values('severity')),
  ].filter((card) => card !== null);
}

const RESULT: Record<string, Pick<SourceResult, 'label' | 'icon'>> = {
  CONFIRMED: { label: 'Encontrado', icon: 'manage_search' },
  NOT_FOUND: { label: 'Nada encontrado', icon: 'search' },
  UNKNOWN: { label: 'Sem resposta', icon: 'info' },
  OUTDATED: { label: 'Dados desatualizados', icon: 'info' },
};
const PENDING = { label: 'Consulta pendente', icon: 'hourglass_top' };

/**
 * O que cada fonte respondeu. "Nada encontrado" não é ponto positivo, e "sem resposta" não é ponto
 * negativo (IND02): os ícones e o texto não usam cor nem julgamento.
 */
export function sourceResults(profile: CompanyFullProfileResponse): SourceResult[] {
  return profile.provenance.sources.map(
    ({ source_slug, origin, evidence_state }: CompanySourceProvenance) => {
      const result =
        origin === 'PENDING' ? PENDING : (RESULT[evidence_state ?? 'UNKNOWN'] ?? RESULT['UNKNOWN']);

      return {
        ...result,
        source: SOURCE_LABELS[source_slug],
        count: confirmed(profile).filter(({ evidence }) => evidence.source_slug === source_slug)
          .length,
      };
    },
  );
}
