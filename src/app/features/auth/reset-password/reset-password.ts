import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { LOGIN_PATH } from '../../../core/session/session.service';
import { SessionStore } from '../../../core/session/session-store';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import { passwordRules } from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/**
 * Redefinição de senha pelo link do e-mail (UC04, fluxo 1.3; RF25 c–d; #22). A rota é a do link
 * que a API manda (`FRONTEND_URL/redefinir-senha/<token>`, template `PASSWORD_RESET`).
 *
 * - Senha nova fora da política mostra o erro e não gasta o link (regra 6): o formulário segue.
 * - Link expirado, usado ou malformado oferece pedir outro.
 * - Deu certo: todas as sessões caíram (regra 5), inclusive uma aberta aqui, e o app vai ao login.
 */
@Component({
  selector: 'bios-reset-password',
  imports: [FormErrorSummary, MatButtonModule, PasswordField, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly api = inject(BiosApi);
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O token do link (`/redefinir-senha/:token`). */
  readonly token = input.required<string>();

  protected readonly form = new FormGroup({
    new_password: new FormControl('', { nonNullable: true, validators: [passwordRules] }),
  });

  protected readonly submitting = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** A mensagem quando o problema é o próprio link: aí, a saída é pedir outro. */
  protected readonly invalidLink = signal<string | null>(null);

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
      await this.api.resetPassword({
        body: { token: this.token(), new_password: this.form.getRawValue().new_password },
      });

      this.store.clear();
      await this.router.navigate([LOGIN_PATH], { queryParams: { senha: 'redefinida' } });
    } catch (error) {
      const view = describeError(error);
      const tokenError = view.fieldErrors.find((field) => field.path === 'token');

      if (view.code === 'USER_TOKEN_INVALID' || tokenError) {
        this.invalidLink.set(tokenError?.message ?? view.message);
      } else {
        this.formErrors.set(applyApiErrors(this.form, view));
        this.focusFirstInvalid();
      }
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
