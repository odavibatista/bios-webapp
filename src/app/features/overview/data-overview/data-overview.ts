import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CompanyAnalytics } from '../../../core/api/generated';
import { ChartCard } from '../../../shared/charts/chart-card';
import { overviewCards } from '../overview-charts';

const SKELETON_CARDS = ['Situação cadastral', 'Porte', 'UF', 'Natureza jurídica'];

/**
 * A grade de gráficos do panorama (UC19, RF37; #234). Cada card carrega ao aparecer na tela, e ao
 * trocar o filtro segura o gráfico anterior até a resposta chegar.
 */
@Component({
  selector: 'bios-data-overview',
  imports: [ChartCard],
  template: `
    @if (analytics()) {
      @for (card of cards(); track card.id) {
        <bios-chart-card
          [class.wide]="card.wide"
          [heading]="card.heading"
          [description]="card.description"
          [chart]="card.chart"
          [loading]="loading()"
          [emptyMessage]="card.emptyMessage"
        />
      }
    } @else {
      @for (heading of skeletons; track heading) {
        <bios-chart-card [heading]="heading" [loading]="true" />
      }
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 26rem), 1fr));
      gap: 1rem;
    }

    .wide {
      grid-column: 1 / -1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataOverview {
  readonly analytics = input.required<CompanyAnalytics | null>();
  readonly loading = input(false);

  protected readonly skeletons = SKELETON_CARDS;
  protected readonly cards = computed(() => {
    const analytics = this.analytics();

    return analytics ? overviewCards(analytics) : [];
  });
}
