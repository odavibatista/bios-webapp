import { FormControl } from '@angular/forms';
import { RULES_ERROR_KEY } from './account-rules';
import {
  addressFieldRules,
  type AddressField,
  BRAZILIAN_STATES,
  formatPostalCode,
  isBlankAddress,
  postalCodeDigits,
} from './address-rules';

function messages(field: AddressField, value: string, required = true): string[] {
  const errors = addressFieldRules(field, () => required)(new FormControl(value));

  return (errors?.[RULES_ERROR_KEY] as string[] | undefined) ?? [];
}

describe('regras do endereço (iguais às da API)', () => {
  it.each([
    ['01310-200', []],
    ['01310200', []],
    ['0131-0200', ['Informe um CEP válido (8 dígitos).']],
    ['123', ['Informe um CEP válido (8 dígitos).']],
    ['', ['Informe um CEP válido (8 dígitos).']],
  ])('CEP %j', (value, expected) => {
    expect(messages('postal_code', value)).toEqual(expected);
  });

  it.each([
    ['street', ' A ', ['Informe o logradouro.']],
    ['street', 'x'.repeat(151), ['O logradouro deve ter no máximo 150 caracteres.']],
    ['street', 'Avenida Paulista', []],
    ['number', '  ', ['Informe o número.']],
    ['number', 's/n', []],
    ['number', '1'.repeat(21), ['O número deve ter no máximo 20 caracteres.']],
    ['neighborhood', 'B', ['Informe o bairro.']],
    ['neighborhood', 'x'.repeat(101), ['O bairro deve ter no máximo 100 caracteres.']],
    ['city', '', ['Informe a cidade.']],
    ['city', 'x'.repeat(101), ['A cidade deve ter no máximo 100 caracteres.']],
    ['state', 'SP', []],
    ['state', 'XX', ['Informe a sigla de uma unidade da federação.']],
    ['state', '', ['Informe a sigla de uma unidade da federação.']],
  ] as const)('%s %j', (field, value, expected) => {
    expect(messages(field, value)).toEqual(expected);
  });

  it('o complemento é opcional, mas tem limite mesmo sem endereço obrigatório', () => {
    expect(messages('complement', '')).toEqual([]);
    expect(messages('complement', 'x'.repeat(61), false)).toEqual([
      'O complemento deve ter no máximo 60 caracteres.',
    ]);
  });

  it('enquanto o endereço não é obrigatório, os campos em branco não são cobrados', () => {
    expect(messages('street', '', false)).toEqual([]);
    expect(messages('state', '', false)).toEqual([]);
  });

  it('as 27 unidades da federação', () => {
    expect(BRAZILIAN_STATES).toHaveLength(27);
    expect(new Set(BRAZILIAN_STATES).size).toBe(27);
  });

  it('endereço em branco: só espaços contam como vazio', () => {
    expect(isBlankAddress({ street: '  ', city: '' })).toBe(true);
    expect(isBlankAddress({ street: '', complement: 'Sala 2' })).toBe(false);
  });

  it.each([
    ['', ''],
    ['0131', '0131'],
    ['01310', '01310'],
    ['013102', '01310-2'],
    ['01310200', '01310-200'],
    ['01.310-200 extra 99', '01310-200'],
  ])('a máscara do CEP formata %j como %j', (value, expected) => {
    expect(formatPostalCode(value)).toBe(expected);
  });

  it('o CEP comparado e guardado é só dígitos', () => {
    expect(postalCodeDigits('01310-200')).toBe('01310200');
  });
});
