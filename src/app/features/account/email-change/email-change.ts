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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors, setApiError } from '../../../shared/errors/form-errors';
import { emailRules, fieldMessage, oldPasswordRules } from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';
import { MailPreview } from '../../../shared/presentation/mail-preview';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/** Erros da API que pertencem a um campo, sem vir em `details`. */
const FIELD_OF_ERROR: Record<string, 'new_email' | 'current_password'> = {
  INVALID_CURRENT_PASSWORD: 'current_password',
  EMAIL_UNCHANGED: 'new_email',
  EMAIL_DOMAIN_NOT_ALLOWED: 'new_email',
};

/** O pedido aceito: a resposta da API, a mesma para e-mail livre e de outra conta. */
interface Requested {
  message: string;
  newEmail: string;
  requestedAt: string;
}

/**
 * Troca do e-mail da conta (UC05, fluxo 1.1, regras 4 e 5; RF28; #29). Pede o novo e-mail e a
 * senha atual; a troca só vale quando o link enviado ao novo endereço é aberto, e até lá o e-mail
 * atual continua valendo. A tela depois do pedido é a mesma para um e-mail livre e para um de
 * outra conta (regra 5): só a mensagem da API e o e-mail atual, sem nada do endereço informado.
 */
@Component({
  selector: 'bios-email-change',
  imports: [
    FormErrorSummary,
    MailPreview,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PasswordField,
    ReactiveFormsModule,
  ],
  templateUrl: './email-change.html',
  styleUrl: './email-change.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailChange {
  private readonly api = inject(BiosApi);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O e-mail que vale agora: continua o mesmo até a confirmação. */
  readonly currentEmail = input.required<string>();

  protected readonly messageOf = fieldMessage;

  protected readonly form = new FormGroup({
    new_email: new FormControl('', { nonNullable: true, validators: [emailRules] }),
    current_password: new FormControl('', { nonNullable: true, validators: [oldPasswordRules] }),
  });

  protected readonly requesting = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  protected readonly requested = signal<Requested | null>(null);

  protected async request(): Promise<void> {
    if (this.requesting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const { new_email, current_password } = this.form.getRawValue();
    const newEmail = new_email.trim();
    const requestedAt = new Date().toISOString();
    this.requesting.set(true);
    this.formErrors.set([]);

    try {
      const response = await this.api.requestEmailChange({
        body: { new_email: newEmail, current_password },
      });

      this.form.reset();
      this.requested.set({ message: response.message, newEmail, requestedAt });
    } catch (error) {
      const view = describeError(error);
      const field = view.code ? FIELD_OF_ERROR[view.code] : undefined;

      if (field) setApiError(this.form.controls[field], view.message);
      else this.formErrors.set(applyApiErrors(this.form, view));
      this.focusFirstInvalid();
    } finally {
      this.requesting.set(false);
    }
  }

  /** Volta ao formulário, para pedir a troca para outro endereço. */
  protected startOver(): void {
    this.requested.set(null);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('input')?.focus(), {
      injector: this.injector,
    });
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
