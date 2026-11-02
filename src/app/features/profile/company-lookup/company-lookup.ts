import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CnpjSearch } from '../cnpj-search/cnpj-search';

/**
 * Consulta de empresas (`/empresas`; UC06, passo 1; #24): o campo de CNPJ. O `?cnpj=` traz o que
 * foi digitado na barra do topo quando não era válido, para o erro aparecer no campo. A busca por
 * razão social ou nome fantasia (FE-16) entra nesta página.
 */
@Component({
  selector: 'bios-company-lookup',
  imports: [CnpjSearch],
  template: `
    <h1>Empresas</h1>
    <p class="lead">
      Informe o CNPJ para ver os dados cadastrais da empresa e, a partir deles, as evidências
      ambientais e o índice de aderência por ODS.
    </p>
    <bios-cnpj-search [initial]="cnpj()" />
  `,
  styles: `
    h1 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-headline-medium);
      color: var(--bios-brand-green);
    }

    .lead {
      max-width: 70ch;
      margin: 0 0 1.5rem;
      color: var(--bios-brand-moss);
    }

    bios-cnpj-search {
      max-width: 36rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyLookup {
  /** CNPJ digitado na barra do topo que não passou na conferência (`?cnpj=`). */
  readonly cnpj = input<string>();
}
