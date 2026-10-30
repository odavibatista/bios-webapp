import type { AbstractControl } from '@angular/forms';
import type { ErrorView } from './describe-error';

/** Chave do erro que a API apontou num controle (`control.errors.api`). */
export const API_ERROR_KEY = 'api';

/**
 * Leva os erros da API para o formulário (#16): cada `details[].path` de um 422 marca o controle de
 * mesmo caminho (`name`, `address.postal_code`...), com as mensagens da API. Devolve o que deve
 * aparecer no topo do formulário: as mensagens sem campo correspondente ou, se a falha não for de
 * validação, a mensagem dela.
 *
 * O erro some do controle quando o valor muda: os validadores do Angular recalculam os erros.
 */
export function applyApiErrors(form: AbstractControl, error: ErrorView): string[] {
  if (error.kind !== 'validation') return [error.message];

  const byControl = new Map<AbstractControl, string[]>();
  const formLevel: string[] = [];

  for (const { path, message } of error.fieldErrors) {
    const control = path ? form.get(path) : null;

    if (control) byControl.set(control, [...(byControl.get(control) ?? []), message]);
    else formLevel.push(message);
  }

  for (const [control, messages] of byControl) {
    control.setErrors({ ...(control.errors ?? {}), [API_ERROR_KEY]: messages.join(' ') });
    control.markAsTouched();
  }

  return formLevel.length || byControl.size ? formLevel : [error.message];
}

/** A mensagem que a API deu para este controle, se houver (para o `mat-error`). */
export function apiErrorOf(control: AbstractControl | null): string | null {
  const message: unknown = control?.errors?.[API_ERROR_KEY];

  return typeof message === 'string' ? message : null;
}
