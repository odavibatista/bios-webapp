import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  type OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CNPJ_ERROR_KEY, cnpjRule, parseCnpj } from '../../../shared/cnpj/cnpj';

/** Caminho da consulta por CNPJ (`/empresas`) e do perfil (`/empresas/:cnpj`). */
export const COMPANIES_PATH = '/empresas';

/**
 * Campo de busca por CNPJ (UC06, passos 1–2; #24). O CNPJ é conferido aqui, com o algoritmo da
 * API, antes de qualquer chamada (fluxo 2.1); válido, abre `/empresas/<cnpj normalizado>`, sem a
 * máscara na URL.
 *
 * - `form`: campo com rótulo, dica e erro (painel e `/empresas`).
 * - `toolbar`: compacto, para a barra do topo. CNPJ inválido leva a `/empresas`, que mostra o erro
 *   no campo completo.
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
export class CnpjSearch implements OnInit {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly variant = input<'form' | 'toolbar'>('form');
  /** CNPJ já digitado (ex.: o que veio da barra), conferido ao abrir. */
  readonly initial = input<string>();

  /** Conferido no envio: sair do campo vazio não acusa erro. */
  protected readonly form = new FormGroup(
    {
      cnpj: new FormControl('', { nonNullable: true, validators: [cnpjRule] }),
    },
    { updateOn: 'submit' },
  );

  private get cnpj(): FormControl<string> {
    return this.form.controls.cnpj;
  }

  ngOnInit(): void {
    const initial = this.initial();

    if (initial) {
      this.cnpj.setValue(initial);
      this.cnpj.markAsTouched();
    }
  }

  protected errorMessage(): string | null {
    const message: unknown = this.cnpj.errors?.[CNPJ_ERROR_KEY];

    return typeof message === 'string' ? message : null;
  }

  protected async submit(): Promise<void> {
    const cnpj = parseCnpj(this.cnpj.value);

    if (cnpj) {
      await this.router.navigate([COMPANIES_PATH, cnpj]);
      if (this.variant() === 'toolbar') this.cnpj.reset();
      return;
    }

    if (this.variant() === 'toolbar') {
      await this.router.navigate([COMPANIES_PATH], { queryParams: { cnpj: this.cnpj.value } });
      this.cnpj.reset();
      return;
    }

    this.cnpj.markAsTouched();
    afterNextRender(() => this.host.nativeElement.querySelector('input')?.focus(), {
      injector: this.injector,
    });
  }
}
