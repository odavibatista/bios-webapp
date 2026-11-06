import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  type FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, startWith, Subject, switchMap } from 'rxjs';
import { BiosApi } from '../../../core/api/bios-api';
import { fieldMessage, RULES_ERROR_KEY } from '../account-rules';
import { FOREIGN_UF } from '../address-rules';

/** Espera depois da última tecla, para não consultar a cada letra. */
const SEARCH_DELAY_MS = 200;

/** Quantos municípios a lista mostra de uma vez: quem não achou digita mais. */
const OPTIONS_LIMIT = 50;

export const CHOOSE_CITY_MESSAGE = 'Escolha um município da lista.';

/**
 * O município digitado precisa ter vindo da lista (RF38). `keptName` é o nome já aceito antes,
 * como o endereço gravado sem código ou um link antigo com o nome: esse continua valendo.
 */
export function chosenCityRule(keptName: () => string | null | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    const text = value.trim();
    const code = control.parent?.get('city_ibge_code')?.value as string | undefined;

    return text === '' || code || text === keptName()
      ? null
      : { [RULES_ERROR_KEY]: [CHOOSE_CITY_MESSAGE] };
  };
}

/**
 * Município ligado à UF (UC05, UC08, RF38): desabilitado até haver UF, oferece só os municípios
 * dela e filtra pelo trecho digitado, sem distinguir acento nem caixa. O nome e o código ficam nos
 * controles de quem usa; trocar a UF, e portanto limpar os dois, cabe ao formulário.
 */
@Component({
  selector: 'bios-city-field',
  imports: [MatAutocompleteModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [formControl]="text()"
        [matAutocomplete]="list"
        autocomplete="off"
        (focus)="active.set(true)"
        (input)="typed()"
        (blur)="settle()"
      />
      <mat-autocomplete
        #list="matAutocomplete"
        hideSingleSelectionIndicator
        (optionSelected)="choose($event.option.value)"
      >
        @if (cities.error()) {
          <mat-option value="" class="retry" (onSelectionChange)="retry($event)">
            Não foi possível carregar. Tentar de novo
          </mat-option>
        } @else if (cities.isLoading()) {
          <mat-option disabled>Buscando municípios…</mat-option>
        } @else {
          @for (city of options(); track city.ibge_code) {
            <mat-option [value]="city.name">{{ city.name }}</mat-option>
          } @empty {
            <mat-option disabled>Nenhum município encontrado nesta UF.</mat-option>
          }
        }
      </mat-autocomplete>
      <mat-hint>{{ fieldHint() }}</mat-hint>
      <mat-error>{{ messageOf(text()) }}</mat-error>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    mat-form-field {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityField {
  private readonly api = inject(BiosApi);
  private readonly announcer = inject(LiveAnnouncer);

  /** A UF escolhida no campo anterior. */
  readonly ufControl = input.required<FormControl<string>>();
  /** O nome do município, como aparece no campo. */
  readonly text = input.required<FormControl<string>>();
  /** O código IBGE do município escolhido; vazio enquanto nada foi escolhido da lista. */
  readonly code = input.required<FormControl<string>>();
  readonly label = input('Município');
  readonly hint = input('Digite parte do nome e escolha na lista.');

  protected readonly messageOf = fieldMessage;

  /** Só consulta depois que a pessoa chega ao campo. */
  protected readonly active = signal(false);

  private readonly keystrokes = new Subject<string>();
  private readonly term = toSignal(this.keystrokes.pipe(debounceTime(SEARCH_DELAY_MS)), {
    initialValue: '',
  });

  protected readonly uf = toSignal(
    toObservable(this.ufControl).pipe(
      switchMap((control) => control.valueChanges.pipe(startWith(control.value))),
    ),
    { initialValue: '' },
  );

  protected readonly cities = resource({
    params: () => {
      const uf = this.uf();

      return this.active() && this.hasCities(uf) ? { uf, search: this.term() } : undefined;
    },
    loader: ({ params: { uf, search } }) =>
      this.api.listCities({ path: { uf }, query: { search, page: 1, page_size: OPTIONS_LIMIT } }),
  });

  protected readonly options = computed(() =>
    this.cities.hasValue() ? this.cities.value().data : [],
  );

  /** Sem UF, não há lista; no exterior, a lista do IBGE não se aplica. */
  private hasCities(uf: string): boolean {
    return uf !== '' && uf !== FOREIGN_UF;
  }

  protected readonly fieldHint = computed(() => {
    const uf = this.uf();

    if (uf === FOREIGN_UF) return 'Sem município no exterior.';

    return uf ? this.hint() : 'Escolha a UF primeiro.';
  });

  constructor() {
    effect(() => {
      const uf = this.uf();
      const text = this.text();

      untracked(() => {
        if (this.hasCities(uf)) text.enable({ emitEvent: false });
        else text.disable({ emitEvent: false });
      });
    });

    // A lista muda sem mover o foco: o leitor de tela precisa ouvir quantas opções há.
    effect(() => {
      if (!this.cities.hasValue() || this.cities.isLoading()) return;

      const { total } = this.cities.value().pagination;

      void this.announcer.announce(
        total === 1 ? '1 município encontrado' : `${String(total)} municípios encontrados`,
      );
    });

    toObservable(this.text)
      .pipe(
        switchMap((control) => control.valueChanges),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // O texto voltou ao vazio (limpar, trocar a UF): a próxima busca começa do zero.
        if (this.text().value === '') this.keystrokes.next('');
      });
  }

  protected typed(): void {
    this.code().setValue('');
    this.text().updateValueAndValidity();
    this.keystrokes.next(this.text().value);
  }

  protected choose(name: string): void {
    const city = this.options().find((option) => option.name === name);

    if (!city) return;

    this.code().setValue(city.ibge_code);
    this.text().updateValueAndValidity();
    this.keystrokes.next(city.name);
  }

  /** Digitou o nome inteiro e saiu do campo: vale como escolhido, sem obrigar a abrir a lista. */
  protected settle(): void {
    const typed = this.text().value.trim().toLocaleLowerCase('pt-BR');

    if (this.code().value || typed === '') return;

    const same = this.options().find((city) => city.name.toLocaleLowerCase('pt-BR') === typed);

    if (same) {
      this.text().setValue(same.name);
      this.choose(same.name);
    }
  }

  protected retry({ isUserInput }: { isUserInput: boolean }): void {
    if (isUserInput) this.cities.reload();
  }
}
