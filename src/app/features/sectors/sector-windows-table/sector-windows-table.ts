import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { SectorScoreWindow } from '../../../core/api/generated';
import {
  formatAverageConfidence,
  formatAverageScore,
  hasOmittedAverage,
  monthLabel,
  OMITTED_AVERAGE_NOTE,
} from '../sector-format';

/** Uma linha da tabela, já no texto que a pessoa lê. */
interface WindowRow {
  key: string;
  month: string;
  score: string;
  scoreOmitted: boolean;
  confidence: string;
  confidenceOmitted: boolean;
  companies: number;
  scored: number;
}

/**
 * As janelas da evolução em tabela (UC10, regra 3): o mês, o índice médio e a confiança média em
 * colunas separadas, nunca combinados, e as contagens. É também a alternativa acessível do
 * gráfico, com os mesmos números em texto. Só agregados do setor, nenhuma empresa (regra 1).
 */
@Component({
  selector: 'bios-sector-windows-table',
  templateUrl: './sector-windows-table.html',
  styleUrl: './sector-windows-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorWindowsTable {
  readonly windows = input.required<readonly SectorScoreWindow[]>();
  /** A legenda da tabela, lida pelo leitor de tela (`Evolução de METALURGIA no ODS 13`). */
  readonly caption = input.required<string>();

  protected readonly omittedNote = OMITTED_AVERAGE_NOTE;

  protected readonly rows = computed<WindowRow[]>(() =>
    this.windows().map((window) => ({
      key: window.window_start,
      month: monthLabel(window.window_start),
      score: formatAverageScore(window.average_score),
      scoreOmitted: window.average_score === null,
      confidence: formatAverageConfidence(window.average_confidence),
      confidenceOmitted: window.average_confidence === null,
      companies: window.company_count,
      scored: window.scored_company_count,
    })),
  );

  protected readonly anyOmitted = computed(() => hasOmittedAverage(this.windows()));
}
