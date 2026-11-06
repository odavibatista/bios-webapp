import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type {
  CompanyEvidence,
  CompanyFullProfileResponse,
  CompanySourceProvenance,
  EvidenceCategoryGroup,
} from '../../../core/api/generated';
import { formatCount } from '../../../shared/charts/chart-spec';
import { formatDateTime } from '../../../shared/format/date-time';
import {
  CATEGORY_LABELS,
  GHG_NO_INVENTORY_LABEL,
  ghgWithoutLocatedInventory,
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
  PERSISTED: 'Consulta anterior disponível',
  PENDING: 'Consulta em andamento',
  UNAVAILABLE: 'Indisponível no momento',
};

const GHG_NO_INVENTORY_MESSAGE =
  'Não há inventário localizado para esta empresa no registro voluntário. Isso não confirma ausência de inventário.';

/** Evidências abertas de cada vez em um grupo: o perfil não pode virar mil telas (#267). */
const GROUP_PAGE = 20;

const evidenceAnchor = (id: string) => `evidencia-${id}`;

interface EvidenceGroup {
  key: string;
  label: string;
  total: number;
  evidences: readonly CompanyEvidence[];
}

function groupsBySource(evidences: readonly CompanyEvidence[]): EvidenceGroup[] {
  const bySource = new Map<string, CompanyEvidence[]>();

  for (const evidence of evidences) {
    const group = bySource.get(evidence.source_slug);

    if (group) group.push(evidence);
    else bySource.set(evidence.source_slug, [evidence]);
  }

  return [...bySource].map(([slug, items]) => ({
    key: slug,
    label: presentEvidence(items[0]).source,
    total: items.length,
    evidences: items,
  }));
}

interface EvidenceSection {
  category: Category;
  label: string;
  ghgNoInventory: boolean;
  groups: EvidenceGroup[];
  sources: {
    slug: string;
    label: string;
    origin: Origin;
    originLabel: string;
    emptyMessage: string;
    retryable: boolean;
  }[];
}

function emptySourceStatus(source: CompanySourceProvenance): {
  message: string;
  retryable: boolean;
} {
  if (ghgWithoutLocatedInventory(source)) {
    return { message: GHG_NO_INVENTORY_MESSAGE, retryable: false };
  }
  if (source.origin === 'PENDING') {
    return { message: 'Consulta em andamento; ainda não há resposta atual.', retryable: true };
  }
  if (source.origin === 'UNAVAILABLE') {
    return {
      message: 'Indisponível no momento; a ausência de registro não foi confirmada.',
      retryable: true,
    };
  }
  if (source.evidence_state === 'NOT_FOUND') {
    return { message: 'Consultada, sem registro para esta empresa.', retryable: false };
  }
  if (source.evidence_state === 'OUTDATED') {
    return {
      message: 'Consulta anterior vencida; a situação atual não foi confirmada.',
      retryable: true,
    };
  }
  if (source.evidence_state === 'CONFIRMED') {
    return {
      message: 'Registro confirmado, mas sem detalhes nesta apresentação.',
      retryable: false,
    };
  }
  return { message: 'Não foi possível verificar esta fonte.', retryable: true };
}

/** Evidências do mesmo retrato do cadastro, sem nova consulta à API. */
@Component({
  selector: 'bios-environmental-evidences',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './environmental-evidences.html',
  styleUrl: './environmental-evidences.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentalEvidences {
  readonly profile = input.required<CompanyFullProfileResponse>();
  readonly refreshing = input(false);
  readonly refreshNotice = input('');
  readonly refresh = output<void>();
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  /** O que a pessoa abriu ou fechou. Sem escolha, só os grupos pequenos começam abertos. */
  private readonly choices = signal<ReadonlyMap<string, boolean>>(new Map());
  private readonly limits = signal<ReadonlyMap<string, number>>(new Map());
  /** A evidência pedida pelo índice, mostrada mesmo além do limite do grupo. */
  private readonly requested = signal<string | null>(null);

  protected readonly count = formatCount;
  protected readonly ghgNoInventoryLabel = GHG_NO_INVENTORY_LABEL;
  protected readonly ghgNoInventoryMessage = GHG_NO_INVENTORY_MESSAGE;

  protected readonly retry = computed(() =>
    retryHint(this.profile().provenance.retry_after_seconds),
  );
  protected readonly sources = computed(() =>
    this.sections().flatMap((section) => section.sources),
  );
  protected readonly sections = computed<EvidenceSection[]>(() => {
    const profile = this.profile();
    return (Object.keys(CATEGORY_LABELS) as Category[]).map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      ghgNoInventory:
        category === 'EMISSAO_GEE' && profile.provenance.sources.some(ghgWithoutLocatedInventory),
      groups: groupsBySource(
        profile.evidences.find((group) => group.category === category)?.evidences ?? [],
      ),
      sources: CATEGORY_SOURCES[category].flatMap((slug) => {
        const source = profile.provenance.sources.find((item) => item.source_slug === slug);
        const emptyStatus = source && emptySourceStatus(source);
        const lastCollection = profile.evidences
          .flatMap((group) => group.evidences)
          .filter((evidence) => evidence.source_slug === slug)
          .map((evidence) => evidence.collected_at)
          .sort()
          .at(-1);
        return source && emptyStatus
          ? [
              {
                slug,
                label: SOURCE_LABELS[slug],
                origin: source.origin,
                originLabel: ghgWithoutLocatedInventory(source)
                  ? GHG_NO_INVENTORY_MESSAGE
                  : (source.origin === 'COLLECTION' || source.origin === 'PERSISTED') &&
                      lastCollection
                    ? `Consultada em ${formatDateTime(lastCollection)}`
                    : ORIGIN_LABELS[source.origin],
                emptyMessage: emptyStatus.message,
                retryable: emptyStatus.retryable,
              },
            ]
          : [];
      }),
    }));
  });

  protected isOpen(group: EvidenceGroup): boolean {
    return this.choices().get(group.key) ?? group.total <= GROUP_PAGE;
  }

  protected setOpen(group: EvidenceGroup, event: Event): void {
    const { open } = event.target as HTMLDetailsElement;

    if (open !== this.isOpen(group)) this.choose(group.key, open);
  }

  protected limitOf(group: EvidenceGroup): number {
    return this.limits().get(group.key) ?? GROUP_PAGE;
  }

  protected visible(group: EvidenceGroup): EvidenceView[] {
    const limit = this.limitOf(group);
    const beyondLimit = group.evidences.slice(limit).find(({ id }) => id === this.requested());

    return [...group.evidences.slice(0, limit), ...(beyondLimit ? [beyondLimit] : [])].map(
      presentEvidence,
    );
  }

  protected showMore(group: EvidenceGroup): void {
    this.limits.update((limits) =>
      new Map(limits).set(group.key, this.limitOf(group) + GROUP_PAGE),
    );
  }

  /** "Ver evidência": abre o grupo, chega até o item e leva o foco a ele. */
  reveal(anchor: string): void {
    for (const group of this.sections().flatMap((section) => section.groups)) {
      const evidence = group.evidences.find(({ id }) => evidenceAnchor(id) === anchor);

      if (evidence) {
        this.requested.set(evidence.id);
        this.choose(group.key, true);
      }
    }

    afterNextRender(
      () => {
        const evidence = this.document.getElementById(anchor);

        evidence?.scrollIntoView({ block: 'start' });
        evidence?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  private choose(key: string, open: boolean): void {
    this.choices.update((choices) => new Map(choices).set(key, open));
  }
}
