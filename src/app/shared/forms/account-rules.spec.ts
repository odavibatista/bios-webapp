import { FormControl } from '@angular/forms';
import { API_ERROR_KEY } from '../errors/form-errors';
import {
  emailRules,
  fieldMessage,
  nameRules,
  PASSWORD_POLICY,
  passwordRules,
  RULES_ERROR_KEY,
} from './account-rules';

function messages(validator: typeof nameRules, value: string): string[] {
  const errors = validator(new FormControl(value));

  return (errors?.[RULES_ERROR_KEY] as string[] | undefined) ?? [];
}

describe('regras da conta (iguais às da API)', () => {
  it.each([
    ['', ['O nome deve ter ao menos 2 caracteres.']],
    ['  A  ', ['O nome deve ter ao menos 2 caracteres.']],
    ['Ab', []],
    ['a'.repeat(100), []],
    ['a'.repeat(101), ['O nome deve ter no máximo 100 caracteres.']],
  ])('nome %j', (value, expected) => {
    expect(messages(nameRules, value)).toEqual(expected);
  });

  it.each([
    ['pessoa@example.com', []],
    ['  pessoa@example.com  ', []],
    ['nome.sobrenome+tag@sub.example.com.br', []],
    ['', ['Informe um e-mail válido.']],
    ['nao-e-email', ['Informe um e-mail válido.']],
    ['pessoa@localhost', ['Informe um e-mail válido.']],
    ['.pessoa@example.com', ['Informe um e-mail válido.']],
    ['pessoa..dupla@example.com', ['Informe um e-mail válido.']],
    ['pessoa.@example.com', ['Informe um e-mail válido.']],
    ['pessoa@example.c', ['Informe um e-mail válido.']],
    [`${'a'.repeat(250)}@example.com`, ['O e-mail deve ter no máximo 254 caracteres.']],
  ])('e-mail %j', (value, expected) => {
    expect(messages(emailRules, value)).toEqual(expected);
  });

  it.each([
    ['senha123', []],
    ['çãoéíõ12', []],
    [
      '',
      [
        'A senha deve ter ao menos 8 caracteres.',
        'A senha deve conter ao menos uma letra.',
        'A senha deve conter ao menos um número.',
      ],
    ],
    ['curta1', ['A senha deve ter ao menos 8 caracteres.']],
    ['12345678', ['A senha deve conter ao menos uma letra.']],
    ['semnumero', ['A senha deve conter ao menos um número.']],
    [`a1${'x'.repeat(126)}`, []],
    [`a1${'x'.repeat(127)}`, ['A senha deve ter no máximo 128 caracteres.']],
  ])('senha %j', (value, expected) => {
    expect(messages(passwordRules, value)).toEqual(expected);
  });

  it('a política de senha descreve as mesmas regras', () => {
    expect(PASSWORD_POLICY).toBe('De 8 a 128 caracteres, com ao menos uma letra e um número.');
  });

  it('o campo mostra as regras quebradas e, sem elas, o que a API disse', () => {
    const control = new FormControl('curta1', { validators: [passwordRules] });

    expect(fieldMessage(control)).toBe('A senha deve ter ao menos 8 caracteres.');

    control.setValue('senha123');
    control.setErrors({ [API_ERROR_KEY]: 'Mensagem da API.' });
    expect(fieldMessage(control)).toBe('Mensagem da API.');

    control.setErrors(null);
    expect(fieldMessage(control)).toBeNull();
    expect(fieldMessage(null)).toBeNull();
  });
});
