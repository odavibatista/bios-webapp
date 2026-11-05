import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CompanySearchItem } from '../../../core/api/generated';
import { formatCnae } from '../../../shared/format/cnae';
import type { SearchOrder } from '../search-criteria';
import { formatCnpj, formatConfidence, formatScore, statusLabel } from '../search-format';

/**
 * A página de empresas encontradas (UC08, regras 5 e 6): o resumo de cada uma e, com um ODS
 * escolhido, índice e confiança em colunas separadas, nunca combinados. Em tela larga é tabela,
 * que rola dentro do próprio contêiner se não couber (NFIN02); em tela estreita, cartões.
 */
@Component({
  selector: 'bios-search-results',
  imports: [RouterLink],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults {
  readonly items = input.required<readonly CompanySearchItem[]>();
  /** O ODS escolhido (`ODS 13`), ou `null` sem ODS: aí não há colunas de índice. */
  readonly odsLabel = input<string | null>(null);
  readonly layout = input<'table' | 'cards'>('table');
  readonly order = input<SearchOrder | null>(null);

  protected readonly firstMissingIndex = computed(() =>
    this.order() === null
      ? -1
      : this.items().findIndex((item) => this.missing(item.ods_score?.score_value)),
  );

  protected readonly cnpj = formatCnpj;
  protected readonly cnae = formatCnae;
  protected readonly status = statusLabel;
  protected readonly score = formatScore;
  protected readonly confidence = formatConfidence;

  /** Sem cálculo no ODS (ou sem ODS na linha): o texto vem em destaque próprio, não como número. */
  protected missing(value: number | null | undefined): boolean {
    return value === null || value === undefined;
  }
}
