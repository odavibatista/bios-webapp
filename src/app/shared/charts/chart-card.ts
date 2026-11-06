import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EmptyState } from '../states/empty-state';
import { TableScroll } from '../table-scroll/table-scroll';
import { ChartCanvas } from './chart-canvas';
import type { ChartSpec } from './chart-spec';

type ChartView = 'chart' | 'table';

const SKELETON_HEIGHT = 14;

/**
 * Card de todos os gráficos (#231): título, alternância entre gráfico e tabela, carregamento
 * próprio e estado vazio com ícone. O ECharts só chega quando o card aparece na tela.
 */
@Component({
  selector: 'bios-chart-card',
  imports: [ChartCanvas, EmptyState, MatButtonToggleModule, TableScroll],
  template: `
    <header>
      <h3>{{ heading() }}</h3>
      @if (chart()) {
        <mat-button-toggle-group
          class="views"
          hideSingleSelectionIndicator
          [attr.aria-label]="'Ver ' + heading() + ' como'"
          [value]="view()"
          (change)="view.set($event.value)"
        >
          <mat-button-toggle value="chart">Gráfico</mat-button-toggle>
          <mat-button-toggle value="table">Tabela</mat-button-toggle>
        </mat-button-toggle-group>
      }
    </header>
    @if (description(); as text) {
      <p class="description">{{ text }}</p>
    }
    @if (chart(); as spec) {
      <div class="body" [class.stale]="loading()">
        @if (view() === 'chart') {
          @defer (on viewport) {
            <bios-chart-canvas [spec]="spec" />
          } @placeholder {
            <div class="skeleton" [style.height.rem]="spec.height"></div>
          }
        } @else {
          <bios-table-scroll [label]="heading()" bordered>
            <table>
              <caption class="visually-hidden">
                {{
                  heading()
                }}
              </caption>
              <thead>
                <tr>
                  @for (header of spec.table.headers; track $index) {
                    <th scope="col">{{ header }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of spec.table.rows; track $index) {
                  <tr>
                    @for (cell of row; track $index) {
                      <td>{{ cell }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </bios-table-scroll>
        }
      </div>
    } @else if (loading()) {
      <div class="skeleton" role="status" [style.height.rem]="skeletonHeight">
        <span class="visually-hidden">Carregando {{ heading() }}…</span>
      </div>
    } @else {
      <bios-empty-state [message]="emptyMessage()" [icon]="emptyIcon()" />
    }
    <ng-content />
  `,
  styleUrl: './chart-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCard {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  /** `null` quando não há o que desenhar: a mensagem abaixo explica por quê. */
  readonly chart = input<ChartSpec | null>(null);
  /** Com um gráfico já na tela, ele fica esmaecido em vez de dar lugar ao esqueleto. */
  readonly loading = input(false);
  readonly emptyMessage = input('Sem dados para mostrar neste gráfico.');
  readonly emptyIcon = input('info');

  protected readonly view = signal<ChartView>('chart');
  protected readonly skeletonHeight = SKELETON_HEIGHT;
}
