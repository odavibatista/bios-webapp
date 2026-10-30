import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { countdownFrom } from '../errors/countdown';
import { describeError, formatWait } from '../errors/describe-error';

/**
 * Falha de uma operação (NFIN03 b): a mensagem da API e, quando cabe, "Tentar de novo".
 *
 * - **429:** mostra quando será possível repetir e mantém o botão bloqueado até lá.
 * - **503:** indisponibilidade temporária, com o botão (distinta de "não encontrado").
 * - **Falha inesperada:** mensagem genérica em português; a tela continua navegável.
 */
@Component({
  selector: 'bios-error-state',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="error" role="alert">
      <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">{{ icon() }}</mat-icon>
      <div>
        <p>{{ view().message }}</p>
        @if (remaining() > 0) {
          <p class="wait">Você poderá tentar de novo em {{ wait() }}.</p>
        }
        @if (view().canRetry && retryable()) {
          <button
            mat-stroked-button
            type="button"
            [disabled]="remaining() > 0"
            (click)="retry.emit()"
          >
            Tentar de novo
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .error {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--mat-sys-corner-medium);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    p {
      margin: 0 0 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  /** A falha como chegou (um `ApiError` ou qualquer outra). */
  readonly error = input.required<unknown>();

  /** Mostra "Tentar de novo" quando a falha permite (desligue onde a tela já tem a ação). */
  readonly retryable = input(true);

  readonly retry = output();

  protected readonly view = computed(() => describeError(this.error()));
  protected readonly remaining = countdownFrom(computed(() => this.view().retryAfterSeconds));
  protected readonly wait = computed(() => formatWait(this.remaining()));
  protected readonly icon = computed(() =>
    this.view().kind === 'rate-limited' ? 'hourglass_top' : 'error',
  );
}
