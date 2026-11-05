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

/** Junta apenas meses consecutivos totalmente omitidos e com as mesmas contagens. */
export function sectorWindowRows(windows: readonly SectorScoreWindow[]): WindowRow[] {
  const rows: WindowRow[] = [];

  for (const window of windows) {
    const previous = rows.at(-1);
    const omitted = window.average_score === null && window.average_confidence === null;
    if (
      omitted &&
      previous?.scoreOmitted &&
      previous.confidenceOmitted &&
      previous.companies === window.company_count &&
      previous.scored === window.scored_company_count &&
      previous.key.split('|')[1] === window.window_start
    ) {
      previous.month = `${monthLabel(previous.key.split('|')[0] ?? '')} a ${monthLabel(window.window_start)}`;
      previous.key = `${previous.key.split('|')[0]}|${window.window_end}`;
      continue;
    }

    rows.push({
      key: `${window.window_start}|${window.window_end}`,
      month: monthLabel(window.window_start),
      score: formatAverageScore(window.average_score),
      scoreOmitted: window.average_score === null,
      confidence: formatAverageConfidence(window.average_confidence),
      confidenceOmitted: window.average_confidence === null,
      companies: window.company_count,
      scored: window.scored_company_count,
    });
  }

  return rows;
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

  protected readonly rows = computed(() => sectorWindowRows(this.windows()));

  protected readonly anyOmitted = computed(() => hasOmittedAverage(this.windows()));
}
