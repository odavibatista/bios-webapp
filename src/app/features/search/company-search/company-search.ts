import { BreakpointObserver } from '@angular/cdk/layout';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { isApiError } from '../../../core/api/api-error';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { fieldMessage } from '../../../shared/forms/account-rules';
import { AsyncState } from '../../../shared/states/async-state';
import { ErrorState } from '../../../shared/states/error-state';
import { FormErrorSummary } from '../../../shared/states/form-error-summary';
import {
  BRAZILIAN_UFS,
  cnaeDigits,
  criteriaFromParams,
  criteriaToParams,
  hasCriterion,
  PAGE_SIZE_OPTIONS,
  type SearchCriteria,
  type SearchOrder,
  toApiQuery,
  toExportQuery,
} from '../search-criteria';
import {
  cityRule,
  cnaeRule,
  minConfidenceRule,
  minScoreRule,
  nameRule,
  ufRule,
} from '../search-rules';
import { SearchResults } from '../search-results/search-results';

/** Abaixo desta largura, a lista vira cartões; acima, tabela. */
export const CARDS_LAYOUT = '(max-width: 719.98px)';

/** Sem nenhum critério, a pesquisa devolveria a base inteira (UC08, regra 3). */
export const NO_CRITERION_MESSAGE =
  'Informe ao menos um critério para pesquisar: nome, UF, município, CNAE ou ODS.';

/** O formulário usa os nomes da API, para os erros de campo dela caírem no lugar certo. */
type CriteriaForm = FormGroup<{
  name: FormControl<string>;
  uf: FormControl<string>;
  city: FormControl<string>;
  cnae: FormControl<string>;
  ods: FormControl<number | null>;
  order: FormControl<SearchOrder | null>;
  min_score: FormControl<string>;
  min_confidence: FormControl<string>;
}>;

function decimal(value: string): number | null {
  const trimmed = value.trim();

  return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
}

