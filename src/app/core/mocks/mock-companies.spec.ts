import type { SearchCompaniesData, SearchCompaniesResponse } from '../api/generated';
import { capturesOf } from './mock-captures';
import {
  capturedExportFile,
  capturedSearch,
  companyProfile,
  isValidCnpj,
  normalizeCnpj,
  pathWithQuery,
  PROFILES,
  searchCriteriaError,
  searchProfiles,
  sectorEvolution,
  words,
} from './mock-companies';

type Query = NonNullable<SearchCompaniesData['query']>;

const NOW = Date.parse('2026-10-30T12:00:00Z');

/** A busca de uma captura, com os números de volta a número (a captura guarda texto). */
function queryOf(raw: Record<string, string> | undefined): Query {
  const numeric = ['ods', 'min_score', 'min_confidence', 'page', 'page_size'];

  return Object.fromEntries(
    Object.entries(raw ?? {}).map(([key, value]) => [
      key,
      numeric.includes(key) ? Number(value) : value,
    ]),
  );
}

describe('regras de empresas do mock', () => {
  describe('CNPJ', () => {
    it('aceita CNPJ numérico válido, com ou sem máscara', () => {
      expect(isValidCnpj('60894730000105')).toBe(true);
      expect(normalizeCnpj('60.894.730/0001-05')).toBe('60894730000105');
    });

    it('aceita o CNPJ alfanumérico (exemplo oficial da Receita, 12.ABC.345/01DE-35)', () => {
      expect(isValidCnpj(normalizeCnpj('12.abc.345/01de-35'))).toBe(true);
    });

    it('recusa dígito verificador errado, tamanho errado e dígitos repetidos', () => {
      expect(isValidCnpj('60894730000106')).toBe(false);
      expect(isValidCnpj('12345678000100')).toBe(false);
      expect(isValidCnpj('6089473000010')).toBe(false);
      expect(isValidCnpj('11111111111111')).toBe(false);
    });
  });

  it('a base local são os perfis completos capturados, sem a consulta ainda pendente', () => {
    expect(PROFILES.size).toBe(14);
    expect([...PROFILES.values()].every((profile) => !profile.provenance.scores_pending)).toBe(
      true,
    );
  });

  it('compara nomes sem acento, caixa nem pontuação', () => {
    expect(words('Aço Cearense — S/A')).toEqual(['aco', 'cearense', 's', 'a']);
    expect(words(null)).toEqual([]);
  });

  it('monta o caminho com a busca como a API registra nos erros', () => {
    expect(pathWithQuery('/companies', { cnae: '24', ods: 7, name: undefined })).toBe(
      '/companies?cnae=24&ods=7',
    );
    expect(pathWithQuery('/companies', undefined)).toBe('/companies');
  });

  describe('pesquisa refeita sobre os perfis', () => {
    const searches = capturesOf('searchCompanies').filter((item) => item.status === 200);

    it.each(searches.map((item) => [item.scenario, item] as const))(
      'dá o mesmo resultado da API real: %s',
      (_scenario, item) => {
        expect(searchProfiles(queryOf(item.request.query))).toEqual(
          item.body as SearchCompaniesResponse,
        );
      },
    );

    it('pesquisa capturada volta como foi capturada; outra página não', () => {
      expect(capturedSearch({ name: 'gerdau' })).toEqual(
        searches.find((item) => item.scenario === 'nome')?.body,
      );
      expect(capturedSearch({ name: 'gerdau', page: 2 })).toBeNull();
    });

    it('filtra por município sem acento, pelo CNAE secundário e pela confiança mínima', () => {
      expect(searchProfiles({ city: 'São Paulo' }).data.map((item) => item.uf)).toEqual(
        expect.arrayContaining(['SP']),
      );
      expect(searchProfiles({ cnae: '8211300' }).pagination.total).toBeGreaterThan(0);
      expect(
        searchProfiles({ ods: 15, min_confidence: 0.7 }).data.every(
          (item) => (item.ods_score?.confidence_value ?? 0) >= 0.7,
        ),
      ).toBe(true);
    });

    it('sem ordenação e sem nome, ordena pela razão social', () => {
      const names = searchProfiles({ cnae: '24', page_size: 100 }).data.map(
        (item) => item.legal_name,
      );

      expect(names).toEqual([...names].sort());
    });
  });

  describe('validação dos critérios (UC08, regras 3 e 8)', () => {
    it.each([
      ['sem critério', {}, 'VALIDATION_FAILED'],
      ['nome sem palavra de 3 letras', { name: 'ab' }, 'VALIDATION_FAILED'],
      ['ODS não calculado', { cnae: '24', ods: 7 }, 'ODS_NOT_AVAILABLE'],
      ['índice mínimo sem ODS', { cnae: '24', min_score: 10 }, 'VALIDATION_FAILED'],
    ] as const)('%s', (_label, query, code) => {
      expect(searchCriteriaError(query as Query, '/companies', NOW)?.code).toBe(code);
    });

    it('o erro de ODS cita o número pedido e os disponíveis', () => {
      const error = searchCriteriaError({ cnae: '24', ods: 3 }, '/companies?cnae=24&ods=3', NOW);

      expect(error?.message).toBe('O ODS 3 não é calculado pelo BIOS. ODS disponíveis: 13, 15.');
      expect(error?.details).toEqual({ ods: 3, valid_ods: [13, 15] });
      expect(error?.body.path).toBe('/companies?cnae=24&ods=3');
      expect(error?.body.timestamp).toBe('2026-10-30T12:00:00.000Z');
    });

    it('o filtro sem ODS aponta o campo informado', () => {
      expect(
        searchCriteriaError({ uf: 'MG', min_confidence: 0.5 }, '/companies', NOW)?.details,
      ).toEqual([
        { path: 'min_confidence', message: 'Informe o ODS (`ods`) a que o filtro se refere.' },
      ]);
    });

    it('critérios válidos não dão erro', () => {
      expect(
        searchCriteriaError({ cnae: '24', ods: 13, order: 'desc' }, '/companies', NOW),
      ).toBeNull();
    });
  });

  it('acha a planilha capturada pelos critérios, sem contar a paginação', () => {
    expect(capturedExportFile({ cnae: '24', ods: 13, order: 'desc' })?.file).toBe(
      'setor-ods-13-desc.xlsx',
    );
    expect(capturedExportFile({ name: 'gerdau', page: 3 })?.file).toBe('nome.xlsx');
    expect(capturedExportFile({ cnae: '47' })).toBeNull();
  });

  describe('perfil (UC06)', () => {
    it('devolve uma cópia do perfil capturado, também com o CNPJ mascarado', () => {
      const profile = companyProfile('60.894.730/0001-05', NOW);

      expect(profile).toEqual(PROFILES.get('60894730000105'));
      expect(profile).not.toBe(PROFILES.get('60894730000105'));
    });

    it('CNPJ inválido é 422 INVALID_CNPJ, e CNPJ fora da base é 404 COMPANY_NOT_FOUND', () => {
      expect(() => companyProfile('12345678000100', NOW)).toThrow(
        expect.objectContaining({ status: 422, code: 'INVALID_CNPJ' }),
      );
      expect(() => companyProfile('12ABC34501DE35', NOW)).toThrow(
        expect.objectContaining({ status: 404, code: 'COMPANY_NOT_FOUND' }),
      );
    });
  });

  describe('evolução setorial (UC10)', () => {
    it('devolve a série capturada da divisão, também a partir de um grupo ou classe', () => {
      expect(sectorEvolution('24', 13, NOW).cnae_division_description).toBe('METALURGIA');
      expect(sectorEvolution('24.2', 15, NOW).ods_number).toBe(15);
      expect(sectorEvolution('01', 13, NOW).windows).toEqual([]);
    });

    it('CNAE fora do formato, ODS não calculado e setor fora da apresentação são erros', () => {
      expect(() => sectorEvolution('abc', 13, NOW)).toThrow(
        expect.objectContaining({ status: 422, code: 'VALIDATION_FAILED' }),
      );
      expect(() => sectorEvolution('24', 7, NOW)).toThrow(
        expect.objectContaining({ status: 422, code: 'ODS_NOT_AVAILABLE' }),
      );
      expect(() => sectorEvolution('62', 13, NOW)).toThrow(
        expect.objectContaining({ status: 422, code: 'NOT_AVAILABLE_IN_PRESENTATION' }),
      );
    });
  });
});
