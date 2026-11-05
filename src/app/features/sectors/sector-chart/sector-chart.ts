import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { SectorScoreWindow } from '../../../core/api/generated';
import { type SectorChartColors, sectorChartOptions } from './sector-chart-options';

// Só o que o gráfico de linha usa: o ECharts inteiro pesaria várias vezes mais.
echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

/** Cores de reserva, as da apresentação, caso o tema ainda não tenha carregado. */
const FALLBACK_COLORS: SectorChartColors = {
  score: '#2c5f2d',
  confidence: '#5b6b5b',
  text: '#1a1a1a',
  grid: '#c4c8bb',
};

/**
 * Dois gráficos da evolução do setor, um por medida. A tabela preserva os números em texto.
 */
@Component({
  selector: 'bios-sector-chart',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <h3>Índice médio</h3>
    <p>Escala completa do índice: −100 a 100. O eixo acompanha os valores desta série.</p>
    <div
      class="chart"
      echarts
      [options]="scoreOptions()"
      [initOpts]="{ renderer: 'svg' }"
      role="img"
      [attr.aria-label]="scoreLabel()"
    ></div>
    <h3>Confiança média</h3>
    <div
      class="chart"
      echarts
      [options]="confidenceOptions()"
      [initOpts]="{ renderer: 'svg' }"
      role="img"
      [attr.aria-label]="confidenceLabel()"
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

    h3 {
      margin: 1.5rem 0 0.5rem;
      font: var(--mat-sys-title-medium);
    }

    p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorChart {
  private readonly document = inject(DOCUMENT);

  readonly windows = input.required<readonly SectorScoreWindow[]>();
  /** O setor e o ODS, para o resumo lido pelo leitor de tela. */
  readonly subject = input.required<string>();

  protected readonly scoreOptions = computed(() =>
    sectorChartOptions(this.windows(), this.colors(), 'score'),
  );
  protected readonly confidenceOptions = computed(() =>
    sectorChartOptions(this.windows(), this.colors(), 'confidence'),
  );

  protected readonly scoreLabel = computed(
    () => `Gráfico do índice médio de ${this.subject()}. Os mesmos números estão na tabela.`,
  );
  protected readonly confidenceLabel = computed(
    () => `Gráfico da confiança média de ${this.subject()}. Os mesmos números estão na tabela.`,
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
