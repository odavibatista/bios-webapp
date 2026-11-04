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
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { BiosApi } from '../../../core/api/bios-api';
import { describeError } from '../../../shared/errors/describe-error';
import { applyApiErrors } from '../../../shared/errors/form-errors';
import { fieldMessage } from '../../../shared/forms/account-rules';
import { EmptyState } from '../../../shared/states/empty-state';
import { ErrorState } from '../../../shared/states/error-state';
import { LoadingState } from '../../../shared/states/loading-state';
import { SectorChart } from '../sector-chart/sector-chart';
import {
  isCompleteSectorCriteria,
  sectorCnaeDigits,
  sectorCnaeRule,
  sectorCriteriaFromParams,
  sectorCriteriaToParams,
} from '../sector-criteria';
import { SectorWindowsTable } from '../sector-windows-table/sector-windows-table';

/** Texto sem acento e em maiúsculas, para achar "metal" em "METALURGIA" e "educacao" em "EDUCAÇÃO". */
function searchable(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
}

/**
 * Evolução do índice médio por setor (UC10, RF30; #26). O setor (divisão, grupo, classe ou
 * subclasse do CNAE) e o ODS moram na URL (`/setores?cnae=24&ods=13`), como na pesquisa: o link é
 * compartilhável e o "voltar" do navegador refaz a consulta anterior. Tudo é agregado por setor,
 * nunca por empresa (regra 1). Com menos de duas janelas, a tela diz que o histórico ainda é
 * insuficiente (fluxo 2.1) e mostra o que já há; nenhum mês é inventado no front.
 */
@Component({
  selector: 'bios-sector-evolution',
  imports: [
    EmptyState,
    ErrorState,
    LoadingState,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    SectorChart,
    SectorWindowsTable,
  ],
  templateUrl: './sector-evolution.html',
  styleUrl: './sector-evolution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorEvolution {
  private readonly api = inject(BiosApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sectorInput = viewChild.required<ElementRef<HTMLInputElement>>('sectorInput');

  protected readonly messageOf = fieldMessage;

  /** Setor e ODS da URL: a única fonte da consulta. */
  protected readonly criteria = toSignal(
    this.route.queryParams.pipe(map((params) => sectorCriteriaFromParams(params))),
    { initialValue: sectorCriteriaFromParams(this.route.snapshot.queryParams) },
  );
  protected readonly requested = computed(() => isCompleteSectorCriteria(this.criteria()));

  /** Os setores com janela registrada, com a descrição oficial da CNAE 2.3 (regra 6). */
  protected readonly sectors = resource({ loader: () => this.api.listSectors() });
  /** Os ODS que o BIOS calcula, para o seletor. */
  protected readonly odsList = resource({ loader: () => this.api.listOds() });

  protected readonly evolution = resource({
    params: () => {
      const criteria = this.criteria();

      return isCompleteSectorCriteria(criteria) ? criteria : undefined;
    },
    loader: ({ params: { cnae, ods } }) =>
      this.api.getSectorEvolution({ path: { cnae }, query: { ods } }),
  });

  protected readonly form = new FormGroup({
    cnae: new FormControl('', { nonNullable: true, validators: [(c) => sectorCnaeRule(c)] }),
    ods: new FormControl<number | null>(null, {
      validators: [(control) => Validators.required(control)],
    }),
  });

  protected readonly typedCnae = toSignal(this.form.controls.cnae.valueChanges, {
    initialValue: '',
  });

  /** As sugestões do campo de setor, filtradas pelo que a pessoa digitou (código ou nome). */
  protected readonly sectorSuggestions = computed(() => {
    const sectors = this.sectors.hasValue() ? this.sectors.value().data : [];
    const typed = this.typedCnae().trim();
    const digits = sectorCnaeDigits(typed);
    const words = searchable(typed);

    if (typed === '') return sectors;

    return sectors.filter(
      (sector) =>
        (/^\d+$/.test(digits) &&
          (digits.startsWith(sector.cnae_division) || sector.cnae_division.startsWith(digits))) ||
        searchable(sector.description).includes(words),
    );
  });

  protected readonly odsOptions = computed(() =>
    this.odsList.hasValue() ? this.odsList.value().data : [],
  );

  /** "24 — METALURGIA no ODS 13", para os títulos e o resumo do gráfico. */
  protected readonly subject = computed(() => {
    if (!this.evolution.hasValue()) return '';

    const evolution = this.evolution.value();

    return `${evolution.cnae_division} — ${evolution.cnae_division_description} no ODS ${evolution.ods_number}`;
  });

  /**
   * A falha da consulta. Erro de campo (CNAE fora do formato ou divisão inexistente na CNAE 2.3)
   * vai para o próprio campo, com a mensagem da API; o resto, para o estado de erro.
   */
  protected readonly failure = computed(() => {
    if (this.evolution.status() !== 'error') return null;

    const error = this.evolution.error();
    const view = describeError(error);

    return { error, view, fieldMessages: view.fieldErrors.map((field) => field.message) };
  });

  constructor() {
    // A URL manda: ao abrir um link, ao consultar e ao voltar pelo navegador, o formulário mostra
    // o setor e o ODS da consulta exibida.
    effect(() => {
      const criteria = this.criteria();

      untracked(() => {
        this.form.reset({ cnae: criteria.cnae ?? '', ods: criteria.ods });
      });
    });

    // Sem ODS na URL, o seletor começa no primeiro calculado: só falta escolher o setor.
    effect(() => {
      const first = this.odsOptions()[0];

      untracked(() => {
        if (first && this.form.controls.ods.value === null) {
          this.form.controls.ods.setValue(first.ods_number);
        }
      });
    });

    // O erro de campo da API aparece no campo, como se a pessoa tivesse acabado de enviar.
    effect(() => {
      const failure = this.failure();

      untracked(() => {
        if (failure?.view.kind === 'validation') applyApiErrors(this.form, failure.view);
      });
    });
  }

  /** Título de um ODS na lista dos calculados (`ODS 13 — Ação contra...`). */
  protected odsTitle(ods: number): string {
    const found = this.odsOptions().find((item) => item.ods_number === ods);

    return found ? `ODS ${ods} — ${found.title}` : `ODS ${ods}`;
  }

  protected async show(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const { cnae, ods } = this.form.getRawValue();

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: sectorCriteriaToParams({ cnae: sectorCnaeDigits(cnae.trim()), ods }),
    });
  }

  protected clearSector(): void {
    this.form.controls.cnae.setValue('');
    this.sectorInput().nativeElement.focus();
  }

  private focusFirstInvalid(): void {
    afterNextRender(
      () => {
        this.host.nativeElement
          .querySelector<HTMLElement>('input[aria-invalid="true"], mat-select[aria-invalid="true"]')
          ?.focus();
      },
      { injector: this.injector },
    );
  }
}
