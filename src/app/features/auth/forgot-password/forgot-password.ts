import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import { emailRules, fieldMessage } from '../../../shared/forms/account-rules';
import { MailPreview } from '../../../shared/presentation/mail-preview';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

interface Sent {
  message: string;
  email: string;
  /** Quando o pedido saiu (ISO 8601), para o aviso da apresentação. */
  requestedAt: string;
}

/**
 * Pedido do link de redefinição de senha (UC04, fluxos 1.1–1.2; RF25; #22). A resposta é a mesma
 * exista ou não a conta (RF25 b, regra 2), e a tela também: só a mensagem da API.
 */
@Component({
  selector: 'bios-forgot-password',
  imports: [
    FormErrorSummary,
    MailPreview,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly api = inject(BiosApi);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [emailRules] }),
  });

  protected readonly submitting = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  protected readonly sent = signal<Sent | null>(null);

  private readonly sentHeading = viewChild<ElementRef<HTMLElement>>('sentHeading');

  protected readonly messageOf = fieldMessage;

  protected async submit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusEmail();
      return;
    }

    const email = this.form.getRawValue().email.trim();
    const requestedAt = new Date().toISOString();
    this.submitting.set(true);
    this.formErrors.set([]);

    try {
      const response = await this.api.forgotPassword({ body: { email } });

      this.sent.set({ message: response.message, email, requestedAt });
      afterNextRender(() => this.sentHeading()?.nativeElement.focus(), {
        injector: this.injector,
      });
    } catch (error) {
      this.formErrors.set(applyApiErrors(this.form, describeError(error)));
      this.focusEmail();
    } finally {
      this.submitting.set(false);
    }
  }

  private focusEmail(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
