import { LOCATION_FIXTURE } from './location-fixture';
import { TestBed } from '@angular/core/testing';
import { InMemoryApiCredentials } from '../api/api-credentials';
import { BiosApi } from '../api/bios-api';
import type {
  CompanyAnalytics,
  CompanyIndexEvolution,
  CompanyMovementItem,
  ScoreExplanationResponse,
  SectorEvolution,
} from '../api/generated';
import { companyFacts } from './company-analytics';
import { CompanyArchive, type ArchivedCompany, type CompanyEntry } from './company-archive';
import { entryOf, PROFILES } from './mock-companies';
import { provideMockBiosApi } from './provide-mock-bios-api';

const PROFILE = PROFILES.get('17469701000177')!;
const EXPLANATION = { cnpj: PROFILE.cnpj, ods_number: 13 } as ScoreExplanationResponse;
const SERIES = { cnae_division: '10', ods_number: 13 } as SectorEvolution;
const BASE_ANALYTICS = { companies: 110372 } as CompanyAnalytics;
const EVOLUTION = { cnpj: PROFILE.cnpj, reconstructed: true, ods: [] } as CompanyIndexEvolution;

const MOVEMENTS = ['1', '2', '3'].map(
  (cnpj, index) =>
    ({
      cnpj,
      ods: [
        { movement: { evidence_category: index === 1 ? 'EMISSAO_GEE' : 'INFRACAO_AMBIENTAL' } },
      ],
    }) as CompanyMovementItem,
);

class MemoryArchive extends CompanyArchive {
  /** Só uma empresa: se o mock usasse as capturas, a pesquisa traria as outras. */
  entriesList: CompanyEntry[] = [entryOf(PROFILE)];

  entries = (): Promise<readonly CompanyEntry[]> => Promise.resolve(this.entriesList);

  company = (cnpj: string): Promise<ArchivedCompany | null> =>
    Promise.resolve(
      cnpj === PROFILE.cnpj
        ? { profile: PROFILE, explanations: { 13: EXPLANATION }, evolution: EVOLUTION }
        : null,
    );

  sectors = () =>
    Promise.resolve({
      data: [
        { cnae_division: '10', description: 'ALIMENTOS' },
        { cnae_division: '24', description: 'METALURGIA' },
      ],
    });

  evolution = (division: string) => Promise.resolve(division === '10' ? SERIES : null);

  movements = () => Promise.resolve(MOVEMENTS);

  facts = () => Promise.resolve(new Map([[PROFILE.cnpj, companyFacts(PROFILE)]]));

  baseAnalytics = () => Promise.resolve(BASE_ANALYTICS);

  locations = () => Promise.resolve(LOCATION_FIXTURE);
}

