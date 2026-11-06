import { LocationCatalog, toSearchName } from './location-catalog';
import { LOCATION_FIXTURE } from './location-fixture';

describe('LocationCatalog', () => {
  const catalog = new LocationCatalog(LOCATION_FIXTURE);
  const names = (uf: string, text?: string) => catalog.search(uf, text).map(({ name }) => name);

  it('normaliza como a API', () => {
    expect(toSearchName("Sant'Ana do Livramento")).toBe('SANT ANA DO LIVRAMENTO');
    expect(toSearchName('  São   Paulo ')).toBe('SAO PAULO');
  });

  it('lista as 27 UFs por nome', () => {
    expect(catalog.states).toHaveLength(27);
    expect(catalog.states[0]).toEqual({ ibge_code: '12', acronym: 'AC', name: 'Acre' });
  });

  it('sem trecho, devolve os municípios da UF em ordem alfabética', () => {
    expect(names('RJ')).toEqual(['Niterói', 'Paraty', 'Rio de Janeiro']);
  });

  it('não distingue acento nem caixa', () => {
    expect(names('RJ', 'NITERÓI')).toEqual(['Niterói']);
    expect(names('RJ', 'niteroi')).toEqual(['Niterói']);
  });

  it('só devolve municípios da UF', () => {
    expect(names('PI', 'rio')).toEqual([]);
    expect(names('XX')).toEqual([]);
  });

  it('quem começa pelo trecho vem antes de quem só o contém', () => {
    expect(names('SP', 'sa')).toEqual(['Santos', 'São Paulo']);
    expect(names('SP', 'in')).toEqual(['Campinas']);
  });

  it('acha pela grafia de outra fonte', () => {
    expect(names('RJ', 'parati')).toEqual(['Paraty']);
  });

  it('confere o município na UF', () => {
    expect(catalog.find('3303807', 'RJ')?.aliases).toEqual(['PARATI']);
    expect(catalog.find('3303807', 'SP')).toBeNull();
  });
});
