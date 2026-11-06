import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import { formatCount } from '../../../shared/charts/chart-spec';
import { retryHint } from '../environmental-evidences/evidence-presentation';
import { presentExplanation } from './explanation-presentation';
import { presentScore, presentSectorAverage } from './score-presentation';

/** Índices independentes por ODS, lidos do mesmo perfil que as evidências (UC07, RF10 e RF11). */
@Component({
  selector: 'bios-ods-scores',
  templateUrl: './ods-scores.html',
  styleUrl: './ods-scores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdsScores {
  private readonly pageSize = 20;
  private readonly opened = signal<ReadonlySet<number>>(new Set());
  private readonly limits = signal<ReadonlyMap<number, number>>(new Map());

  readonly profile = input.required<CompanyFullProfileResponse>();
  /** A média do setor por ODS, quando publicada. Só situa o valor: não julga a empresa. */
  readonly sectorAverages = input<Readonly<Record<number, number>>>({});
  /** "Ver evidência": a seção de evidências abre o grupo e chega até o item. */
  readonly evidenceRequested = output<string>();
  protected readonly count = formatCount;

  protected readonly scores = computed(() =>
    this.profile()
      .ods_scores.map((score) => ({
        ...presentScore(score),
        sector: presentSectorAverage(this.sectorAverages()[score.ods_number]),
        explanation: presentExplanation(score, this.profile().evidences),
      }))
      .sort((a, b) => a.ods_number - b.ods_number),
  );
  protected readonly retry = computed(() =>
    retryHint(this.profile().provenance.retry_after_seconds),
  );

  protected isOpen(ods: number): boolean {
    return this.opened().has(ods);
  }

  protected setOpen(ods: number, event: Event): void {
    const open = (event.target as HTMLDetailsElement).open;
    if (open === this.isOpen(ods)) return;
    this.opened.update((current) => {
      const next = new Set(current);
      if (open) next.add(ods);
      else next.delete(ods);
      return next;
    });
  }

  protected limitOf(ods: number): number {
    return this.limits().get(ods) ?? this.pageSize;
  }

  protected visibleCount(ods: number, total: number): number {
    return Math.min(this.limitOf(ods), total);
  }

  protected showMore(ods: number): void {
    this.limits.update((current) => new Map(current).set(ods, this.limitOf(ods) + this.pageSize));
  }
}