function blank(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

/**
 * Pesquisa de empresas (UC08, RF13; #25). Os critérios moram na URL: pesquisar é navegar, o link
 * é compartilhável e o "voltar" do navegador refaz a pesquisa anterior. O formulário reflete a
 * URL e só a altera ao pesquisar. Índice mínimo e confiança mínima só existem com um ODS, que
 * vem da lista dos ODS que o BIOS calcula (regras 3 e 8), nunca de uma lista fixa.
 */
@Component({
  selector: 'bios-company-search',
  imports: [
    AsyncState,
    ErrorState,
    FormErrorSummary,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    SearchResults,
  ],
  templateUrl: './company-search.html',
  styleUrl: './company-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySearch {
  private readonly api = inject(BiosApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly ufs = BRAZILIAN_UFS;
  protected readonly messageOf = fieldMessage;

  /** Os critérios da URL: a única fonte da pesquisa. */
  protected readonly criteria = toSignal(
    this.route.queryParams.pipe(map((params) => criteriaFromParams(params))),
    { initialValue: criteriaFromParams(this.route.snapshot.queryParams) },
  );
  protected readonly searched = computed(() => hasCriterion(this.criteria()));

  /** Os ODS que o BIOS calcula, para o seletor (UC08, regra 8). */
  protected readonly odsList = resource({ loader: () => this.api.listOds() });

  protected readonly results = resource({
    params: () => (this.searched() ? toApiQuery(this.criteria()) : undefined),
    loader: ({ params: query }) => this.api.searchCompanies({ query }),
  });

  protected readonly form: CriteriaForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [nameRule] }),
    uf: new FormControl('', { nonNullable: true, validators: [ufRule] }),
    city: new FormControl('', { nonNullable: true, validators: [cityRule] }),
    cnae: new FormControl('', { nonNullable: true, validators: [cnaeRule] }),
    ods: new FormControl<number | null>(null),
    order: new FormControl<SearchOrder | null>(null),
    min_score: new FormControl('', { nonNullable: true, validators: [minScoreRule] }),
    min_confidence: new FormControl('', { nonNullable: true, validators: [minConfidenceRule] }),
  });

  /** Erros do formulário fora dos campos (ex.: nenhum critério). */
  protected readonly formErrors = signal<string[]>([]);
  protected readonly exporting = signal(false);
  protected readonly exportError = signal<unknown>(null);

  protected readonly exportLimit = computed(() => {
    const error = this.exportError();
    if (!isApiError(error) || error.code !== 'EXPORT_TOO_LARGE') return null;

    const details = error.details as { total?: unknown; max?: unknown } | undefined;
    return typeof details?.total === 'number' && typeof details.max === 'number'
      ? { total: details.total, max: details.max }
      : null;
  });

  protected readonly cards = toSignal(
    inject(BreakpointObserver)
      .observe(CARDS_LAYOUT)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** O ODS da pesquisa em curso, para as colunas e a explicação do índice. */
  protected readonly odsLabel = computed(() => {
    const ods = this.criteria().ods;

    return ods === null ? null : `ODS ${ods}`;
  });

  protected readonly page = computed(() =>
    this.results.hasValue() ? this.results.value().pagination : null,
  );

  /** O tamanho da página atual entre as opções, mesmo que a URL traga um fora da lista. */
  protected readonly pageSizes = computed(() => {
    const current = this.criteria().pageSize;

    return [...new Set([...PAGE_SIZE_OPTIONS, current])].sort((a, b) => a - b);
  });

  /** Falha da pesquisa: o que mostrar e, se for ODS fora dos calculados, os disponíveis. */
  protected readonly failure = computed(() => {
    if (this.results.status() !== 'error') return null;

    const error = this.results.error();
    const view = describeError(error);
    const validOds =
      view.code === 'ODS_NOT_AVAILABLE' && isApiError(error)
        ? ((error.details as { valid_ods?: unknown } | undefined)?.valid_ods ?? [])
        : [];

    return {
      error,
      view,
      validOds: Array.isArray(validOds) ? validOds.filter((n) => typeof n === 'number') : [],
      fieldMessages: view.fieldErrors.map((field) => field.message),
    };
  });

  constructor() {
    // A URL manda: ao abrir um link, ao pesquisar e ao voltar pelo navegador, o formulário
    // mostra os critérios da pesquisa exibida.
    effect(() => {
      const criteria = this.criteria();

      untracked(() => {
        this.fillForm(criteria);
        this.exportError.set(null);
      });
    });

    // Sem ODS, índice mínimo, confiança mínima e ordenação não existem (UC08, regra 3).
    this.form.controls.ods.valueChanges.subscribe((ods) => {
      this.syncOdsFilters(ods);
    });
  }

  /** Título de um ODS na lista dos calculados (`ODS 13 — Ação contra...`). */
  protected odsTitle(ods: number): string {
    const found = this.odsList.hasValue()
      ? this.odsList.value().data.find((item) => item.ods_number === ods)
      : undefined;

    return found ? `ODS ${ods} — ${found.title}` : `ODS ${ods}`;
  }

  protected async search(): Promise<void> {
    this.formErrors.set([]);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const criteria = this.criteriaFromForm();

    if (!hasCriterion(criteria)) {
      this.formErrors.set([NO_CRITERION_MESSAGE]);
      return;
    }

    await this.go({ ...criteria, page: 1 });
  }

  protected async clear(): Promise<void> {
    this.formErrors.set([]);
    await this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  protected async goToPage(page: number): Promise<void> {
    await this.go({ ...this.criteria(), page });
  }

  protected async changePageSize(value: string): Promise<void> {
    await this.go({ ...this.criteria(), pageSize: Number(value), page: 1 });
  }

  /** Baixa a lista inteira; a API aplica os critérios da URL sem paginação (UC09). */
  protected async exportResults(): Promise<void> {
    if (
      this.exporting() ||
      !this.results.hasValue() ||
      this.results.value().pagination.total === 0
    ) {
      return;
    }

    this.exporting.set(true);
    this.exportError.set(null);
    try {
      const file = await this.api.exportCompaniesXlsx({ query: toExportQuery(this.criteria()) });
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      this.exportError.set(error);
    } finally {
      this.exporting.set(false);
    }
  }

  /** Pesquisa um dos ODS disponíveis, mantendo os demais critérios (fluxo 3.1). */
  protected async searchOds(ods: number): Promise<void> {
    await this.go({ ...this.criteria(), ods, page: 1 });
  }

  private go(criteria: SearchCriteria): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: criteriaToParams(criteria),
    });
  }

  private criteriaFromForm(): SearchCriteria {
    const raw = this.form.getRawValue();
    const ods = raw.ods;
    const cnae = blank(raw.cnae);

    return {
      name: blank(raw.name),
      uf: blank(raw.uf)?.toUpperCase() ?? null,
      city: blank(raw.city),
      cnae: cnae === null ? null : cnaeDigits(cnae),
      ods,
      minScore: ods === null ? null : decimal(raw.min_score),
      minConfidence: ods === null ? null : decimal(raw.min_confidence),
      order: ods === null ? null : raw.order,
      page: 1,
      pageSize: this.criteria().pageSize,
    };
  }

  private fillForm(criteria: SearchCriteria): void {
    this.form.reset({
      name: criteria.name ?? '',
      uf: criteria.uf ?? '',
      city: criteria.city ?? '',
      cnae: criteria.cnae ?? '',
      ods: criteria.ods,
      order: criteria.order,
      min_score: criteria.minScore === null ? '' : String(criteria.minScore),
      min_confidence: criteria.minConfidence === null ? '' : String(criteria.minConfidence),
    });
    this.syncOdsFilters(criteria.ods);
  }

  private syncOdsFilters(ods: number | null): void {
    if (ods === null) {
      this.form.controls.order.reset(null, { emitEvent: false });
      this.form.controls.order.disable({ emitEvent: false });
    } else {
      this.form.controls.order.enable({ emitEvent: false });
    }

    for (const control of [this.form.controls.min_score, this.form.controls.min_confidence]) {
      if (ods === null) {
        control.reset('', { emitEvent: false });
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    }
  }

  private focusFirstInvalid(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
      },
      { injector: this.injector },
    );
  }
}
