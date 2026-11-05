import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { BiosApi } from '../../../core/api/bios-api';
import { ChartCard } from '../../../shared/charts/chart-card';
import { ErrorState } from '../../../shared/states/error-state';
import { evolutionCard, RECONSTRUCTED_NOTICE } from './evolution-presentation';

/**
 * Como o índice de cada ODS chegou ao valor atual (UC07, RF36; #233). Um gráfico por ODS, porque
 * eles não se comparam, e sem variação, seta ou "melhorou": a série é uma reconstrução, e não um
 * julgamento (IND03). A lista da tela principal segue sem série.
 */
@Component({
  selector: 'bios-index-evolution',
  imports: [ChartCard, ErrorState],
  template: `
    <section aria-labelledby="titulo-degraus">
      <h2 id="titulo-degraus">Evolução do índice</h2>
      <p class="notice">{{ notice }}</p>
      @if (evolution.error(); as error) {
        <bios-error-state [error]="error" (retry)="evolution.reload()" />
      } @else {
        <div class="grid">
          @for (card of cards(); track card.ods) {
            <bios-chart-card
              [heading]="card.heading"
              [chart]="card.chart"
              [emptyMessage]="card.emptyMessage"
              [emptyIcon]="card.emptyIcon"
            />
          } @empty {
            <bios-chart-card heading="Reconstruindo a série…" [loading]="true" />
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    h2 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-headline-small);
      color: var(--bios-brand-green);
    }

    .notice {
      margin: 0 0 1rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexEvolution {
  private readonly api = inject(BiosApi);

  readonly cnpj = input.required<string>();

  protected readonly notice = RECONSTRUCTED_NOTICE;
  protected readonly evolution = resource({
    params: () => this.cnpj(),
    loader: ({ params: cnpj }) => this.api.getCompanyIndexEvolution({ path: { cnpj } }),
  });
  protected readonly cards = computed(() =>
    this.evolution.hasValue()
      ? [...this.evolution.value().ods]
          .sort((a, b) => a.ods_number - b.ods_number)
          .map(evolutionCard)
      : [],
  );
}
