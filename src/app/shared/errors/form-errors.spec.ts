import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { ErrorView } from './describe-error';
import { apiErrorOf, applyApiErrors } from './form-errors';

function validation(fieldErrors: ErrorView['fieldErrors']): ErrorView {
  return {
    kind: 'validation',
    message: 'Os dados enviados são inválidos.',
    code: 'VALIDATION_FAILED',
    fieldErrors,
    retryAfterSeconds: null,
    canRetry: false,
  };
}

function form() {
  return new FormGroup({
    name: new FormControl('A', { nonNullable: true }),
    password: new FormControl('curta', {
      nonNullable: true,
      validators: [(control) => Validators.required(control)],
    }),
    address: new FormGroup({ postal_code: new FormControl('123', { nonNullable: true }) }),
  });
}

describe('applyApiErrors', () => {
  it('marca cada campo pelo caminho, inclusive aninhado, juntando as mensagens do mesmo campo', () => {
    const group = form();
    const top = applyApiErrors(
      group,
      validation([
        { path: 'name', message: 'O nome deve ter ao menos 2 caracteres.' },
        { path: 'password', message: 'A senha deve ter ao menos 8 caracteres.' },
        { path: 'password', message: 'A senha deve conter ao menos um número.' },
        { path: 'address.postal_code', message: 'Informe um CEP válido (8 dígitos).' },
      ]),
    );

    expect(top).toEqual([]);
    expect(apiErrorOf(group.get('name'))).toBe('O nome deve ter ao menos 2 caracteres.');
    expect(apiErrorOf(group.get('password'))).toBe(
      'A senha deve ter ao menos 8 caracteres. A senha deve conter ao menos um número.',
    );
    expect(apiErrorOf(group.get('address.postal_code'))).toBe('Informe um CEP válido (8 dígitos).');
    expect(group.get('name')?.touched).toBe(true);
  });

  it('erro sem campo correspondente vai para o topo do formulário', () => {
    const group = form();

    expect(
      applyApiErrors(
        group,
        validation([
          { path: '', message: 'Informe ao menos um critério.' },
          { path: 'campo_que_nao_existe', message: 'Outro erro.' },
        ]),
      ),
    ).toEqual(['Informe ao menos um critério.', 'Outro erro.']);
  });

  it('422 sem detalhes mostra a mensagem geral no topo', () => {
    expect(applyApiErrors(form(), validation([]))).toEqual(['Os dados enviados são inválidos.']);
  });

  it('falha que não é de validação vai inteira para o topo', () => {
    expect(
      applyApiErrors(form(), {
        ...validation([]),
        kind: 'api',
        message: 'A senha atual está incorreta.',
      }),
    ).toEqual(['A senha atual está incorreta.']);
  });

  it('o erro da API some quando o usuário corrige o campo', () => {
    const group = form();

    applyApiErrors(group, validation([{ path: 'name', message: 'Nome curto.' }]));
    group.controls.name.setValue('Nome Completo');

    expect(apiErrorOf(group.get('name'))).toBeNull();
    expect(apiErrorOf(null)).toBeNull();
  });
});
