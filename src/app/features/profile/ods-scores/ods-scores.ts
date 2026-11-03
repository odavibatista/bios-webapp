import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
import { retryHint } from '../environmental-evidences/evidence-presentation';
import { presentExplanation } from './explanation-presentation';
import { presentScore } from './score-presentation';

/** Índices independentes por ODS, lidos do mesmo perfil que as evidências (UC07, RF10 e RF11). */
@Component({
  selector: 'bios-ods-scores',
  templateUrl: './ods-scores.html',
  styleUrl: './ods-scores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdsScores {
  readonly profile = input.required<CompanyFullProfileResponse>();
  private readonly document = inject(DOCUMENT);

  protected readonly scores = computed(() =>
    this.profile()
      .ods_scores.map((score) => ({
        ...presentScore(score),
        explanation: presentExplanation(score, this.profile().evidences),
      }))
      .sort((a, b) => a.ods_number - b.ods_number),
  );
  protected readonly retry = computed(() =>
    retryHint(this.profile().provenance.retry_after_seconds),
  );

  protected showEvidence(anchor: string): void {
    const evidence = this.document.getElementById(anchor);
    evidence?.scrollIntoView({ block: 'start' });
    evidence?.focus({ preventScroll: true });
  }
}
