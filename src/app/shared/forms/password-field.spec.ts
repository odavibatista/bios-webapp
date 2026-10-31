import { FormControl } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { API_ERROR_KEY } from '../errors/form-errors';
import { passwordRules } from './account-rules';
import { PasswordField } from './password-field';

function newControl(value = '') {
  return new FormControl(value, { nonNullable: true, validators: [passwordRules] });
}

describe('PasswordField', () => {
  it('a senha nova mostra a política antes do primeiro erro, ligada ao campo', async () => {
    await render(PasswordField, { inputs: { control: newControl(), showPolicy: true } });

    const field = screen.getByLabelText('Senha');
    const policy = screen.getByText('De 8 a 128 caracteres, com ao menos uma letra e um número.');

    expect(field.getAttribute('aria-describedby')).toContain(policy.id);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('o login não mostra a política', async () => {
    await render(PasswordField, {
      inputs: { control: newControl(), autocomplete: 'current-password' },
    });

    expect(screen.getByLabelText('Senha').getAttribute('autocomplete')).toBe('current-password');
    expect(screen.queryByText(/De 8 a 128 caracteres/)).toBeNull();
  });

  it('o botão mostra e oculta a senha, dizendo o estado', async () => {
    const user = userEvent.setup();
    await render(PasswordField, { inputs: { control: newControl('senha123') } });

    const field = screen.getByLabelText('Senha');
    expect(field.getAttribute('type')).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(field.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Ocultar senha' }).getAttribute('aria-pressed')).toBe(
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(field.getAttribute('type')).toBe('password');
  });

  it('ao sair do campo com a senha fora da regra, mostra o erro ligado a ele', async () => {
    const user = userEvent.setup();
    await render(PasswordField, { inputs: { control: newControl(), showPolicy: true } });

    const field = screen.getByLabelText('Senha');
    await user.type(field, 'curta1');
    await user.tab();

    const error = await screen.findByText('A senha deve ter ao menos 8 caracteres.');
    expect(field.getAttribute('aria-describedby')).toContain(error.closest('mat-error')?.id);
  });

  it('mostra o erro que a API apontou no campo', async () => {
    const control = newControl('senha123');
    const { fixture } = await render(PasswordField, { inputs: { control } });

    control.setErrors({ [API_ERROR_KEY]: 'Mensagem da API.' });
    control.markAsTouched();
    await fixture.whenStable();

    expect(screen.getByText('Mensagem da API.')).toBeTruthy();
  });
});
