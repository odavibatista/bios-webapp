import { FormControl, type ValidatorFn } from '@angular/forms';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';
import {
  cityRule,
  cnaeRule,
  minConfidenceRule,
  minScoreRule,
  nameRule,
  nameTerms,
  ufRule,
} from './search-rules';

function messages(validator: ValidatorFn, value: string | number | null): string[] {
  return (validator(new FormControl(value))?.[RULES_ERROR_KEY] as string[] | undefined) ?? [];
}

describe('regras da pesquisa (iguais às da API)', () => {
  it('compara as palavras sem acento, caixa nem pontuação', () => {
    expect(nameTerms('Aço S.A. – Ouro-Branco')).toEqual(['ACO', 'S', 'A', 'OURO', 'BRANCO']);
  });

  it.each([
    ['', []],
    ['gerdau', []],
    ['aço', []],
    ['a b c', ['Informe ao menos uma palavra com 3 letras ou mais.']],
    ['ab', ['Informe ao menos uma palavra com 3 letras ou mais.']],
    ['S.A.', ['Informe ao menos uma palavra com 3 letras ou mais.']],
    ['123', []],
    ['x'.repeat(101), ['O nome deve ter no máximo 100 caracteres.']],
  ])('nome %j', (value, expected) => {
    expect(messages(nameRule, value)).toEqual(expected);
  });

  it.each([
    ['', []],
    ['São Paulo', []],
    ['--', ['Informe o nome do município.']],
  ])('município %j', (value, expected) => {
    expect(messages(cityRule, value)).toEqual(expected);
  });

  it.each([
    ['', []],
    ['SP', []],
    ['mg', []],
    ['XX', ['Escolha uma das 27 unidades da federação.']],
  ])('UF %j', (value, expected) => {
    expect(messages(ufRule, value)).toEqual(expected);
  });

  it.each([
    ['', []],
    ['24', []],
    ['24.51-2/00', []],
    ['2451200', []],
    ['2', ['Informe de 2 a 7 dígitos do CNAE.']],
    ['24512001', ['Informe de 2 a 7 dígitos do CNAE.']],
    ['24a', ['Informe de 2 a 7 dígitos do CNAE.']],
  ])('CNAE %j', (value, expected) => {
    expect(messages(cnaeRule, value)).toEqual(expected);
  });

  it.each([
    ['', []],
    ['-100', []],
    ['100', []],
    ['0', []],
    ['12,5', []],
    ['-100.01', ['Informe um índice de −100 a 100.']],
    ['101', ['Informe um índice de −100 a 100.']],
    ['abc', ['Informe um índice de −100 a 100.']],
  ])('índice mínimo %j', (value, expected) => {
    expect(messages(minScoreRule, value)).toEqual(expected);
  });

  it.each([
    ['', []],
    ['0', []],
    ['1', []],
    ['0,75', []],
    ['1.01', ['Informe uma confiança de 0 a 1.']],
    ['-0.1', ['Informe uma confiança de 0 a 1.']],
  ])('confiança mínima %j', (value, expected) => {
    expect(messages(minConfidenceRule, value)).toEqual(expected);
  });

  it('campo vazio ou nulo é "não informado"', () => {
    expect(messages(nameRule, null)).toEqual([]);
    expect(messages(minScoreRule, null)).toEqual([]);
  });
});
