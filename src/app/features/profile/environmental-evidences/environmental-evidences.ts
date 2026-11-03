import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type {
  CompanyFullProfileResponse,
  CompanySourceProvenance,
  EvidenceCategoryGroup,
} from '../../../core/api/generated';
import {
  CATEGORY_LABELS,
  presentEvidence,
  retryHint,
  SOURCE_LABELS,
  type EvidenceView,
} from './evidence-presentation';

type Category = EvidenceCategoryGroup['category'];
type Origin = CompanySourceProvenance['origin'];

const CATEGORY_SOURCES: Record<Category, readonly CompanySourceProvenance['source_slug'][]> = {
  INFRACAO_AMBIENTAL: ['IBAMA'],
  CONDUTA_ADMINISTRATIVA: ['CGU_CEIS', 'CGU_CNEP'],
  EMISSAO_GEE: ['GHG_PROTOCOL'],
};

const ORIGIN_LABELS: Record<Origin, string> = {
  COLLECTION: 'Consultada nesta atualização',
  PERSISTED: 'Dados armazenados',
  PENDING: 'Atualização em andamento',
  UNAVAILABLE: 'Fonte indisponível nesta consulta',
};

interface EvidenceSection {
  category: Category;
  label: string;
  evidences: EvidenceView[];
  sources: { slug: string; label: string; origin: Origin; originLabel: string }[];
}

/** Evidências do mesmo retrato do cadastro, sem nova consulta à API. */
@Component({
  selector: 'bios-environmental-evidences',
  imports: [MatButtonModule],
  templateUrl: './environmental-evidences.html',
  styleUrl: './environmental-evidences.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentalEvidences {
  readonly profile = input.required<CompanyFullProfileResponse>();
  readonly refresh = output<void>();

  protected readonly retry = computed(() =>
    retryHint(this.profile().provenance.retry_after_seconds),
  );
  protected readonly sections = computed<EvidenceSection[]>(() => {
    const profile = this.profile();
    return (Object.keys(CATEGORY_LABELS) as Category[]).map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      evidences: (
        profile.evidences.find((group) => group.category === category)?.evidences ?? []
      ).map(presentEvidence),
      sources: CATEGORY_SOURCES[category].flatMap((slug) => {
        const source = profile.provenance.sources.find((item) => item.source_slug === slug);
        return source
          ? [
              {
                slug,
                label: SOURCE_LABELS[slug],
                origin: source.origin,
                originLabel: ORIGIN_LABELS[source.origin],
              },
            ]
          : [];
      }),
    }));
  });
}
