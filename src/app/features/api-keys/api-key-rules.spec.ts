import { FormControl } from '@angular/forms';
import { RULES_ERROR_KEY } from '../../shared/forms/account-rules';
import { apiKeyNameRules } from './api-key-rules';

function messages(value: unknown): string[] {
  return (apiKeyNameRules(new FormControl(value))?.[RULES_ERROR_KEY] as string[] | undefined) ?? [];
}

describe('apiKeyNameRules (iguais às da API)', () => {
  it.each([
    ['', ['O nome deve ter ao menos 2 caracteres.']],
    ['  a  ', ['O nome deve ter ao menos 2 caracteres.']],
    [null, ['O nome deve ter ao menos 2 caracteres.']],
    ['CR', []],
    ['  Integração com o CRM  ', []],
    ['x'.repeat(60), []],
    [`  ${'x'.repeat(60)}  `, []],
    ['x'.repeat(61), ['O nome deve ter no máximo 60 caracteres.']],
  ])('nome %j', (value, expected) => {
    expect(messages(value)).toEqual(expected);
  });
});
