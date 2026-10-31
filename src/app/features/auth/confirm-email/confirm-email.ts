import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { ErrorState } from '../../../shared/states/error-state';
import { LoadingState } from '../../../shared/states/loading-state';

/**
 * Confirmação de e-mail (UC01, passos 5–6; RF28; #19). A rota é a do link que a API manda
 * (`FRONTEND_URL/confirmar-email/<token>`, template `EMAIL_CONFIRMATION`): abrir a página já
 * confirma. Link expirado ou usado (fluxo 6.1) oferece o reenvio; falha passageira, tentar de novo.
 */
@Component({
  selector: 'bios-confirm-email',
  imports: [ErrorState, LoadingState, MatButtonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmail {
  private readonly api = inject(BiosApi);

  /** O token do link (`/confirmar-email/:token`). */
  readonly token = input.required<string>();

  protected readonly confirmation = resource({
    params: () => this.token(),
    loader: ({ params: token }) => this.api.confirmEmail({ body: { token } }),
  });

  /**
   * A mensagem quando o problema é o próprio link (expirado, usado ou malformado): aí, repetir não
   * adianta, e a saída é pedir outro. `null` para as demais falhas.
   */
  protected readonly invalidLink = computed(() => {
    if (this.confirmation.status() !== 'error') return null;

    const view = describeError(this.confirmation.error());

    if (view.code === 'USER_TOKEN_INVALID') return view.message;
    if (view.kind === 'validation') return view.fieldErrors[0]?.message ?? view.message;

    return null;
  });
}
