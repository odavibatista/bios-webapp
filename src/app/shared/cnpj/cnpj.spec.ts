import { FormControl } from '@angular/forms';
import {
  CNPJ_ERROR_KEY,
  cnpjRule,
  formatCnpj,
  INVALID_CNPJ_MESSAGE,
  normalizeCnpj,
  parseCnpj,
} from './cnpj';

describe('CNPJ (o mesmo algoritmo da API)', () => {
  it.each([
    ['33592510000154', '33592510000154'],
    ['33.592.510/0001-54', '33592510000154'],
    ['  33.592.510/0001-54  ', '33592510000154'],
    ['00990842000138', '00990842000138'],
    // Alfanumérico (Receita, a partir de julho de 2026), com e sem máscara, em minúsculas.
    ['12ABC34501DE35', '12ABC34501DE35'],
    ['12.abc.345/01de-35', '12ABC34501DE35'],
  ])('%j é válido e vira %j', (text, canonical) => {
    expect(parseCnpj(text)).toBe(canonical);
  });

  it.each([
    [''],
    ['3359251000015'],
    ['335925100001544'],
    // Dígitos verificadores trocados.
    ['33592510000145'],
    ['33592510000155'],
    ['12ABC34501DE36'],
    // Letra nos verificadores, que são sempre algarismos.
    ['12ABC34501DE3A'],
    // Sequência de um caractere só passa no cálculo, mas não é CNPJ.
    ['00000000000000'],
    ['11111111111111'],
    ['33592510000154x'],
    ['33_592_510_0001_54'],
  ])('%j é inválido', (text) => {
    expect(parseCnpj(text)).toBeNull();
  });

  it('normaliza sem validar: sem pontuação e em maiúsculas', () => {
    expect(normalizeCnpj(' 12.abc.345/01de-35 ')).toBe('12ABC34501DE35');
  });

  it('formata o CNPJ canônico com a máscara de exibição', () => {
    expect(formatCnpj('33592510000154')).toBe('33.592.510/0001-54');
    expect(formatCnpj('12ABC34501DE35')).toBe('12.ABC.345/01DE-35');
    expect(formatCnpj('curto')).toBe('curto');
  });

  it('o validador do campo usa a mensagem da API', () => {
    expect(cnpjRule(new FormControl('33.592.510/0001-54'))).toBeNull();
    expect(cnpjRule(new FormControl('33.592.510/0001-55'))).toEqual({
      [CNPJ_ERROR_KEY]: INVALID_CNPJ_MESSAGE,
    });
    expect(cnpjRule(new FormControl(''))).toEqual({ [CNPJ_ERROR_KEY]: INVALID_CNPJ_MESSAGE });
    expect(cnpjRule(new FormControl(null))).toEqual({ [CNPJ_ERROR_KEY]: INVALID_CNPJ_MESSAGE });
  });
});
