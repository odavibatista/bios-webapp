import {
  criteriaFromParams,
  criteriaToParams,
  DEFAULT_PAGE_SIZE,
  hasCriterion,
  type SearchCriteria,
  toApiQuery,
} from './search-criteria';

const EMPTY: SearchCriteria = {
  name: null,
  uf: null,
  city: null,
  cnae: null,
  ods: null,
  minScore: null,
  minConfidence: null,
  order: null,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

describe('critérios da pesquisa', () => {
  it('lê a URL com nomes em português, sem os espaços das bordas', () => {
    expect(
      criteriaFromParams({
        nome: '  gerdau  ',
        uf: 'mg',
        municipio: 'Belo Horizonte',
        cnae: '24.51-2/00',
        ods: '13',
        indice_min: '-10,5',
        confianca_min: '0.3',
        ordem: 'DESC',
        pagina: '3',
        por_pagina: '50',
      }),
    ).toEqual({
      name: 'gerdau',
      uf: 'MG',
      city: 'Belo Horizonte',
      cnae: '2451200',
      ods: 13,
      minScore: -10.5,
      minConfidence: 0.3,
      order: 'desc',
      page: 3,
      pageSize: 50,
    });
  });

  it('URL vazia: nenhum critério, página 1 com 20 itens', () => {
    const criteria = criteriaFromParams({});

    expect(criteria).toEqual(EMPTY);
    expect(hasCriterion(criteria)).toBe(false);
  });

  it('sem ODS, mínimos e ordenação são ignorados (só existem com o ODS)', () => {
    expect(
      criteriaFromParams({ uf: 'SP', indice_min: '10', confianca_min: '0.5', ordem: 'asc' }),
    ).toEqual({ ...EMPTY, uf: 'SP' });
  });

  it.each([
    [{ pagina: '0' }, 1, DEFAULT_PAGE_SIZE],
    [{ pagina: '-2' }, 1, DEFAULT_PAGE_SIZE],
    [{ pagina: '1.5' }, 1, DEFAULT_PAGE_SIZE],
    [{ pagina: 'abc' }, 1, DEFAULT_PAGE_SIZE],
    [{ por_pagina: '101' }, 1, DEFAULT_PAGE_SIZE],
    [{ por_pagina: '0' }, 1, DEFAULT_PAGE_SIZE],
    [{ por_pagina: '100' }, 1, 100],
    [{ por_pagina: '1' }, 1, 1],
  ])('paginação ilegível ou fora do limite volta ao padrão: %j', (params, page, pageSize) => {
    const criteria = criteriaFromParams(params);

    expect([criteria.page, criteria.pageSize]).toEqual([page, pageSize]);
  });

  it('ordem desconhecida e números ilegíveis viram "não informado"', () => {
    expect(criteriaFromParams({ ods: '15', ordem: 'maior', indice_min: 'x' })).toEqual({
      ...EMPTY,
      ods: 15,
    });
    expect(criteriaFromParams({ ods: 'treze' }).ods).toBeNull();
    expect(criteriaFromParams({ ods: '13.5', indice_min: '1' })).toEqual(EMPTY);
  });

  it('ODS fora dos calculados segue para a API, que responde com os disponíveis', () => {
    expect(criteriaFromParams({ ods: '7' }).ods).toBe(7);
  });

  it.each([['name'], ['uf'], ['city'], ['cnae']] as const)('um critério basta: %s', (field) => {
    expect(hasCriterion({ ...EMPTY, [field]: 'x' })).toBe(true);
  });

  it('o ODS sozinho também é critério', () => {
    expect(hasCriterion({ ...EMPTY, ods: 13 })).toBe(true);
  });

  it('volta à URL só com o que foi informado, sem página e tamanho padrão', () => {
    expect(criteriaToParams({ ...EMPTY, uf: 'MG', cnae: '24' })).toEqual({ uf: 'MG', cnae: '24' });
    expect(
      criteriaToParams({
        ...EMPTY,
        ods: 13,
        minScore: 0,
        minConfidence: 0.3,
        order: 'asc',
        page: 2,
        pageSize: 50,
      }),
    ).toEqual({
      ods: '13',
      indice_min: '0',
      confianca_min: '0.3',
      ordem: 'asc',
      pagina: '2',
      por_pagina: '50',
    });
  });

  it('URL e critérios vão e voltam sem perda', () => {
    const criteria: SearchCriteria = {
      ...EMPTY,
      name: 'aco',
      city: 'São Paulo',
      ods: 15,
      minScore: -100,
      page: 4,
    };

    expect(criteriaFromParams(criteriaToParams(criteria))).toEqual(criteria);
  });

  it('a consulta da API leva os nomes dela e só o que foi informado', () => {
    expect(toApiQuery({ ...EMPTY, uf: 'MG' })).toEqual({ page: 1, page_size: 20, uf: 'MG' });
    expect(
      toApiQuery({
        ...EMPTY,
        name: 'gerdau',
        city: 'Ouro Branco',
        cnae: '24',
        ods: 13,
        minScore: 0,
        minConfidence: 0.3,
        order: 'desc',
        page: 2,
        pageSize: 5,
      }),
    ).toEqual({
      page: 2,
      page_size: 5,
      name: 'gerdau',
      city: 'Ouro Branco',
      cnae: '24',
      ods: 13,
      min_score: 0,
      min_confidence: 0.3,
      order: 'desc',
    });
  });

  it('sem ODS, a consulta nunca leva mínimos nem ordenação', () => {
    expect(
      toApiQuery({ ...EMPTY, cnae: '24', minScore: 10, minConfidence: 0.5, order: 'asc' }),
    ).toEqual({ page: 1, page_size: 20, cnae: '24' });
  });
});
