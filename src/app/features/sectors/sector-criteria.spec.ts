import { FormControl } from '@angular/forms';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';
import {
  INVALID_SECTOR_CNAE,
  isCompleteSectorCriteria,
  isSectorCnae,
  sectorCnaeDigits,
  sectorCnaeRule,
  sectorCriteriaFromParams,
  sectorCriteriaToParams,
} from './sector-criteria';

describe('critérios da evolução setorial', () => {
  it.each([
    ['24', true],
    ['243', true],
    ['24318', true],
    ['2431800', true],
    ['00', false],
    ['0011', false],
    ['2', false],
    ['2431', false],
    ['243180', false],
    ['24318000', false],
    ['ab', false],
  ])('CNAE %j é de setor? %s (como `cnaeDivisionOf` da API)', (digits, expected) => {
    expect(isSectorCnae(digits)).toBe(expected);
  });

  it('tira espaço, ponto, hífen e barra do CNAE', () => {
    expect(sectorCnaeDigits(' 24.31-8/00 ')).toBe('2431800');
  });

  it('a regra do campo aceita a máscara e recusa o formato errado com a mensagem da API', () => {
    expect(sectorCnaeRule(new FormControl('2431-8/00'))).toBeNull();
    expect(sectorCnaeRule(new FormControl(''))).toEqual({
      [RULES_ERROR_KEY]: [INVALID_SECTOR_CNAE],
    });
    expect(sectorCnaeRule(new FormControl('2431'))).toEqual({
      [RULES_ERROR_KEY]: [INVALID_SECTOR_CNAE],
    });
  });

  it('lê setor e ODS da URL, sem a máscara do CNAE', () => {
    expect(sectorCriteriaFromParams({ cnae: '24.31-8', ods: '13' })).toEqual({
      cnae: '24318',
      ods: 13,
    });
  });

  it('valor ilegível vira "não informado"; CNAE fora do formato segue para a API', () => {
    expect(sectorCriteriaFromParams({ cnae: '  ', ods: 'treze' })).toEqual({
      cnae: null,
      ods: null,
    });
    expect(sectorCriteriaFromParams({ cnae: 'abc', ods: '7' })).toEqual({ cnae: 'abc', ods: 7 });
    expect(sectorCriteriaFromParams({ ods: '13.5' }).ods).toBeNull();
    expect(sectorCriteriaFromParams({})).toEqual({ cnae: null, ods: null });
  });

  it('escreve na URL só o que foi informado', () => {
    expect(sectorCriteriaToParams({ cnae: '24', ods: 13 })).toEqual({ cnae: '24', ods: '13' });
    expect(sectorCriteriaToParams({ cnae: null, ods: 15 })).toEqual({ ods: '15' });
  });

  it('só pede a evolução com setor e ODS', () => {
    expect(isCompleteSectorCriteria({ cnae: '24', ods: 13 })).toBe(true);
    expect(isCompleteSectorCriteria({ cnae: '24', ods: null })).toBe(false);
    expect(isCompleteSectorCriteria({ cnae: null, ods: 13 })).toBe(false);
  });
});
