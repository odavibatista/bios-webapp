import {
  addressLines,
  companySizeLabel,
  formatCnae,
  formatZipcode,
  registrationStatusLabel,
} from './registration-labels';

describe('rótulos do cadastro', () => {
  it.each([
    ['ATIVA', 'Ativa'],
    ['SUSPENSA', 'Suspensa'],
    ['INAPTA', 'Inapta'],
    ['BAIXADA', 'Baixada'],
    ['NULA', 'Nula'],
  ] as const)('situação %s em português', (status, label) => {
    expect(registrationStatusLabel(status, null)).toBe(label);
  });

  it('situação não reconhecida mostra o texto do provedor', () => {
    expect(registrationStatusLabel('NAO_RECONHECIDA', 'EM LIQUIDACAO')).toBe(
      'Não reconhecida (informada como "EM LIQUIDACAO")',
    );
    expect(registrationStatusLabel('NAO_RECONHECIDA', null)).toBe('Não reconhecida');
  });

  it.each([
    ['MICRO EMPRESA', 'Microempresa (ME)'],
    ['EMPRESA DE PEQUENO PORTE', 'Empresa de pequeno porte (EPP)'],
    ['DEMAIS', 'Demais (nem microempresa nem de pequeno porte)'],
    ['PORTE NOVO', 'PORTE NOVO'],
    [null, 'Não informado'],
  ])('porte %j', (size, label) => {
    expect(companySizeLabel(size)).toBe(label);
  });

  it('CNAE e CEP com a máscara; outro formato volta como veio', () => {
    expect(formatCnae('2431800')).toBe('2431-8/00');
    expect(formatCnae('0210101')).toBe('0210-1/01');
    expect(formatCnae('24')).toBe('24');
    expect(formatZipcode('60761200')).toBe('60761-200');
    expect(formatZipcode('6076')).toBe('6076');
  });

  it('endereço em linhas, sem as partes ausentes', () => {
    expect(
      addressLines({
        street: 'AVENIDA DOUTOR SILAS MUNGUBA',
        number: '1855',
        complement: null,
        neighborhood: 'PARANGABA',
        city: 'FORTALEZA',
        city_ibge_code: '2304400',
        uf: 'CE',
        zipcode: '60761200',
      }),
    ).toEqual(['AVENIDA DOUTOR SILAS MUNGUBA, 1855', 'PARANGABA', 'FORTALEZA/CE', 'CEP 60761-200']);
    expect(
      addressLines({
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: 'FORTALEZA',
        city_ibge_code: null,
        uf: 'CE',
        zipcode: null,
      }),
    ).toEqual(['FORTALEZA/CE']);
  });
});
