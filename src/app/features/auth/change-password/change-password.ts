import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { LOGIN_PATH } from '../../../core/session/session.service';
import { SessionStore } from '../../../core/session/session-store';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors, setApiError } from '../../../shared/errors/form-errors';
import { oldPasswordRules, passwordRules } from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/**
 * Troca de senha de quem está logado (UC04, fluxo normal; RF24; #22). A senha atual errada
 * (fluxo 3.1) marca o campo dela; a nova igual à atual (regra 3) marca o da nova. Deu certo: a API
 * encerra todas as sessões, inclusive esta (regra 5), e o app apaga a local e vai ao login.
 */
@Component({
  selector: 'bios-change-password',
  imports: [FormErrorSummary, MatButtonModule, PasswordField, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  private readonly api = inject(BiosApi);
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = new FormGroup({
    current_password: new FormControl('', {
      nonNullable: true,
      validators: [oldPasswordRules],
    }),
    new_password: new FormControl('', { nonNullable: true, validators: [passwordRules] }),
  });

  protected readonly submitting = signal(false);
  protected readonly formErrors = signal<string[]>([]);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.submitting.set(true);
    this.formErrors.set([]);

    try {
      await this.api.changePassword({ body: this.form.getRawValue() });

      this.store.clear();
      await this.router.navigate([LOGIN_PATH], { queryParams: { senha: 'alterada' } });
    } catch (error) {
      const view = describeError(error);
      const { current_password, new_password } = this.form.controls;

      if (view.code === 'INVALID_CURRENT_PASSWORD') setApiError(current_password, view.message);
      else if (view.code === 'PASSWORD_UNCHANGED') setApiError(new_password, view.message);
      else this.formErrors.set(applyApiErrors(this.form, view));
      this.focusFirstInvalid();
    } finally {
      this.submitting.set(false);
    }
  }

  private focusFirstInvalid(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
