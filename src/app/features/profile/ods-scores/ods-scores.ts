import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { CompanyFullProfileResponse } from '../../../core/api/generated';
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
  readonly profile = input.required<CompanyFullProfileResponse>();
  /** A média do setor por ODS, quando publicada. Só situa o valor: não julga a empresa. */
  readonly sectorAverages = input<Readonly<Record<number, number>>>({});
  /** "Ver evidência": a seção de evidências abre o grupo e chega até o item. */
  readonly evidenceRequested = output<string>();

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
}
