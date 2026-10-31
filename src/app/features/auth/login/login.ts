import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { Router, RouterLink } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { safeReturnUrl } from '../../../core/session/return-url';
import { SessionService } from '../../../core/session/session.service';
import { countdownFrom } from '../../../shared/errors/countdown';
import { describeError, formatWait } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import {
  currentPasswordRules,
  emailRules,
  fieldMessage,
} from '../../../shared/forms/account-rules';
import { PasswordField } from '../../../shared/forms/password-field';
import { MailPreview } from '../../../shared/presentation/mail-preview';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';

/** O reenvio do link pedido daqui (fluxo 3.4). */
interface Resent {
  message: string;
  email: string;
  requestedAt: string;
}

/**
 * Login (UC02, RF02, RF20; #20). Entrar abre uma sessão própria deste dispositivo (regra 4) e leva
 * ao destino guardado em `?voltar=` ou ao painel. As mensagens são as da API, sem pista de qual
 * campo errou (regra 3); conta não confirmada oferece o reenvio do link (fluxo 3.4); bloqueio
 * mostra o tempo restante e trava o botão até lá (fluxo 2.1, regra 6).
 */
@Component({
  selector: 'bios-login',
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
  templateUrl: './login.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly api = inject(BiosApi);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Para onde voltar depois de entrar (`?voltar=`, guardado pelo guard de rotas). */
  readonly voltar = input<string>();
  /** `encerrada` quando a sessão terminou e a renovação não deu certo (#15). */
  readonly sessao = input<string>();

  protected readonly sessionEnded = computed(() => this.sessao() === 'encerrada');

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [emailRules] }),
    password: new FormControl('', { nonNullable: true, validators: [currentPasswordRules] }),
  });

  protected readonly submitting = signal(false);
  protected readonly formErrors = signal<string[]>([]);
  /** O e-mail da conta que ainda não foi confirmada, para o reenvio. */
  protected readonly unconfirmedEmail = signal<string | null>(null);
  protected readonly resending = signal(false);
  protected readonly resent = signal<Resent | null>(null);

  /** Segundos de bloqueio que a API informou; cada resposta recomeça a contagem, mesmo igual. */
  private readonly blockedFor = signal<number | null>(null, { equal: () => false });
  protected readonly remaining = countdownFrom(this.blockedFor);
  protected readonly wait = computed(() => formatWait(this.remaining()));

  protected readonly messageOf = fieldMessage;

  protected async submit(): Promise<void> {
    if (this.submitting() || this.remaining() > 0) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.formErrors.set([]);
    this.unconfirmedEmail.set(null);
    this.resent.set(null);

    try {
      await this.session.signIn(email.trim(), password);
      await this.router.navigateByUrl(safeReturnUrl(this.voltar()));
    } catch (error) {
      const view = describeError(error);

      this.formErrors.set(applyApiErrors(this.form, view));
      if (view.code === 'ACCOUNT_NOT_CONFIRMED') this.unconfirmedEmail.set(email.trim());
      if (view.retryAfterSeconds) this.blockedFor.set(view.retryAfterSeconds);
      this.focusFirstInvalid();
    } finally {
      this.submitting.set(false);
    }
  }

  /** Reenvia o link de confirmação para a conta que tentou entrar (UC01, fluxo 6.1). */
  protected async resend(): Promise<void> {
    const email = this.unconfirmedEmail();

    if (!email || this.resending()) return;

    const requestedAt = new Date().toISOString();
    this.resending.set(true);

    try {
      const response = await this.api.resendEmailConfirmation({ body: { email } });

      this.resent.set({ message: response.message, email, requestedAt });
    } catch (error) {
      this.formErrors.set([describeError(error).message]);
    } finally {
      this.resending.set(false);
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
