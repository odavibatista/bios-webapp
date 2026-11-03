import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { OwnAccount } from '../../../core/account/own-account';
import { BiosApi } from '../../../core/api/bios-api';
import { SessionStore } from '../../../core/session/session-store';
import { describeError } from '../../../shared/errors/describe-error';
import { ErrorState } from '../../../shared/states/error-state';
import { LoadingState } from '../../../shared/states/loading-state';

/** Por que a troca não aconteceu, quando o problema não é passageiro. */
interface Refusal {
  message: string;
  /** O endereço passou a ser de outra conta antes da confirmação (UC05, regra 5). */
  emailTaken: boolean;
}

/**
 * Confirmação do novo e-mail (UC05, fluxo 1.1; RF28; #29). A rota é a do link que a API manda ao
 * novo endereço (`FRONTEND_URL/confirmar-novo-email/<token>`, template
 * `EMAIL_CHANGE_CONFIRMATION`): abrir a página já efetiva a troca, com ou sem sessão. Com sessão,
 * a conta é recarregada, e o e-mail novo aparece na conta e no menu.
 */
@Component({
  selector: 'bios-confirm-email-change',
  imports: [ErrorState, LoadingState, MatButtonModule, RouterLink],
  templateUrl: './confirm-email-change.html',
  styleUrl: '../../auth/auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmailChange {
  private readonly api = inject(BiosApi);
  private readonly own = inject(OwnAccount);

  /** O token do link (`/confirmar-novo-email/:token`). */
  readonly token = input.required<string>();

  protected readonly signedIn = inject(SessionStore).isAuthenticated;

  protected readonly confirmation = resource({
    params: () => this.token(),
    loader: ({ params: token }) => this.api.confirmEmailChange({ body: { token } }),
  });

  /**
   * Link expirado, usado ou malformado, ou endereço que passou a ser de outra conta: repetir não
   * adianta, e a saída é pedir a troca de novo. `null` para as falhas passageiras.
   */
  protected readonly refusal = computed<Refusal | null>(() => {
    if (this.confirmation.status() !== 'error') return null;

    const view = describeError(this.confirmation.error());

    if (view.code === 'EMAIL_ALREADY_IN_USE') return { message: view.message, emailTaken: true };
    if (view.code === 'USER_TOKEN_INVALID') return { message: view.message, emailTaken: false };
    if (view.kind === 'validation') {
      return { message: view.fieldErrors[0]?.message ?? view.message, emailTaken: false };
    }

    return null;
  });

  constructor() {
    // Troca feita com sessão aberta: a conta guardada ainda tem o e-mail antigo.
    effect(() => {
      if (this.confirmation.hasValue() && this.signedIn()) {
        untracked(() => this.own.account.reload());
      }
    });
  }
}
