import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import { ChartCard } from '../../../shared/charts/chart-card';
import { formatCount } from '../../../shared/charts/chart-spec';
import { profileCards, sourceResults } from './profile-charts';

/**
 * Leitura visual do perfil (UC07, RF35; #232). Cada card carrega ao aparecer, e quem tem poucas
 * evidências lê uma frase, e não um gráfico de uma fatia. A lista das evidências segue abaixo.
 */
@Component({
  selector: 'bios-company-charts',
  imports: [ChartCard, MatIconModule, NgTemplateOutlet],
  template: `
    <section aria-labelledby="titulo-visual">
      <h2 id="titulo-visual">Evidências em gráficos</h2>
      <div class="grid">
        @if (timeline(); as card) {
          <ng-container
            [ngTemplateOutlet]="chart"
            [ngTemplateOutletContext]="{ $implicit: card }"
          />
        }
        <section class="sources" aria-labelledby="titulo-resultado-fontes">
          <h3 id="titulo-resultado-fontes">Resultado por fonte</h3>
          <p>O que cada fonte respondeu. Ausência de registro não é ponto positivo nem negativo.</p>
          <ul>
            @for (result of sources(); track result.source) {
              <li>
                <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">{{
                  result.icon
                }}</mat-icon>
                <span class="source">{{ result.source }}</span>
                <strong>{{ result.label }}</strong>
                @if (result.count) {
                  <span>{{ count(result.count) }}</span>
                }
              </li>
            }
          </ul>
        </section>
        @for (card of others(); track card.id) {
          <ng-container
            [ngTemplateOutlet]="chart"
            [ngTemplateOutletContext]="{ $implicit: card }"
          />
        }
      </div>
    </section>

    <ng-template #chart let-card>
      <bios-chart-card
        [class.wide]="card.wide"
        [heading]="card.heading"
        [description]="card.description"
        [chart]="card.chart"
        [emptyMessage]="card.emptyMessage"
      >
        @if (card.note) {
          <p class="note">{{ card.note }}</p>
        }
      </bios-chart-card>
    </ng-template>
  `,
  styleUrl: './company-charts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCharts {
  readonly profile = input.required<CompanyFullProfileResponse>();

  private readonly cards = computed(() => profileCards(this.profile()));
  /** A linha do tempo vem primeiro, na largura toda, para a grade não abrir buracos. */
  protected readonly timeline = computed(() => this.cards()[0] ?? null);
  protected readonly others = computed(() => this.cards().slice(1));
  protected readonly sources = computed(() => sourceResults(this.profile()));

  protected count(value: number): string {
    return `${formatCount(value)} ${value === 1 ? 'registro' : 'registros'}`;
  }
}
