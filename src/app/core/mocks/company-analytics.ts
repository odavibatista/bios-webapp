import type { CompanyAnalytics, CompanyFullProfileResponse } from '../api/generated';

/** O que uma empresa soma ao panorama, sem texto que a identifique. */
export interface CompanyFacts {
  size: string | null;
  legalNature: readonly [code: string | null, label: string | null];
  sector: string;
  confirmedEvidences: number;
  fineNotices: number;
  fineAmount: number;
  hectares: number;
  biomes: Readonly<Record<string, number>>;
  infractionTypes: Readonly<Record<string, number>>;
  sanctions: Readonly<Record<string, number>>;
  years: Readonly<Record<string, number>>;
}

export interface AnalyticsScore {
  ods: number;
  score_value?: number | null;
  confidence_value?: number | null;
}

export interface AnalyticsCompany {
  registrationStatus: string;
  uf: string;
  scores: readonly AnalyticsScore[];
  facts: CompanyFacts;
}

interface Bucket {
  key: string | null;
  label?: string;
  count: number;
}

/** Os mesmos limites de `GET /companies/analytics`. */
const MINIMUM_SAMPLE = 5;
const MAX_CATEGORIES = 12;
const SCORE_RANGE = { min: -100, max: 100, width: 20 };
const CONFIDENCE_RANGE = { min: 0, max: 1, width: 0.2 };

function add(target: Record<string, number>, key: string): void {
  target[key] = (target[key] ?? 0) + 1;
}

/** O ano do fato: publicação, início da sanção ou ano do inventário, nunca a data de coleta. */
function factYear(publishedAt: string | null, details: Record<string, unknown>): number | null {
  const date = publishedAt ?? details['startDate'];

  if (typeof date === 'string') {
    const year = new Date(date).getUTCFullYear();

    return Number.isNaN(year) ? null : year;
  }

  return typeof details['inventoryYear'] === 'number' ? details['inventoryYear'] : null;
}

/** O que o panorama precisa do perfil de uma empresa. Só evidências confirmadas contam. */
export function companyFacts(profile: CompanyFullProfileResponse): CompanyFacts {
  const facts = {
    size: profile.company_size,
    legalNature: [profile.legal_nature_code, profile.legal_nature] as const,
    sector: profile.main_cnae.code.slice(0, 2),
    confirmedEvidences: 0,
    fineNotices: 0,
    fineAmount: 0,
    hectares: 0,
    biomes: {} as Record<string, number>,
    infractionTypes: {} as Record<string, number>,
    sanctions: {} as Record<string, number>,
    years: {} as Record<string, number>,
  };

  for (const { evidences } of profile.evidences) {
    for (const evidence of evidences) {
      if (evidence.state !== 'CONFIRMED') continue;

      const details = (evidence.details ?? {}) as Record<string, unknown>;
      const year = factYear(evidence.published_at, details);

      facts.confirmedEvidences += 1;
      if (typeof details['fine_amount'] === 'number') {
        facts.fineNotices += 1;
        facts.fineAmount += details['fine_amount'];
      }
      if (typeof details['area_hectares'] === 'number') facts.hectares += details['area_hectares'];
      if (typeof details['biomes'] === 'string') {
        for (const biome of details['biomes'].split(',')) {
          if (biome.trim()) add(facts.biomes, biome.trim());
        }
      }
      if (typeof details['infraction_type'] === 'string') {
        add(facts.infractionTypes, details['infraction_type']);
      }
      if (typeof details['sanctionType'] === 'string')
        add(facts.sanctions, details['sanctionType']);
      if (year !== null) add(facts.years, String(year));
    }
  }

  return facts;
}

