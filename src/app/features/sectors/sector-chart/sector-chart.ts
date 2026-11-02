import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { SectorScoreWindow } from '../../../core/api/generated';
import { type SectorChartColors, sectorChartOptions } from './sector-chart-options';

// Só o que o gráfico de linha usa: o ECharts inteiro pesaria várias vezes mais.
echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

/** Cores de reserva, as da apresentação, caso o tema ainda não tenha carregado. */
const FALLBACK_COLORS: SectorChartColors = {
  score: '#2c5f2d',
  confidence: '#5b6b5b',
  text: '#1a1a1a',
  grid: '#c4c8bb',
};

/**
 * Gráfico de linha da evolução do setor (UC10; #26), com o ECharts: índice médio e confiança
 * média em eixos separados, um ponto por mês. Para o leitor de tela é uma imagem com resumo; os
 * números estão na tabela ao lado (`bios-sector-windows-table`).
 */
@Component({
  selector: 'bios-sector-chart',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <div
      class="chart"
      echarts
      [options]="options()"
      [initOpts]="{ renderer: 'svg' }"
      role="img"
      [attr.aria-label]="label()"
    ></div>
  `,
  styles: `
    :host {
      display: block;
    }

    // Largura da tela, nunca mais (NFIN02): o ECharts redesenha ao mudar o tamanho.
    .chart {
      width: 100%;
      height: 20rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorChart {
  private readonly document = inject(DOCUMENT);

  readonly windows = input.required<readonly SectorScoreWindow[]>();
  /** O setor e o ODS, para o resumo lido pelo leitor de tela. */
  readonly subject = input.required<string>();

  protected readonly options = computed(() => sectorChartOptions(this.windows(), this.colors()));

  protected readonly label = computed(
    () =>
      `Gráfico da evolução de ${this.subject()}: índice médio e confiança média por mês, em ` +
      'eixos separados. Os mesmos números estão na tabela.',
  );

  /** As cores do tema (`--bios-brand-*`, `--mat-sys-*`), lidas do documento. */
  private colors(): SectorChartColors {
    const style = this.document.defaultView?.getComputedStyle(this.document.documentElement);
    // Variável vazia (tema ainda não aplicado) também cai na cor de reserva.
    const read = (name: string, fallback: string) => {
      const value = style?.getPropertyValue(name).trim();

      return value !== undefined && value !== '' ? value : fallback;
    };

    return {
      score: read('--bios-brand-green', FALLBACK_COLORS.score),
      confidence: read('--bios-brand-moss', FALLBACK_COLORS.confidence),
      text: read('--mat-sys-on-surface', FALLBACK_COLORS.text),
      grid: read('--mat-sys-outline-variant', FALLBACK_COLORS.grid),
    };
  }
}
