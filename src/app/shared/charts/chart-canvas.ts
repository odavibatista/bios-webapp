import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BarChart, LineChart, PieChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import brazilianPortuguese from 'echarts/lib/i18n/langPT-br.js';
import { SVGRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { ChartSpec, ChartTheme } from './chart-spec';

// Só o que os cards usam: o ECharts inteiro pesaria várias vezes mais.
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TreemapChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  SVGRenderer,
]);
// Só o eixo de tempo traz texto do ECharts; o idioma vem com ele, sob demanda (#258).
echarts.registerLocale('PT-BR', brazilianPortuguese);

/** Cores de reserva, as da apresentação, caso o tema ainda não tenha carregado. */
const FALLBACK_THEME = { text: '#1a1a1a', grid: '#c4c8bb', surface: '#ffffff' };
const NARROW = '(max-width: 599.98px)';

/**
 * O desenho de um gráfico. `ChartCard` o carrega sob demanda: é a única peça que traz o ECharts,
 * e nada dela pode ser importado fora de um `@defer`.
 */
@Component({
  selector: 'bios-chart-canvas',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <div
      class="chart"
      echarts
      [options]="options()"
      [initOpts]="{ renderer: 'svg', locale: 'PT-BR' }"
      role="img"
      [attr.aria-label]="spec().label"
      [style.height.rem]="height()"
    ></div>
    @if (spec().legend; as legend) {
      <ul class="legend">
        @for (entry of legend; track entry.label) {
          <li>
            <span class="swatch" [style.background-color]="entry.color"></span>
            <span>{{ entry.label }} {{ entry.share }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    // Largura da tela, nunca mais (NFIN02): o ECharts redesenha ao mudar o tamanho.
    .chart {
      width: 100%;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem 1rem;
      margin: 0.5rem 0 0;
      padding: 0;
      list-style: none;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface);
    }

    li {
      display: flex;
      gap: 0.375rem;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .swatch {
      flex: none;
      width: 0.75rem;
      height: 0.75rem;
      margin-top: 0.125rem;
      border-radius: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCanvas {
  private readonly document = inject(DOCUMENT);

  readonly spec = input.required<ChartSpec>();

  protected readonly options = computed(() => this.spec().options(this.theme()));
  protected readonly height = computed(() => {
    const { height, narrowHeight } = this.spec();

    return this.theme().narrow ? (narrowHeight ?? height) : height;
  });

  /** As cores do tema (`--mat-sys-*`), lidas do documento. */
  private theme(): ChartTheme {
    const view = this.document.defaultView;
    const style = view?.getComputedStyle(this.document.documentElement);
    const read = (name: string, fallback: string) => {
      const value = style?.getPropertyValue(name).trim();

      return value !== undefined && value !== '' ? value : fallback;
    };

    return {
      text: read('--mat-sys-on-surface', FALLBACK_THEME.text),
      grid: read('--mat-sys-outline-variant', FALLBACK_THEME.grid),
      surface: read('--mat-sys-surface', FALLBACK_THEME.surface),
      narrow: view?.matchMedia?.(NARROW).matches ?? false,
    };
  }
}