function toDistribution(
  buckets: readonly Bucket[],
  labelOf: (key: string) => string = (key) => key,
): CompanyAnalytics['registration']['status'] {
  const sorted = buckets
    .map(({ key, label, count }) => ({
      key: key ?? 'NAO_INFORMADO',
      label: key === null ? 'Não informado' : (label ?? labelOf(key)),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  if (sorted.length <= MAX_CATEGORIES) return sorted;

  const others = sorted.slice(MAX_CATEGORIES - 1).reduce((total, { count }) => total + count, 0);

  return [
    ...sorted.slice(0, MAX_CATEGORIES - 1),
    { key: 'OUTROS', label: 'Outros', count: others },
  ];
}

function countBy<T>(items: readonly T[], keyOf: (item: T) => string | null): Bucket[] {
  const counts = new Map<string | null, number>();

  for (const item of items) {
    const key = keyOf(item);

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts].map(([key, count]) => ({ key, count }));
}

function sumOf(
  companies: readonly AnalyticsCompany[],
  groupOf: (facts: CompanyFacts) => Readonly<Record<string, number>>,
): Bucket[] {
  const totals = new Map<string, number>();

  for (const { facts } of companies) {
    for (const [key, count] of Object.entries(groupOf(facts))) {
      totals.set(key, (totals.get(key) ?? 0) + count);
    }
  }

  return [...totals].map(([key, count]) => ({ key, count }));
}

function toRanges(
  values: readonly number[],
  { min, max, width }: typeof SCORE_RANGE,
): CompanyAnalytics['ods'][number]['score_ranges'] {
  const size = Math.round((max - min) / width);
  const counts = new Array<number>(size).fill(0);

  for (const value of values) {
    counts[Math.min(Math.floor((value - min) / width + 1e-9), size - 1)] += 1;
  }

  return counts.map((count, index) => ({
    from: Number((min + index * width).toFixed(1)),
    to: Number((min + (index + 1) * width).toFixed(1)),
    count,
  }));
}

function average(values: readonly number[]): number | null {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function odsAnalytics(
  ods: number,
  companies: readonly AnalyticsCompany[],
): CompanyAnalytics['ods'][number] {
  const rows = companies.flatMap((company) =>
    company.scores.flatMap(({ ods: number, score_value, confidence_value }) =>
      number === ods && typeof confidence_value === 'number'
        ? [{ score: score_value ?? null, confidence: confidence_value }]
        : [],
    ),
  );
  const indexed = rows.flatMap(({ score, confidence }) =>
    score === null ? [] : [{ score, confidence }],
  );
  const hidden = indexed.length < MINIMUM_SAMPLE;

  return {
    ods_number: ods,
    companies: rows.length,
    companies_with_index: indexed.length,
    average_score: hidden ? null : average(indexed.map(({ score }) => score)),
    average_confidence: hidden ? null : average(rows.map(({ confidence }) => confidence)),
    score_ranges: hidden
      ? []
      : toRanges(
          indexed.map(({ score }) => score),
          SCORE_RANGE,
        ),
    confidence_ranges: hidden
      ? []
      : toRanges(
          indexed.map(({ confidence }) => confidence),
          CONFIDENCE_RANGE,
        ),
  };
}

/** A resposta de `GET /companies/analytics` para um conjunto de empresas. */
export function summarizeCompanies(
  companies: readonly AnalyticsCompany[],
  ods: readonly number[],
  sectorName: (division: string) => string,
): CompanyAnalytics {
  const natures = new Map<string | null, Bucket>();

  for (const { facts } of companies) {
    const [key, label] = facts.legalNature;
    const bucket = natures.get(key) ?? { key, label: label ?? undefined, count: 0 };

    bucket.count += 1;
    natures.set(key, bucket);
  }

  return {
    companies: companies.length,
    minimum_sample: MINIMUM_SAMPLE,
    totals: {
      confirmed_evidences: companies.reduce((sum, c) => sum + c.facts.confirmedEvidences, 0),
      fine_notices: companies.reduce((sum, c) => sum + c.facts.fineNotices, 0),
      fine_amount: companies.reduce((sum, c) => sum + c.facts.fineAmount, 0),
      area_hectares: companies.reduce((sum, c) => sum + c.facts.hectares, 0),
    },
    registration: {
      status: toDistribution(countBy(companies, (company) => company.registrationStatus)),
      size: toDistribution(countBy(companies, (company) => company.facts.size)),
      legal_nature: toDistribution([...natures.values()]),
      uf: toDistribution(countBy(companies, (company) => company.uf)),
      sector: toDistribution(
        countBy(companies, (company) => company.facts.sector),
        sectorName,
      ),
    },
    evidence: {
      biome: toDistribution(sumOf(companies, (facts) => facts.biomes)),
      infraction_type: toDistribution(sumOf(companies, (facts) => facts.infractionTypes)),
      sanction: toDistribution(sumOf(companies, (facts) => facts.sanctions)),
      year: sumOf(companies, (facts) => facts.years)
        .map(({ key, count }) => ({ year: Number(key), count }))
        .sort((a, b) => a.year - b.year),
    },
    ods: ods.map((number) => odsAnalytics(number, companies)),
  };
}
