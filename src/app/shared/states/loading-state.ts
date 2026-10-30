import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Indicador de espera (NFIN03 a): o texto fica visível e é anunciado ao leitor de tela
 * (`role="status"`); o círculo é só decoração.
 */
@Component({
  selector: 'bios-loading',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading" role="status">
      <mat-progress-spinner mode="indeterminate" diameter="32" aria-hidden="true" />
      <span>{{ label() }}</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 0;
      color: var(--bios-brand-moss);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingState {
  readonly label = input('Carregando…');
}
