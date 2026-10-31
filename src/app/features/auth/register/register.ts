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
import {
  emailRules,
  fieldMessage,
  nameRules,
  passwordRules,
} from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';
import { MailPreview } from '../../../shared/presentation/mail-preview';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/** O que a tela mostra depois do envio: a resposta da API, igual para e-mail novo e já cadastrado. */
interface Sent {
  message: string;
  email: string;
}

/**
 * Cadastro de conta (UC01, RF01; #19). As regras são as da API, checadas antes do envio. A tela
 * depois do envio é a mesma para e-mail novo e já cadastrado (RF01 b): só a mensagem da API, sem
 * nada que dependa da conta existir.
 */
@Component({
  selector: 'bios-register',
  imports: [
    FormErrorSummary,
    MailPreview,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PasswordField,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly api = inject(BiosApi);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [nameRules] }),
    email: new FormControl('', { nonNullable: true, validators: [emailRules] }),
    password: new FormControl('', { nonNullable: true, validators: [passwordRules] }),
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
      this.focusFirstInvalid();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.formErrors.set([]);

    try {
      const response = await this.api.registerAccount({
        body: { name: name.trim(), email: email.trim(), password },
      });

      this.sent.set({ message: response.message, email: email.trim() });
      afterNextRender(() => this.sentHeading()?.nativeElement.focus(), {
        injector: this.injector,
      });
    } catch (error) {
      this.formErrors.set(applyApiErrors(this.form, describeError(error)));
      this.focusFirstInvalid();
    } finally {
      this.submitting.set(false);
    }
  }

  /** Leva o foco ao primeiro campo com erro, depois que a tela marcar os erros. */
  private focusFirstInvalid(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
