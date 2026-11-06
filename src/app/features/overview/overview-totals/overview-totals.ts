import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CompanyAnalytics } from '../../../core/api/generated';
import { formatCount } from '../../../shared/charts/chart-spec';

const MONEY = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const AREA = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

/** Quantos totais o esqueleto reserva, para a tela não pular ao carregar. */
const PLACEHOLDERS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Os totais de um recorte da base (UC19, RF37). Só números do conjunto: nenhum nome de empresa.
 * "Empresas na base", porque ela reúne quem tem registros, e não todas as empresas do Brasil.
 */
@Component({
  selector: 'bios-overview-totals',
  template: `
    @if (tiles(); as tiles) {
      <dl class="tiles" [class.stale]="loading()">
        @for (tile of tiles; track tile.label) {
          <div>
            <dt>{{ tile.label }}</dt>
            <dd>{{ tile.value }}</dd>
          </div>
        }
      </dl>
    } @else {
      <div class="tiles" aria-busy="true" aria-label="Calculando os totais…" role="group">
        @for (placeholder of placeholders; track placeholder) {
          <div class="skeleton"></div>
        }
      </div>
    }
    <p>
      Números das empresas na base, formada por empresas com registros. Não representam todas as
      empresas do Brasil.
    </p>
  `,
  styleUrl: './overview-totals.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewTotals {
  readonly analytics = input.required<CompanyAnalytics | null>();
  readonly loading = input(false);

  protected readonly placeholders = PLACEHOLDERS;

  protected readonly tiles = computed(() => {
    const analytics = this.analytics();

    if (!analytics) return null;

    const { totals } = analytics;

    return [
      { label: 'Empresas na base', value: formatCount(analytics.companies) },
      { label: 'Evidências confirmadas', value: formatCount(totals.confirmed_evidences) },
      { label: 'Autos com multa', value: formatCount(totals.fine_notices) },
      { label: 'Valor lançado em multas', value: MONEY.format(totals.fine_amount) },
      {
        label: 'Hectares nos autos',
        // Zero aqui é falta de informação nos autos, e não área zero (IND02).
        value: totals.area_hectares > 0 ? AREA.format(totals.area_hectares) : 'Sem dado',
      },
      ...analytics.ods.map(({ ods_number, companies_with_index }) => ({
        label: `Com índice no ODS ${ods_number}`,
        value: formatCount(companies_with_index),
      })),
    ];
  });
}