describe('MockBiosApi com a base publicada', () => {
  let api: BiosApi;
  let archive: MemoryArchive;

  const expectError = (call: Promise<unknown>, status: number, code: string) =>
    expect(call).rejects.toMatchObject({ status, code });

  beforeEach(async () => {
    archive = new MemoryArchive();
    TestBed.configureTestingModule({
      providers: [
        provideMockBiosApi({ latencyMs: 0, exportMaxCompanies: 1 }),
        { provide: CompanyArchive, useValue: archive },
      ],
    });
    api = TestBed.inject(BiosApi);

    const session = await api.login({
      body: { email: 'apresentacao@example.com', password: 'Apresentacao2026' },
    });

    TestBed.inject(InMemoryApiCredentials).setAccessToken(session.access_token);
  });

  it('lê o perfil do arquivo, também com o CNPJ mascarado', async () => {
    await expect(
      api.getCompanyProfile({ path: { cnpj: '17.469.701/0001-77' } }),
    ).resolves.toMatchObject({ cnpj: PROFILE.cnpj, legal_name: PROFILE.legal_name });
  });

  it('lê a explicação do arquivo', async () => {
    await expect(
      api.getScoreExplanation({ path: { cnpj: PROFILE.cnpj, odsNumber: 13 } }),
    ).resolves.toEqual(EXPLANATION);
  });

  it('CNPJ inválido e empresa fora da base têm os erros da API', async () => {
    await expectError(api.getCompanyProfile({ path: { cnpj: '123' } }), 422, 'INVALID_CNPJ');
    await expectError(
      api.getCompanyProfile({ path: { cnpj: '60894730000105' } }),
      404,
      'COMPANY_NOT_FOUND',
    );
  });

  it('empresa fora da base não é apresentada como inexistente nas fontes oficiais', async () => {
    await expect(api.getCompanyProfile({ path: { cnpj: '60894730000105' } })).rejects.toThrow(
      'Este CNPJ não está na base da apresentação',
    );
  });

  it('a lista de movimentações vem da base, na ordem publicada, paginada', async () => {
    await expect(api.listCompanyMovements({ query: { page: 2, page_size: 2 } })).resolves.toEqual({
      data: [MOVEMENTS[2]],
      pagination: { page: 2, page_size: 2, total: 3, total_pages: 2 },
    });
  });

  it('filtra a base publicada pela categoria e pagina somente os resultados', async () => {
    await expect(
      api.listCompanyMovements({ query: { category: 'EMISSAO_GEE', page: 1, page_size: 2 } }),
    ).resolves.toEqual({
      data: [MOVEMENTS[1]],
      pagination: { page: 1, page_size: 2, total: 1, total_pages: 1 },
    });
  });

  it('pesquisa na base, e não nas respostas capturadas dos mesmos critérios', async () => {
    const found = await api.searchCompanies({ query: { cnae: '24', ods: 13, order: 'desc' } });

    expect(found.data.map((item) => item.cnpj)).toEqual([PROFILE.cnpj]);
    expect(found.pagination.total).toBe(1);
  });

  it('monta a planilha de qualquer pesquisa, com o nome de arquivo da API', async () => {
    const { blob, filename } = await api.exportCompaniesXlsx({ query: { uf: 'MG' } });

    expect(blob.size).toBeGreaterThan(1000);
    expect(filename).toMatch(/^empresas-bios-\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it('exportação sem resultado e acima do teto têm os erros da API', async () => {
    await expectError(
      api.exportCompaniesXlsx({ query: { name: 'nada parecido' } }),
      404,
      'NO_RESULTS_TO_EXPORT',
    );

    archive.entriesList = [entryOf(PROFILE), entryOf(PROFILES.get('60894730000105')!)];

    await expectError(api.exportCompaniesXlsx({ query: { cnae: '24' } }), 422, 'EXPORT_TOO_LARGE');
  });

  it('entrega a evolução guardada com a empresa', async () => {
    await expect(api.getCompanyIndexEvolution({ path: { cnpj: PROFILE.cnpj } })).resolves.toBe(
      EVOLUTION,
    );
    await expectError(
      api.getCompanyIndexEvolution({ path: { cnpj: '04735087000104' } }),
      404,
      'COMPANY_NOT_FOUND',
    );
  });

  it('o panorama sem critério cobre a base, e com critério só o que a pesquisa traria', async () => {
    const all = await api.getCompanyAnalytics({ query: { uf: 'MG' } });
    const none = await api.getCompanyAnalytics({ query: { uf: 'AC' } });

    await expect(api.getCompanyAnalytics()).resolves.toBe(BASE_ANALYTICS);
    expect(all.companies).toBe(1);
    expect(all.totals.confirmed_evidences).toBe(companyFacts(PROFILE).confirmedEvidences);
    expect(all.registration.sector).toEqual([{ key: '24', label: 'METALURGIA', count: 1 }]);
    expect(none.companies).toBe(0);
  });

  it('entrega setores e série do arquivo, e setor sem série é avisado', async () => {
    await expect(api.listSectors()).resolves.toMatchObject({
      data: [{ cnae_division: '10' }, { cnae_division: '24' }],
    });
    await expect(
      api.getSectorEvolution({ path: { cnae: '10' }, query: { ods: 13 } }),
    ).resolves.toEqual(SERIES);
    await expectError(
      api.getSectorEvolution({ path: { cnae: '24' }, query: { ods: 13 } }),
      422,
      'NOT_AVAILABLE_IN_PRESENTATION',
    );
  });
});
