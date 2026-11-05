import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  Injector,
  input,
} from '@angular/core';
import { type AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CNPJ_ERROR_KEY, cnpjRule, parseCnpj } from '../../../shared/cnpj/cnpj';
import { nameRule } from '../../search/search-rules';
import { RULES_ERROR_KEY } from '../../../shared/forms/account-rules';
import { COMPANIES_PATH } from '../companies-path';

/** Um número que parece CNPJ continua no fluxo de validação do CNPJ. */
function looksLikeCnpj(value: string): boolean {
  return /^[\d.\-/\s]+$/.test(value) || /^[A-Za-z\d]{12}\d{2}$/.test(value.trim());
}

export const companyLookupRule = (control: AbstractControl) => {
  const value = String(control.value ?? '').trim();
  if (parseCnpj(value)) return null;
  if (looksLikeCnpj(value)) return cnpjRule(control);
  if (!value) return { [CNPJ_ERROR_KEY]: 'Informe um CNPJ ou o nome da empresa.' };
  // Recusa sintaxe de comando e controles; a API continua responsavel pela seguranca da consulta.
  if (/[\p{Cc}\p{Cf}<>;=`\\{}]/u.test(value) || /--|\/\*|\*\//.test(value)) {
    return { [CNPJ_ERROR_KEY]: 'Informe um CNPJ ou nome válido para pesquisar.' };
  }
  const errors = nameRule(control);
  return errors ? { [CNPJ_ERROR_KEY]: (errors[RULES_ERROR_KEY] as string[])[0] } : null;
};

export { COMPANIES_PATH };

/**
 * Campo único de busca (UC06; #24 e #31). CNPJ válido abre o perfil; texto válido abre a lista
 * local por nome. A validação acontece antes de chamar a API.
 *
 * - `form`: campo com rótulo, dica e erro (painel e `/empresas`).
 * - `toolbar`: compacto, para a barra do topo. Entrada inválida mostra um aviso sem navegar.
 */
@Component({
  selector: 'bios-cnpj-search',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cnpj-search.html',
  styleUrl: './cnpj-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnpjSearch {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly variant = input<'form' | 'toolbar'>('form');
  /** Valor já digitado ou presente na URL, conferido ao abrir. */
  readonly initial = input<string>();

  /** Conferido no envio: sair do campo vazio não acusa erro. */
  protected readonly form = new FormGroup(
    {
      cnpj: new FormControl('', { nonNullable: true, validators: [companyLookupRule] }),
    },
    { updateOn: 'submit' },
  );

  private get cnpj(): FormControl<string> {
    return this.form.controls.cnpj;
  }

  constructor() {
    effect(() => {
      const initial = this.initial();
      if (initial) {
        this.cnpj.setValue(initial);
        this.cnpj.markAsTouched();
      }
    });
  }

  protected errorMessage(): string | null {
    const message: unknown = this.cnpj.errors?.[CNPJ_ERROR_KEY];

    return typeof message === 'string' ? message : null;
  }

  protected async submit(): Promise<void> {
    const value = this.cnpj.value.trim();
    const cnpj = parseCnpj(value);

    if (cnpj) {
      await this.router.navigate([COMPANIES_PATH, cnpj]);
      if (this.variant() === 'toolbar') this.cnpj.reset();
      return;
    }

    if (this.cnpj.valid) {
      await this.router.navigate([COMPANIES_PATH], { queryParams: { nome: value } });
      if (this.variant() === 'toolbar') this.cnpj.reset();
      return;
    }

    if (this.variant() === 'toolbar') {
      this.snackBar.open('Informe um CNPJ ou nome válido para pesquisar', 'Fechar', {
        duration: 4000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      this.host.nativeElement.querySelector('input')?.focus();
      return;
    }

    this.cnpj.markAsTouched();
    afterNextRender(() => this.host.nativeElement.querySelector('input')?.focus(), {
      injector: this.injector,
    });
  }
}
