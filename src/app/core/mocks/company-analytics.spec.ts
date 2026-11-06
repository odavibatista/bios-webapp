import type { CompanyFullProfileResponse } from '../api/generated';
import {
  companyFacts,
  summarizeCompanies,
  type AnalyticsCompany,
  type CompanyFacts,
} from './company-analytics';

const FACTS: CompanyFacts = {
  size: 'DEMAIS',
  legalNature: ['2054', 'Sociedade Anônima Fechada'],
  sector: '24',
  confirmedEvidences: 0,
  fineNotices: 0,
  fineAmount: 0,
  hectares: 0,
  biomes: {},
  infractionTypes: {},
  sanctions: {},
  years: {},
};

function company(
  overrides: Partial<CompanyFacts> = {},
  score: number | null = 40,
): AnalyticsCompany {
  return {
    registrationStatus: 'ATIVA',
    uf: 'SP',
    scores: [{ ods: 13, score_value: score, confidence_value: 0.5 }],
    facts: { ...FACTS, ...overrides },
  };
}

const summarize = (companies: AnalyticsCompany[]) =>
  summarizeCompanies(companies, [13], (division) => `Divisão ${division}`);

describe('companyFacts', () => {
  const evidence = (state: string, publishedAt: string | null, details: object) => ({
    state,
    published_at: publishedAt,
    details,
  });
  const profile = (...evidences: object[]) =>
    ({
      company_size: 'ME',
      legal_nature_code: '2062',
      legal_nature: 'Sociedade Limitada',
      main_cnae: { code: '2423702' },
      evidences: [{ evidences }],
    }) as unknown as CompanyFullProfileResponse;

  it('soma só as evidências confirmadas', () => {
    const facts = companyFacts(
      profile(
        evidence('CONFIRMED', '2020-03-01T00:00:00.000Z', {
          fine_amount: 100,
          area_hectares: 2,
          biomes: 'Cerrado, Amazônia',
          infraction_type: 'Flora',
        }),
        evidence('NOT_FOUND', '2021-03-01T00:00:00.000Z', { fine_amount: 900 }),
        evidence('UNKNOWN', null, {}),
      ),
    );

    expect(facts).toMatchObject({
      size: 'ME',
      sector: '24',
      confirmedEvidences: 1,
      fineNotices: 1,
      fineAmount: 100,
      hectares: 2,
      biomes: { Cerrado: 1, Amazônia: 1 },
      infractionTypes: { Flora: 1 },
      years: { 2020: 1 },
    });
  });

  it('usa a data do fato, e nunca conta uma evidência sem data num ano', () => {
    const { years, sanctions } = companyFacts(
      profile(
        evidence('CONFIRMED', null, { startDate: '2019-05-01', sanctionType: 'Inidoneidade' }),
        evidence('CONFIRMED', null, { inventoryYear: 2022 }),
        evidence('CONFIRMED', null, {}),
      ),
    );

    expect(years).toEqual({ 2019: 1, 2022: 1 });
    expect(sanctions).toEqual({ Inidoneidade: 1 });
  });
});

describe('summarizeCompanies', () => {
  it('soma os totais e ordena as categorias pelo tamanho', () => {
    const result = summarize([
      company({ confirmedEvidences: 2, fineNotices: 1, fineAmount: 10, hectares: 1 }),
      company({ confirmedEvidences: 1, size: null, sector: '10' }),
      company({ size: null, sector: '10' }),
    ]);

    expect(result.companies).toBe(3);
    expect(result.totals).toEqual({
      confirmed_evidences: 3,
      fine_notices: 1,
      fine_amount: 10,
      area_hectares: 1,
    });
    expect(result.registration.size).toEqual([
      { key: 'NAO_INFORMADO', label: 'Não informado', count: 2 },
      { key: 'DEMAIS', label: 'DEMAIS', count: 1 },
    ]);
    expect(result.registration.sector[0]).toEqual({ key: '10', label: 'Divisão 10', count: 2 });
    expect(result.registration.legal_nature).toEqual([
      { key: '2054', label: 'Sociedade Anônima Fechada', count: 3 },
    ]);
  });

  it('acima de 12 categorias, as menores viram "Outros"', () => {
    const { registration } = summarize(
      Array.from({ length: 14 }, (_, index) => ({ ...company(), uf: `U${index}` })),
    );

    expect(registration.uf).toHaveLength(12);
    expect(registration.uf.at(-1)).toEqual({ key: 'OUTROS', label: 'Outros', count: 3 });
  });

  it('abaixo da amostra mínima mantém as contagens e omite médias e faixas', () => {
    const [ods] = summarize([company(), company(), company(), company()]).ods;

    expect(ods).toEqual({
      ods_number: 13,
      companies: 4,
      companies_with_index: 4,
      average_score: null,
      average_confidence: null,
      score_ranges: [],
      confidence_ranges: [],
    });
  });

  it('calcula média e faixas só com quem tem índice, sem tratar a ausência como zero', () => {
    const scored = [-100, 0, 20, 100, 100].map((value) => company({}, value));
    const [ods] = summarize([...scored, company({}, null)]).ods;

    expect(ods.companies_with_index).toBe(5);
    expect(ods.average_score).toBe(24);
    expect(ods.score_ranges).toHaveLength(10);
    expect(ods.score_ranges[0]).toEqual({ from: -100, to: -80, count: 1 });
    expect(ods.score_ranges[5]).toEqual({ from: 0, to: 20, count: 1 });
    expect(ods.score_ranges[9]).toEqual({ from: 80, to: 100, count: 2 });
    expect(ods.confidence_ranges).toHaveLength(5);
    expect(ods.confidence_ranges[2]).toEqual({ from: 0.4, to: 0.6, count: 5 });
  });

  it('junta os anos em ordem, sem criar anos vazios', () => {
    const { evidence } = summarize([
      company({ years: { 2021: 1 } }),
      company({ years: { 2019: 2 } }),
    ]);

    expect(evidence.year).toEqual([
      { year: 2019, count: 2 },
      { year: 2021, count: 1 },
    ]);
  });
});
